const httpClient = require('request');
const fs = require('fs');
const path = require('path');
const { sendTextMessage } = require('../controller/LINE_Message');

const getOauthObj = () => ({
  consumer_key: process.env['Consumer_Key'],
  consumer_secret: process.env["Consumer_Secret"],
  token: process.env['Access_Token'],
  token_secret: process.env['Access_Token_Secret']
});

let url = "https://api.twitter.com/1.1/statuses/show.json",
  qs = {
    tweet_mode: 'extended',
    include_entities: true
  };

const removeFav = id_str => new Promise((resolve, reject) => {
  httpClient.post({
    url: 'https://api.twitter.com/1.1/favorites/destroy.json',
    oauth: getOauthObj(),
    form: {
      id: id_str
    }
  }, (err, res, body) => {
    if (err) {
      return reject(err);
    }
    if (res.statusCode === 429) {
      return reject('Too many request 429');
    }
    resolve(body);
  });
});
const addFav = id_str => new Promise((resolve, reject) => {
  httpClient.post({
    url: 'https://api.twitter.com/1.1/favorites/create.json',
    oauth: getOauthObj(),
    form: {
      id: id_str
    }
  }, (err, res, body) => {
    if (err) {
      return reject(err);
    }
    if (res.statusCode === 429) {
      return reject('Too many request 429');
    }
    resolve(body);
  });
});

const deleteTweet = id_str => new Promise((resolve, reject) => {
  httpClient.post({
    url: `https://api.twitter.com/1.1/statuses/destroy/${id_str}.json`,
    oauth: getOauthObj(),
    form: {}
  }, (err, res, body) => {
    if (err) {
      return reject(err);
    }
    if (res.statusCode === 429) {
      return reject('Too many request 429');
    }
    resolve(body);
  });
});

const { download } = require('./pic-downloader');
const { getPrivatterImgUrls } = require('./privatter-fetch');


let sendRequest = (id) => new Promise((resolve, reject) => {
  qs.id = id;
  httpClient.get({
    url,
    oauth: getOauthObj(),
    qs,
    json: true
  }, (err, response, obj) => {
    if (err) {
      return reject(err);
    }
    if (response.statusCode != 200) {
      return reject(response.statusMessage);
    }
    resolve(obj);
  });
});



function processFav(id) {
  return sendRequest(id).catch(e => Promise.reject({
    err: e,
    url: `https://twitter.com/i/status/972530199135858690`
  })).then(item => processTwitterItem(item).catch(e => Promise.reject({
    err: e,
    url: `https://twitter.com/${item.user.screen_name}/status/${item.id_str}`
  })));
}

async function processTwitterItem(item) {
  if (
    !(
      (item.entities.urls && item.entities.urls.length > 0) ||
      (item.entities.media && item.entities.media.length > 0)
    )
  ) {
  } else if (!item.entities.media || item.entities.media.length == 0) {
    if (
      item.entities.urls.length == 1 &&
      item.entities.urls[0].expanded_url.includes("odaibako")
    ) {
    } else if (
      item.entities.urls.length == 1 &&
      item.entities.urls[0].expanded_url.includes("pixiv")
    ) {
    } else if (
      item.entities.urls.length == 1 &&
      item.entities.urls[0].expanded_url.includes("fantia.jp")
    ) {
    } else if (
      item.entities.urls.length == 1 &&
      item.entities.urls[0].expanded_url.includes("peing.net")
    ) {
    } else if (
      item.entities.urls.length == 1 &&
      item.entities.urls[0].expanded_url.includes("marshmallow-qa.com")
    ) {
    } else if (
      item.entities.urls.length == 1 &&
      item.entities.urls[0].expanded_url.includes("shindanmaker.com")
    ) {
    } else if (
      item.entities.urls.length == 1 &&
      item.entities.urls[0].expanded_url.includes("twitter.com/i/moments/")
    ) {
    } else if (
      item.entities.urls.length == 1 &&
      item.entities.urls[0].expanded_url.includes("privatter.net")
    ) {
      // from here will all has media
      await downloadPrivatter(item);
    } else {
      // do not know how to do, ask user
      sendTextMessage(`Nothing can do.\n\nhttps://twitter.com/${item.user.screen_name}/status/${item.id_str}`);
    }
  // from here will all has media
  } else if (!item.entities.urls || item.entities.urls.length <= 0) {
    await downloadMedia(item);
  } else if (
    item.entities.urls.length == 1 &&
    item.entities.urls[0].expanded_url.includes("odaibako")
  ) {
    await downloadMedia(item);
  } else if (
    item.entities.urls.length == 1 &&
    item.entities.urls[0].expanded_url.includes("reqbox.net")
  ) {
    await downloadMedia(item);
  } else if (
    item.entities.urls.length == 1 &&
    item.entities.urls[0].expanded_url.includes("patreon")
  ) {
    await downloadMedia(item);
  } else if (
    item.extended_entities.media.length == 1 &&
    item.entities.urls.length == 1 &&
    item.entities.urls[0].expanded_url.includes("privatter.net")
  ) {
    await downloadPrivatter(item).catch(err => {
      // report to line
      sendTextMessage(`${err}\n\n${item.entities.urls[0].expanded_url}\n\nhttps://twitter.com/${item.user.screen_name}/status/${item.id_str}`);
      return downloadMedia(item);
    });
  } else {
    // do not know how to do, ask user
    sendTextMessage(`Nothing can do.\n\nhttps://twitter.com/${item.user.screen_name}/status/${item.id_str}`);
  }
}

async function downloadMedia(item) {
  let promiseArray = [];
  item.extended_entities.media.forEach(pic => {
    let fileArray = pic.media_url_https.split('/');
    let fileName = fileArray[fileArray.length - 1];
    let fileNameArray = fileName.split('.');
    let promise = download(`${pic.media_url_https}:orig`, `${fileNameArray[0]}_${item.id_str}.${fileNameArray[1]}`, item.user.screen_name);
    promiseArray.push(promise);
  });
  await Promise.all(promiseArray);
}

async function downloadPrivatter(item) {
  await getPrivatterImgUrls(item.entities.urls[0].expanded_url).then(urls => Promise.all(urls.map(url => {
    let fileArray = url.split('/');
    let fileName = fileArray[fileArray.length - 1];
    let fileNameArray = fileName.split('.');
    return download(url, `${fileNameArray[0]}_${item.id_str}.${fileNameArray[1]}`, item.user.screen_name);
  })));
}

module.exports = {
  processFav,
  deleteTweet,
  addFav,
  getTweet: sendRequest
}