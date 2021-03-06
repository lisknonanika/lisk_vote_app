const axios = require('axios');

const baseURL = "https://ysdev.work/lva"

exports.createClient = () => {
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

exports.getDelegatesList = async(net) => {
  try {
    const client = exports.createClient();
    const ret = await client.get(`/delegates?net=${net}`);
    if (!ret.data.result) {
      return {result: false, data: 'Not Found'}
    }
    return {result: true, data: ret.data.data, groupUrl: ret.data.groupUrl}
  } catch (err) {
    return {result: false, data: err}
  }
}

exports.getAccountByAddress = async(address) => {
  try {
    const client = exports.createClient();
    const ret = await client.get(`/account?address=${address}`);
    if (!ret.data.result) {
      return {result: false, data: 'Not Found'}
    }
    return {result: true, data: ret.data.data}
  } catch (err) {
    return {result: false, data: err}
  }
}

exports.broadcast = async(trx) => {
  try {
    const client = exports.createClient();
    const ret = await client.put('/broadcast', trx);
    return {result: ret.data.result}
    
  } catch (err) {
    return {result: false, data: err}
  }
}
