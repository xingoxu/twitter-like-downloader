const path = require('path'),
  fs = require('fs');
const { wait } = require('./wait');

let downloadPath = path.resolve(__dirname, '../download');

let httpClient = require('request');

let downloading = 0;

const download = (url, filename, dirname) => new Promise((resolve, reject) => {
  if (!fs.existsSync(`${downloadPath}/${dirname}`))
    fs.mkdirSync(`${downloadPath}/${dirname}`);
  downloading++;
  httpClient(url).on('error', reject).pipe(fs.createWriteStream(`${downloadPath}/${dirname}/${filename}`)).on('close', resolve).on('error', reject);
}).then(() => {
  downloading--;
  console.log('downloading: ', downloading);
}).catch(err => {
  console.error(err);
  downloading--;
  console.log(url, filename);
  return;
});

module.exports = {
  download
};