import fetch from 'isomorphic-unfetch';

export const startETH = async (nodeNum) => await fetch("/start", {
  method: 'POST',
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    nodeNum
  })
});

export const restartETH = async () => await fetch("/restart", {
  method: 'POST',
  headers: {
    "Content-Type": "application/json"
  }
});

export const stopETH = async () => await fetch("/stop", {
  method: 'POST',
  headers: {
    "Content-Type": "application/json"
  }
});

export const checkCluster = async () => await fetch(`${MASTER_API}/check`, {
  method: 'POST',
  headers: {
    "Content-Type": "application/json"
  }
});

export const checkStats = async () => await fetch(`${MASTER_API}/stats`, {
  method: 'POST',
  headers: {
    "Content-Type": "application/json"
  }
});

export const cleanETH = async () => await fetch("/clean", {
  method: 'POST',
  headers: {
    "Content-Type": "application/json"
  }
});

export const reopenRedis = async () => await fetch(`${MASTER_API}/reopen`, {
  method: 'POST',
  headers: {
    "Content-Type": "application/json"
  }
});


export const getNodeList = async () => await fetch(`${NODE_MASTER_API}/NodeList`, {
  method: "POST"
});

export const getAccountList = async () => await fetch(`${NODE_MASTER_API}/AccountList`, {
  method: "GET"
});

export const getSignerList = async () => await fetch(`${NODE_MASTER_API}/getAllSigner`, {
  method: "POST"
});

export const uploadContract = async (formData) => await fetch(`${NODE_MASTER_API}/getNewContract`, {
  method: 'POST',
  body: formData,
});

export const getContractList = async () => await fetch(`${NODE_MASTER_API}/getAllContractInfo`, {
  method: "POST"
});

export const deployContract = async (name) => await fetch(`${NODE_MASTER_API}/deployContract`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: name
  })
});
export const execContractMethod = async (name,method,callType,params) => await fetch(`${NODE_MASTER_API}/execContractMethod`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: name,
    method:method,
    callType:callType,
    params:params
    
  })
});

export const dropContract = async (name) => await fetch(`${NODE_MASTER_API}/dropContract`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: name
  })
});

export const startMining = async () => await fetch(`${NODE_MASTER_API}/startMining`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
});

export const stopMining = async () => await fetch(`${NODE_MASTER_API}/stopMining`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
});

export const newAccount = async () => await fetch(`${NODE_MASTER_API}/newAccount`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
});

export const newActiveAccount = async (password) => await fetch(`${NODE_MASTER_API}/newActiveAccount`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    password
  })
});

export const importPK = async (importAccount) => await fetch(`${NODE_MASTER_API}/importPrivateKey`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(importAccount)
});

export const raiseNewSigner = async (address) => await fetch(`${NODE_MASTER_API}/raiseNewSigner`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    address
  })
});

export const setCoinBase = async (newMiner) => await fetch(`${NODE_MASTER_API}/setCoinBase`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(newMiner)
});

export const getBlockInfo = async (data) => await fetch(`${NODE_MASTER_API}/getBlockInfo`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    number: data
  })
});

export const getTransaction = async (txID) => await fetch(`${NODE_MASTER_API}/getTransaction`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    txID: txID
  })
});

export const sendTransaction = async (sourceAccount,txPassword,distAccount,amount) => await fetch(`${NODE_MASTER_API}/sendTransaction`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    sourceAccount:sourceAccount,
    txPassword:txPassword,
    distAccount:distAccount,
    amount:amount
  })
});

const ip = process.env.NODE_ENV === 'production' ? '120.27.209.183' : 'localhost';
const NODE_MASTER_API =  `http://${ip}:7001`;
const MASTER_API =  `http://${ip}:3000`;


