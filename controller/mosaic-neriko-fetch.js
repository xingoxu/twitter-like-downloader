/**
 * Created by xingo on 2018/03/06 .
 */

const httpClient = require('request');
const domEnv = require('jsdom').env,
  jQInit = require('jquery');
    
const getHttpHeader = () => ({
  'User-Agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36`,
  'Upgrade-Insecure-Requests': 1,
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
  'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6,zh-TW;q=0.5',
});

function fetchPrivatterPage(url) {
  return new Promise((resolve, reject) => {
    httpClient.get({
      url,
      headers: getHttpHeader()
    }, (err, response, body) => {
      if (err)
        return reject(err);
      resolve(body)
    });
  });
}

function fetchWindow(url) {
  return fetchPrivatterPage(url).then(body => {
    return new Promise((resolve, reject) => {
      domEnv({
        html: body,
        url,
        done: (errors, window) => {
          if (errors)
            return reject(errors);
          let $ = jQInit(window);

          resolve($);
        }
      });
    })
  })
}

function getImageUrls(url) {
  return fetchWindow(url).then($ => {
    let images = $('.photo_wrapper img');
    if (images.length <= 0) {
      return Promise.reject('Mosaic Neriko no images, probably html analyize problem.');
    }
    let imageUrls = [].slice.call(images).map(img => replaceImgResize(img.src));

    function replaceImgResize(src) {
      let maxWidthPos = src.indexOf('&maxwidth=');
      let maxHeightPos = src.indexOf('&maxheight=');
      return src.substring(0, maxWidthPos < maxHeightPos ? maxWidthPos : maxHeightPos);
    }
    return imageUrls;
  });
}


module.exports = {
  getMosaicUrls: getImageUrls
}