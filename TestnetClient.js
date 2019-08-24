const axios = require('axios');

const nodes = {
  main: [
    "https://node01.lisk.io:443/api",
    "https://node02.lisk.io:443/api",
    "https://node03.lisk.io:443/api",
    "https://node04.lisk.io:443/api",
    "https://node05.lisk.io:443/api",
    "https://node06.lisk.io:443/api",
    "https://node07.lisk.io:443/api",
    "https://node08.lisk.io:443/api"
  ],
  test: [
    "https://testnet.lisk.io:443/api"
  ]
}

exports.createClient = (isTestnet) => {
  const ary = isTestnet? nodes.test: nodes.main;
  const baseURL = ary[Math.floor(Math.random() * ary.length)];
  const client = axios.create({
    baseURL: baseURL,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    responseType: 'json'  
  });
  return client;
}

exports.getAccountByAddress = async(address, isTestnet) => {
  try {
    const client = exports.createClient(isTestnet);
    const ret = await client.get(`/accounts?address=${address}`);
    if (!ret || !ret.data || !ret.data.data || ret.data.data.length === 0) {
      return {result: false, data: 'Not Found'}
    }
    return {result: true, data: ret.data.data[0]}
  } catch (err) {
    return {result: false, data: err}
  }
}
