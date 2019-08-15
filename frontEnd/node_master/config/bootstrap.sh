#!bin/bash
nohup geth --rpcapi eth,web3,admin,miner,personal,clique        \
--rpc --rpcaddr="0.0.0.0" --rpccorsdomain="*"                   \
--maxpeers '5' --networkid '58648' --datadir '/opt/privatechain' \
--syncmode "full" --allow-insecure-unlock                       \
--unlock "0xcd34d1fcc8f2284fa2af8ea18d6c7d0b60ee17f5" --password "/opt/password.txt" --cache=2048 &
cd /opt/node
npm install web3@1.0.0-beta.48
npm run dev
