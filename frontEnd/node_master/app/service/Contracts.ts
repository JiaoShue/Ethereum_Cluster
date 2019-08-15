import Web3 from 'web3';
import Logger from './Logger';
import * as fs from 'fs';
import * as path from 'path';
import { FileStream } from 'egg';
import moment from 'moment';
import { exec } from 'child_process';

export default class Contracts extends Logger {
  public static web3: Web3;
  public static blockHeight: number = 0;

  getNewContract(data: FileStream) {
    const dir = path.resolve(__dirname, `../../contract/${data.filename}`);
    this.log(dir);
    return new Promise((resolve, reject) => {
      fs.stat(dir, async (err, stat) => {
        if (err) {
          this.log('没有当前智能合约, 开始创建');
          try {
            const rst = await this.writeContract(dir, data);
            await this.app.redis.set(`${data.fields.name}.hasRaw`, true);
            this.log(`智能合约[${data.filename}]创建成功`);
            resolve(rst);
          } catch (err) {
            reject(err);
          }
        } else if (stat && stat.isFile()) {
          this.log('已经存在同名智能合约文件');
          reject('已经存在同名智能合约文件');
        } else {
          this.log('没有当前智能合约, 开始创建');
          try {
            const rst = await this.writeContract(dir, data);
            await this.app.redis.sadd('contracts', data.filename);
            await this.app.redis.set(`${data.fields.name}.hasRaw`, true);
            this.log(`智能合约[${data.filename}]创建成功`);
            resolve(rst);
          } catch (err) {
            reject(err);
          }
        }
      });
    });
  }

  private async writeContract(dir, data: FileStream) {
    data.pipe(fs.createWriteStream(dir));
    const fsEnd = part => {
      return new Promise((resolve, reject) => {
        part.on('end', () => {
          resolve('写入文件成功');
        });
        part.on('err', err => {
          reject(err);
        });
      });
    };
    return fsEnd(data);
  }

  async dropContract(name: string) {
    const dir = path.resolve(__dirname, `../../contract/${name}.sol`);
    return new Promise((resolve, reject) => {
      fs.stat(dir, async (err, stat) => {
        if (err) {
          this.log('没有目标智能合约');
          reject('没有目标智能合约');
        } else if (stat && stat.isFile()) {
          this.log('存在智能合约文件, 开始删除');
          fs.unlinkSync(dir);
          await this.app.redis.set(`${name}.hasRaw`, false);
          resolve('已经删除文件');
        } else {
          this.log('没有目标智能合约');
          reject('没有目标智能合约');
        }
      });
    });
  }

