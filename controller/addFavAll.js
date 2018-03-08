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
    resolve(body);
  });
});

let promise = `943677533261676546
942388969001512961
941127833174269952
939325998071365632
`.split('\n').map(id => {
    id = id.trim();
    if (id == '')
      return Promise.resolve();
    return addFav(id);
  });

Promise.all(promise).then(_ => {
  console.log('success');
});