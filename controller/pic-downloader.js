const path = require('path'),
  fs = require('fs');
const { wait } = require('./wait');

let downloadPath = path.resolve(__dirname, '../', process.env['download_path']);
let httpClient = require('request');


const download = (url, filename, dirname) => new Promise((resolve, reject) => {
  if (!fs.existsSync(`${downloadPath}/${dirname}`))
    fs.mkdirSync(`${downloadPath}/${dirname}`);
  httpClient(url).on('error', reject).pipe(fs.createWriteStream(`${downloadPath}/${dirname}/${filename}`)).on('close', resolve).on('error', reject);
});

module.exports = {
  download
};