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

let favIdsString = fs.readFileSync(path.resolve(__dirname, '../download/favIds.txt'), { encoding: 'utf8' });
let favNotAdded = '';

let promises = favIdsString.split('\n').map(id => {
  id = id.trim();
  if (id == '')
    return Promise.resolve();
  return addFav(id).catch(err => {
    favNotAdded += `${id}\n`;
  });
});

Promise.all(promises).then(_ => {
  console.log('completed');
  fs.writeFile(path.resolve(__dirname, '../download/favNotAdded.txt'), favNotAdded, {encoding: 'utf8'}, function (err) {
     if (err) {
       console.error(err);
     }
  });
});