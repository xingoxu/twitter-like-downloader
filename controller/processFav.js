const httpClient = require('request');
const { sendTextMessage, sendButtonMessage } = require('../controller/LINE_Message');
const qs = require('qs');

const getOauthObj = () => ({
  consumer_key: process.env['Consumer_Key'],
  consumer_secret: process.env["Consumer_Secret"],
  token: process.env['Access_Token'],
  token_secret: process.env['Access_Token_Secret']
});

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
const { getMosaicUrls } = require('./mosaic-neriko-fetch');

let sendRequest = (id) => new Promise((resolve, reject) => {
  httpClient.get({
    url: 'https://api.twitter.com/1.1/statuses/show.json',
    oauth: getOauthObj(),
    qs: {
      id,
      tweet_mode: 'extended',
      include_entities: true
    },
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
    err: e.stack || e,
    url: `https://twitter.com/i/status/${id}`
  })).then(item => processTwitterItem(item).catch(e => Promise.reject({
    err: e.stack || e,
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
    } else if (
      item.entities.urls.length == 1 &&
      item.entities.urls[0].expanded_url.includes('mosaic.neriko.net')
    ) {
      await downloadMosaic(item);
    } else if (item.entities.urls.every(url => url.expanded_url.includes('privatter.net'))) {
      downloadPrivatterAll(item);
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
    item.entities.urls.length == 1 &&
    item.entities.urls[0].expanded_url.includes("mosaic.neriko.net")
  ) {
    await downloadMosaic(item);
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
  } else if (item.entities.urls.every(url => url.expanded_url.includes('privatter.net'))) {
    sendButtonMessage({
      img: `${item.entities.media[0].media_url_https}:small`,
      url: `https://twitter.com/${item.user.screen_name}/status/${item.id_str}`,
      title: item.user.name,
      text: item.full_text,
      actions: [{
        label: 'Download Privatter',
        data: qs.stringify({
          type: 'privatter',
          id_str: item.id_str
        })
      }, {
        label: 'Download Picture',
        data: qs.stringify({ type: 'picture', id_str: item.id_str })
      }, {
        label: 'Download All',
        data: qs.stringify({ type: 'all', url_type: 'privatter', id_str: item.id_str })
      }],
    });
  } else {
    // do not know how to do, ask user
    sendButtonMessage({
      img: `${item.entities.media[0].media_url_https}:small`,
      url: `https://twitter.com/${item.user.screen_name}/status/${item.id_str}`,
      title: item.user.name,
      text: item.full_text,
      actions: [{
        label: 'Download Picture',
        data: qs.stringify({ type: 'picture', id_str: item.id_str })
      }],
    });
  }
  return item;
}

const { URL } = require('url');
/**
 * @returns {[string, string]} [name, ext]
 */
function getFileNameArray(url) {
  let fileArray = url.split('/');
  let fileName = fileArray[fileArray.length - 1];
  let fileNameArray = fileName.split('.');
  return fileNameArray;
}
async function downloadMedia(item) {
  let promiseArray = [];
  item.extended_entities.media.forEach(pic => {
    let promise;
    if (pic.additional_media_info && pic.additional_media_info.embeddable === false) {
      promise = Promise.reject(new Error('Media only available to twitter official client'));
    } else if (pic.type == 'photo') {
      // photo
      let fileNameArray = getFileNameArray(pic.media_url_https);
      promise = download(`${pic.media_url_https}:orig`, `${fileNameArray[0]}_${item.id_str}.${fileNameArray[1]}`, item.user.screen_name);
    } else if (pic.type == 'animated_gif') {
      // animated_gif
      if (pic.video_info.variants.length > 1) {
        sendTextMessage(`Animated Gif video more than 1.\n\nhttps://twitter.com/${item.user.screen_name}/status/${item.id_str}`);
      }
      let downloadURLObj = new URL(pic.video_info.variants[0].url);
      let downloadURL = downloadURLObj.origin + downloadURLObj.pathname;
      let fileNameArray = getFileNameArray(downloadURL);
      promise = download(downloadURL, `${fileNameArray[0]}_${item.id_str}.${fileNameArray[1]}`, item.user.screen_name);
    } else if (pic.type == 'video') {
      // video
      let sortVariants = pic.video_info.variants.sort((videoA, videoB) => (videoA.bitrate || 0) < (videoB.bitrate || 0));
      let downloadURLObj = new URL(sortVariants[0].url);
      let downloadURL = downloadURLObj.origin + downloadURLObj.pathname;
      let fileNameArray = getFileNameArray(downloadURL);
      promise = download(downloadURL, `${fileNameArray[0]}_${item.id_str}.${fileNameArray[1]}`, item.user.screen_name);
    } else {
      promise = Promise.reject(new Error(`Twitter Object media unknow type: ${pic.type}`));
    }
    promiseArray.push(promise);
  });
  await Promise.all(promiseArray);
}

async function downloadPrivatter(item) {
  await downloadPrivatterURL(item.entities.urls[0].expanded_url, item.id_str, item.user.screen_name);
}

async function downloadPrivatterURL(url, id_str, screen_name) {
  await getPrivatterImgUrls(url).then(urls => Promise.all(urls.map(url => {
    let fileArray = url.split('/');
    let fileName = fileArray[fileArray.length - 1];
    let fileNameArray = fileName.split('.');
    return download(url, `${fileNameArray[0]}_${id_str}.${fileNameArray[1]}`, screen_name);
  })));
}

async function downloadPrivatterAll(item) {
  await Promise.all(item.entities.urls.map(url => downloadPrivatterURL(url.expanded_url, item.id_str, item.user.screen_name)));
}

async function downloadMosaic(item) {
  await getMosaicUrls(item.entities.urls[0].expanded_url).then(urls => Promise.all(urls.map(url => {
    let fileArray = url.split('/');
    let fileName = fileArray[fileArray.length - 1];
    let fileNameArray = fileName.split('.');
    return download(url, `${fileNameArray[0]}_${item.id_str}.${fileNameArray[1]}`, item.user.screen_name);
  })));
}

function processLINECallback(data) {
  return sendRequest(data.id_str).catch(e => Promise.reject({
    err: e.stack || e,
    url: `https://twitter.com/i/status/${id}`
  })).then(item => processLINECallbackTwitterItem(data, item).catch(e => Promise.reject({
    err: e.stack || e,
    url: `https://twitter.com/${item.user.screen_name}/status/${item.id_str}`
  })));
}

async function processLINECallbackTwitterItem(data, item) {
  if (data.type == 'privatter') {
    await downloadPrivatterAll(item);
  } else if (data.type == 'picture') {
    await downloadMedia(item);
  } else if (data.type == 'all') {
    if (data.url_type == 'privatter') {
      await Promise.all([downloadPrivatterAll(item), downloadMedia(item)]);
    }
  }
  return item;
}

module.exports = {
  processFav,
  deleteTweet,
  addFav,
  getTweet: sendRequest,
  processLINECallback
}