const os = require('os');
const express = require('express');
const next = require('next');
const Redis = require('ioredis');
const schedule = require('node-schedule');
const {
  exec
} = require('child_process');
const {
  writeChunkToScreen
} = require('./server/utils');

let redis;
const dev = process.env.NODE_ENV !== 'production';
const app = next({
  dev
});
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    const server = express();
    const httpServer = require('http').Server(server);
    const io = require('socket.io')(httpServer);

    const j = schedule.scheduleJob('*/1 * * * * *', function() {
      try {
        exec('docker stats --no-stream --format "{{.Name}}: {cpu: {{.CPUPerc}}, mem: {{.MemPerc}}}"', (err, stdout) => {
          if (err) {
            console.log(err);
            return;
          }
          io.sockets.emit('stats', stdout);
        });
      } catch (err) {
        console.log(err);
      }
    });

    server.use(express.json());
    server.use(express.urlencoded({
      extended: true
    }));

    server.all('*', function(req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'X-Requested-With');
      res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
      next();
    });


    server.get('/p/:id', (req, res) => {
      const actualPage = '/post';
      const queryParams = { id: req.params.id };
      app.render(req, res, actualPage, queryParams);
    });

    server.get('*', (req, res) => handle(req, res));

    /**
     * 重连redis
     */
    server.post('/reopen', (req, res) => {
      console.log('尝试重连redis');
      if (!redis) {
        try {
          redis = new Redis({
            port: 6379, // Redis port
            host: '127.0.0.1' // Redis host
          });
          redis.subscribe('SayHi');
          redis.subscribe('BlockInfo');
          redis.on('message', (channel, message) => {
            if (channel === 'SayHi' && message === 'Hi') {
              console.log('接收到订阅事件');
              io.sockets.emit('onLoad');
            } else if (channel === 'BlockInfo') {
              console.log('接收到新区块信息');
              io.sockets.emit('BlockInfo', {
                message
              });
            }
          });
          console.log('重连完毕');
          res.json({
            status: 'success'
          });
        } catch (err) {
          console.warn('连接到redis失败!');
          res.json({
            status: 'error'
          });
        }
      } else {
        res.json({
          status: 'success'
        });
        console.log('已存在redis链接');
      }
    });

    server.post('/getIP', (req, res) => {
      const ifaces = os.networkInterfaces();
      let ip = '127.0.0.1';
      for (const dev in ifaces) {
        ifaces[dev].forEach((details, alias) => {
          if (details.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
            ip = alias.address;
          }
        });
      }
      res.json({
        ip: ip
      });
    });

    /**
     * 初始化集群
     */
    server.post('/start', (req, res) => {
      if (redis) {
        redis.disconnect();
        redis = null;
      }
      if (!req.body.nodeNum || isNaN(req.body.nodeNum)) {
        io.sockets.emit('newMsg', {
          data: '缺少参数: nodeNum'
        });
        res.json({
          err: '缺少参数: nodeNum'
        });
        io.sockets.emit('close', {
          status: 'error'
        });
        return;
      }
      console.log(`启动节点数: ${req.body.nodeNum}`);
      const p = exec(`docker-compose up -d --scale node_slaver=${req.body.nodeNum}`, (err, stdout, stderr) => {
        if (err) {
          console.log(err);
          res.json({
            err: `${err}`,
            status: 'error'
          });
          io.sockets.emit('close', {
            status: 'error'
          });
          return;
        }
        res.json({
          data: `${stderr}`,
          status: 'success'
        });
        io.sockets.emit('close', {
          status: 'success'
        });
        if (!redis) {
          try {
            redis = new Redis({
              port: 6379, // Redis port
              host: '127.0.0.1' // Redis host
            });
            redis.subscribe('SayHi');
            redis.subscribe('BlockInfo');
            redis.on('message', (channel, message) => {
              if (channel === 'SayHi' && message === 'Hi') {
                console.log('接收到订阅事件');
                io.sockets.emit('onLoad');
                console.log(channel, message);
              } else if (channel === 'BlockInfo') {
                console.log('接收到新区块信息');
                io.sockets.emit('BlockInfo', {
                  message
                });
              }
            });
          } catch (err) {
            console.warn('连接到redis失败!');
          }
        }
      });
      p.stderr.on('data', (chunk) => {
        console.log(chunk);
        io.sockets.emit('newMsg', {
          data: chunk
        });
        writeChunkToScreen(chunk);
      });
    });

    /**
     * 重启集群
     */
    server.post('/restart', (req, res) => {
      try {
        const p = exec('docker start $(docker ps -aq)', (err, stdout, stderr) => {
        /**
         * 格式为docker-compose restar七[options) [SERVICE ...)。
重启项目中的服务。
选项包括飞， －－巨meou七T工MEOUT: 指定重启前停止容器的超时（默认为10秒）。
         */
          if (err) {
            res.json({
              data: err
            });
            return;
          }
          if (!redis) {
            try {
              redis = new Redis({
                port: 6379, // Redis port
                host: '127.0.0.1' // Redis host
              });
              redis.subscribe('SayHi');
              redis.subscribe('BlockInfo');
              redis.on('message', (channel, message) => {
                if (channel === 'SayHi' && message === 'Hi') {
                  console.log('接收到订阅事件');
                  io.sockets.emit('onLoad');
                } else if (channel === 'BlockInfo') {
                  console.log('接收到新区块信息');
                  io.sockets.emit('BlockInfo', {
                    message
                  });
                }
              });
            } catch (err) {
              console.warn('连接到redis失败!');
            }
          }
          res.json({
            data: `${stderr}`
          });
        });
        p.stderr.on('data', writeChunkToScreen);
      } catch (err) {
        console.log(err);
        res.json({
          data: err
        });
      }
    });

    /**
     * 检查集群状况
     */
    server.post('/check', (req, res) => {
      try {
        const p = exec('docker ps -a', (err, stdout) => {
          if (err) {
            res.json({
              data: err
            });
            return;
          }
          if (stdout.split('\n')[1]) {
            console.log(stdout.split('\n')[1]);
            res.json({
              status: 'success',
              data: stdout.split('\n').length - 2
            });
          } else {
            res.json({
              status: 'empty'
            });
          }
        });
        p.stdout.on('data', writeChunkToScreen);
      } catch (err) {
        console.log(err);
        res.json({
          data: err
        });
      }
    });

    /**
     * 暂停集群
     * docker-compose stop?
     */
    server.post('/stop', (req, res) => {
      try {
        if (redis) {
          redis.disconnect();
          redis = null;
        }
        const p = exec('docker stop $(docker ps -aq)', (err, stdout, stderr) => {
          if (err) {
            res.json({
              data: err
            });
            return;
          }
          res.json({
            data: `${stderr}`
          });
        });
        p.stderr.on('data', writeChunkToScreen);
      } catch (err) {
        console.log(err);
        res.json({
          data: err
        });
        return;
      }
    });

    /**
     * 移除集群
     * 为docker-compose rm [options) [SERVICE ...)。
删除所有（停止状态的） 服务容器。推荐先执行docker-compose stop 命令来停止容器。
选项：
0 -f, --force: 强制直接删除， 包括非停止状态的容器。一般尽量不要使用该选项。
0 -v: 删除容器所挂载的数据卷。
     */
    server.post('/clean', (req, res) => {
      if (redis) {
        redis.disconnect();
        redis = null;
      }
      try {
        const p1 = exec('docker rm $(docker ps -aq)', (err, stdout, stderr) => {
          if (err) {
            console.log(err);
            res.json({
              data: err
            });
            return;
          }
          res.json({
            data: `${stderr}`
          });
        });
        p1.stderr.on('data', (chunk) => {
          writeChunkToScreen(chunk);
        });
      } catch (err) {
        console.log(err);
        res.json({
          data: err
        });
      }
    });
    httpServer.listen(3000, (err) => {
      if (err) throw err;
      console.log('> Ready on http://localhost:3000');
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
