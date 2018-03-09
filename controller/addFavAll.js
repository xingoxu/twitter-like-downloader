const httpClient = require('request');
const fs = require('fs');
const path = require('path');
// const { wait } = require('./wait');

const getOauthObj = () => ({
  consumer_key: process.env['Consumer_Key'],
  consumer_secret: process.env["Consumer_Secret"],
  token: process.env['Access_Token'],
  token_secret: process.env['Access_Token_Secret']
});

const addFav = id_str => new Promise((resolve, reject) => {
  httpClient.post({
    // url: 'https://api.twitter.com/1.1/favorites/destroy.json',
    url: 'https://api.twitter.com/1.1/favorites/create.json',
    oauth: getOauthObj(),
    form: {
      id: id_str
    }
  }, (err, res, body) => {
    if (err) {
      console.error(err);
      return reject(err);
    }
    if (res.statusCode === 429) {
      return reject('Too many request 429');
    }
    resolve(body);
  });
});

let promise = `899655119767191552
892395624338935808
889512585980030976
877787740313604096
834704945727221760
823560524050796544
783267447105204224
746385440916152320
635453263542808576
603203007627407361
`.split('\n').map(id => {
    id = id.trim();
    if (id == '')
      return Promise.resolve();
    return addFav(id);
  });

Promise.all(promise).then(_ => {
  console.log('success');
});