/**
 * Created by xingo on 2018/03/06 .
 */

const httpClient = require('request');
const domEnv = require('jsdom').env,
  jQInit = require('jquery');
    
const getPrivatterHttpHeader = () => ({
  'User-Agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36`,
  'Upgrade-Insecure-Requests': 1,
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
  'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6,zh-TW;q=0.5',
  'Cookie': process.env['privatter_Cookie']
});

function fetchPrivatterPage(url) {
  return new Promise((resolve, reject) => {
    httpClient.get({
      url,
      headers: getPrivatterHttpHeader()
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

function getImageUrls(privatterUrl) {
  return fetchWindow(privatterUrl).then($ => {
    let images = $('#evernote p:first-of-type img');
    if (images.length <= 0) {
      return Promise.reject('Privatter no images, probably html analyize problem or Cookie timeout.');
    }
    let imageUrls;
    if (images[0].src.includes('blank.gif')) {
      imageUrls = [].slice.call(images).map(img => $(img).prop('src', $(img).attr('data-original'))[0].src);
    } else {
      imageUrls = [].slice.call(images).map(img => img.src);
    }
    if (imageUrls[0].includes(`blank.gif`)) {
      return Promise.reject('Privatter maybe gives wrong urls');
    } else if (imageUrls[0].includes('cloudfront.net')) {
      return replaceImgResize(imageUrls);
    } else {
      return Promise.all(imageUrls.map(imgUrl => new Promise((resolve, reject) => {
        httpClient.get({
          url: imgUrl,
          followRedirect: false,
          headers: getPrivatterHttpHeader()
        }, (err, response, body) => {
          if (err)
            return reject(err);
          if (response.headers.location.includes('cloudfront.net'))
            resolve(response.headers.location);
          else
            reject('Privatter maybe gives wrong urls')
        });
      }))).then(imgUrls => replaceImgResize(imgUrls));
    }

    function replaceImgResize(srcArray) {
      return srcArray.map(src => src.replace('img_resize', 'img_original'));
    }
  });
}


// getImageUrls(`http://privatter.net/i/2405204`).then(console.log);


module.exports = {
  getPrivatterImgUrls: getImageUrls
}