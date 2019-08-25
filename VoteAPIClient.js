const axios = require('axios');

const baseURL = "https://ik1-309-14844.vs.sakura.ne.jp/lva"

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
    return {result: true, data: ret.data.data}
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

(async() => {
  console.log(await this.getDelegatesList(1))
})()