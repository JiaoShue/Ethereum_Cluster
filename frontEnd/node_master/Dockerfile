FROM ethereum/client-go

# 安装nodejs
RUN apk add --update curl sudo nodejs npm bash python
RUN sudo su root && sudo apk add --no-cache alpine-sdk
RUN sudo su root && sudo npm config set registry https://registry.npm.taobao.org && sudo npm install n -g --unsafe-perm=true --allow-root
RUN sudo su root && sudo n stable

# 安装solc编译器
RUN sudo su root && sudo npm install -g solc --unsafe-perm=true --allow-root

# 安装git和web3.js
RUN sudo su root && sudo apk add git

# 将需要的配置文件挂载到docker上
COPY ./config/genesis.json /opt/genesis.json
COPY ./config/password.txt /opt/password.txt
COPY ./config/bootstrap.sh /opt/bootstrap.sh

EXPOSE 3000
WORKDIR /opt

RUN sudo su root && sudo mkdir privatechain

COPY ./config/keystore /opt/privatechain/keystore

RUN sudo su root && chmod 777 /opt/bootstrap.sh && chmod 777 /opt/genesis.json

RUN sudo su root && sudo geth --datadir privatechain init genesis.json

RUN sudo su root && sudo mkdir -p /opt/node

COPY ${PWD} /opt/node
WORKDIR /opt


ENTRYPOINT [ "sh", "/opt/bootstrap.sh" ]
