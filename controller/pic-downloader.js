const path = require('path'),
  fs = require('fs');
const { wait } = require('./wait');

let downloadPath = path.resolve(__dirname, '../download');

let httpClient = require('request');

const download = url => new Promise((resolve, reject) => {
  httpClient('https://pbs.twimg.com/media/DXevx5DUMAAKbqn.jpg:orig').pipe(fs.createWriteStream(`${downloadPath}/DXevx5DUMAAKbqn_${Date.now()}.jpg`)).on('close', resolve).on('error', err => reject({
    err,
    url
  }));
}).catch(({ err, url }) => {
  console.error(err);
  return wait(60 * 1000).then(() => download(url));
});

module.exports = {
  download
};