  private delInnerFile(dir) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      files.forEach((file) => {
        let curPath = dir + '/' + file;
        if (fs.statSync(curPath).isFile()) {
          fs.unlinkSync(curPath); // 删除文件
        }
      });
    }
  }


  async dropAllContract() {
    const dir = path.resolve(__dirname, `../../contract`);
    this.delInnerFile(dir);
    return true;
  }

  private async createNewAccount(password: string = '123456') {
    if (!Contracts.web3) {
      Contracts.web3 = new Web3('http://localhost:8545');
    }
    const result = await Contracts.web3.eth.personal.newAccount(password);
    return result;
  }

  private async getAccounts() {
    const data = await this.ctx.service.gethApi.listAccounts()();
    return await data.data.result;
  }

  async getContract(name: string) {
    if (!Contracts.web3) {
      Contracts.web3 = new Web3('http://localhost:8545');
    }
    const address = await this.app.redis.get(name);
    if (!address) {
      return;
    }
    const abi = await this.app.redis.get(`${name}.abi`);
    if (!abi) {
      return null;
    }
    const Contract = new Contracts.web3.eth.Contract(
      JSON.parse(abi as string),
      address,
    );
    return Contract;
  }

  public async executeContract(name: string, method: any, callType: string, params: any[]) {
    if (!Contracts.web3) {
      Contracts.web3 = new Web3('http://localhost:8545');
    }
    let Contract;
    if (name) {
      Contract = await this.getContract(name);
    } else {
      return {
        status: 'error',
        data: '缺少执行合约的必要信息'
      };
    }
    this.logObj(method);
    this.logObj(params);
    this.logObj(callType);
    const caller = (await this.getAccounts())[0];
    await this.ctx.service.gethApi.unlockAccount(caller, '123456')();
    if (callType === 'send') {
      if (!params)  {
        return await Contract.methods[method]()[callType]({ from: caller , gas: 1000000 })
        .then(res => {
          return {
            status: 'success',
            data: res.transactionHash,
          };
        })
        .catch(err => {
          this.prefixLog(err, '合约调用失败');
        });
      } else {
        return await Contract.methods[method](...params)[callType]({ from: caller , gas: 1000000 })
        .then(res => {
          return {
            status: 'success',
            data: res.transactionHash,
          };
        })
        .catch(err => {
          this.prefixLog(err, '合约调用失败');
        });
      }
    } else if (callType === 'call') {
      if (!params) {
        return await Contract.methods[method]().call()
        .then(res => {
          return {
            status: 'success',
            data: res,
          };
        })
        .catch(err => {
          this.prefixLog(err, '合约调用失败');
        });
      } else {
        return await Contract.methods[method](...params).call()
        .then(res => {
          return {
            status: 'success',
            data: res,
          };
        })
        .catch(err => {
          this.prefixLog(err, '合约调用失败');
        });
      }
    }
  }

  public async searchBlockInfo(data) {
    if (!Contracts.web3) {
      Contracts.web3 = new Web3('http://localhost:8545');
    }

    let block = await Contracts.web3.eth.getBlock(data);
    block = Object.assign({},
      block,
      { signer: (await this.ctx.service.gethApi.getPOABlockSigner(block.hash)()).data.result }
    );
    return block;
  }

  public async getTransaction(txID: string) {
    if (!Contracts.web3) {
      Contracts.web3 = new Web3('http://localhost:8545');
    }
    const txDetail = await Contracts.web3.eth.getTransaction(txID);
    return txDetail;
  }
  public async sendTransaction(sourceAccount: string, txPassword: string, distAccount: string, amount: string) {
    
    
    if (!Contracts.web3) {
      Contracts.web3 = new Web3('http://localhost:8545');
    }
    await this.ctx.service.gethApi.unlockAccount(sourceAccount, txPassword)(); // Contracts.web3.toWei(amount,"ether")
    const txDetail = await Contracts.web3.eth.sendTransaction({ from: sourceAccount, to: distAccount, value: Contracts.web3.utils.toWei(amount, 'ether') });
    return txDetail;
  }

  public async getBlockInfo() {
    let newBlocks: any[] = [];
    if (!Contracts.web3) {
      Contracts.web3 = new Web3('http://localhost:8545');
    }
    const Number = await Contracts.web3.eth.getBlockNumber();
    if (Contracts.blockHeight < Number) {
      newBlocks = await Promise.all(new Array(Number - Contracts.blockHeight).fill(0).map(async (_, index) => {
        const block = await Contracts.web3.eth.getBlock(Contracts.blockHeight + index + 1);
        return Object.assign({},
          block,
          { signer: (await this.ctx.service.gethApi.getPOABlockSigner(block.hash)()).data.result }
        );
      }));
    }
    Contracts.blockHeight = Number;
    const data = JSON.stringify({
      number: Number,
      blocks: newBlocks,
    });
    this.app.redis.publish('BlockInfo', data);
  }

  async getContractAPIList(name: string) {
    const Contract = await this.getContract(name);
    if (!Contract) {
      return null;
    }
    const caller = (await this.getAccounts())[0];
    await this.ctx.service.gethApi.unlockAccount(caller, '123456')();
    return await Contract.methods
      .Multiply(6)
      .send({ from: caller })
      .then(res => {
        this.logObj(res.events.Print.returnValues);
        return Contract.methods.Multiply;
      }).catch(err => {
        this.prefixLog(err, '合约调用失败');
      });
  }

  /**
   * 该方法只会创建一个新的地址和私钥, 但不会导入keyStore
   */
  public async newAccount() {
    if (!Contracts.web3) {
      Contracts.web3 = new Web3('http://localhost:8545');
    }
    return await Contracts.web3.eth.accounts.create();
  }

  /**
   * 该方法接受一个password, 将生成的账户存入keystore中
   */
  public async newActiveAccount(password) {
    if (!Contracts.web3) {
      Contracts.web3 = new Web3('http://localhost:8545');
    }
    return await Contracts.web3.eth.personal.newAccount(password);
  }

  /**
   * 用户导入自己的私钥
   * 这个方法不建议使用, 不安全
   * @param privateKey 私钥
   * @param password 锁定私钥的口令
   */
  public async importPrivateKey(privateKey: string, password: string) {
    if (!Contracts.web3) {
      Contracts.web3 = new Web3('http://localhost:8545');
    }
    const keyStore = await Contracts.web3.eth.accounts.encrypt(privateKey, password);
    const now = moment().format('YYYY-MM-DDTHH-mm-ss.SSSSSSSSS');
    console.log(__dirname);
    const dir = path.resolve(`/opt/privatechain/keystore/${'UTC--' + now + 'Z' + '--' + keyStore.address}`);
    this.log('正在创建新的keyStore:');
    this.log(dir);
    return new Promise((resolve, reject) => {
      fs.stat(dir, async (err, stat) => {
        if (err) {
          this.log('没有Keystore, 开始创建');
          try {
            fs.writeFileSync(dir, JSON.stringify(keyStore));
            this.log('导入keyStore成功');
            resolve(keyStore);
          } catch (err) {
            reject(err);
          }
        } else if (stat && stat.isFile()) {
          this.log('已经存在同名智能合约文件');
          reject('已经存在同名智能合约文件');
        } else {
          this.log('没有Keystore, 开始创建');
          try {
            fs.mkdirSync(dir);
            fs.writeFileSync(dir, JSON.stringify(keyStore));
            this.log('导入keyStore成功');
            resolve(keyStore);
          } catch (err) {
            reject(err);
          }
        }
      });
    });
  }


  /**
   * 部署智能合约
   * @param name
   */
  deployContract(name: string) {
    return new Promise((resolve, reject) => {
      const target = path.resolve(__dirname, `../../contract/${name}.sol`);
      fs.stat(target, async (err, stat) => {
        if (err) {
          this.log('编译失败，没有当前智能合约');
          reject('编译失败，没有当前智能合约');
        } else if (stat && stat.isFile()) {
          this.log('存在智能合约文件, 开始编译');
          exec(`solcjs --bin --abi --optimize -o bin ${target}`, async err => {
            if (err) {
              this.log('solc编译失败');
              reject(err);
            } else {
              this.log('solc编译成功');
              const compiledTarget = path.resolve(__dirname, '../../bin');
              const abi = fs.readFileSync(
                `${compiledTarget}/_opt_node_contract_${name}_sol_${name}.abi`
              );
              const compiled =
                '0x' +
                fs.readFileSync(
                  `${compiledTarget}/_opt_node_contract_${name}_sol_${name}.bin`
                );
              this.log('编译后数据获取完毕');
              this.log(abi.toString());

              if (!Contracts.web3) {
                Contracts.web3 = new Web3('http://localhost:8545');
                this.log('第一次调用, 初始化web3');
              }

              await this.app.redis.set(`${name}.abi`, abi.toString());
              await this.app.redis.set(`${name}.compiled`, compiled.toString());

              this.log('合约元数据写入数据库完毕');
              // await this.ctx.service.node.initAllMiners();
              // this.log('尝试启动所有节点挖矿');
              let starter;
              const accounts = await this.getAccounts();

              if (accounts.length === 0) {
                starter = await this.createNewAccount();
                this.log('新的账户建立完毕, 将作为矿工');
                this.log(`[账户]: ${starter}, [解锁账户的密码]: 123456`);
              } else {
                starter = accounts[0];
              }

              const myContract = new Contracts.web3.eth.Contract(
                JSON.parse(abi.toString())
              );

              this.log('合约对象建立完毕');
              const estimateGas = await Contracts.web3.eth.estimateGas({
                data: compiled
              });

              this.log(`预估的gas: ${estimateGas}`);
              const starterBalance = await Contracts.web3.eth.getBalance(starter);
              if (parseInt(starterBalance, 10) < estimateGas) {
                this.log('账户余额不足');
                reject('账户余额不足');
              }

              await this.ctx.service.node.unlockAllNode();
              this.log('所有miner账户已解锁');

              myContract
                .deploy({
                  data: compiled
                })
                .send({
                  from: starter,
                  gas: estimateGas * 5 > 2000000 ? 2000000 : estimateGas * 5
                })
                .on('error', err => {
                  this.prefixLog(err, '部署合约失败, 原因\n');
                  this.logObj(err);
                  reject(err);
                })
                .on('transactionHash', async transactionHash => {
                  this.log('交易哈希已生成');
                  this.log(`[transactionHash]: ${transactionHash}`);
                  await this.app.redis.set(
                    `${name}.TxHash`,
                    transactionHash
                  );
                })
                .on('receipt', async receipt => {
                  this.log('交易收据已生成');
                  this.log(`[contractAddress]: ${receipt.contractAddress}`);
                  this.log('区块位置: ' + receipt.blockNumber);
                  await this.app.redis.set(
                    `${name}.position`,
                    receipt.blockNumber
                  );
                })
                .on('confirmation', () => {
                  this.log('交易确认中...');
                })
                .then(async newContractInstance => {
                  this.log('智能合约已经成功部署');
                  this.log(`部署地址: ${newContractInstance.options.address}`);
                  this.logObj(newContractInstance.methods);
                  await this.app.redis.set(
                    name,
                    newContractInstance.options.address
                  );
                  resolve({
                    abi: abi.toString(),
                    compiled: compiled.toString(),
                    address: newContractInstance.options.address
                  });
                })
                .catch(err => {
                  this.log('部署失败, 原因');
                  this.logObj(err);
                  reject(err);
                });
            }
          });
        }
      });
    });
  }
}