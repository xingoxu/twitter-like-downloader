const httpClient = require('request');
const fs = require('fs');
const path = require('path');
const { wait } = require('./wait');

const getOauthObj = () => ({
  consumer_key: process.env['Consumer_Key'],
  consumer_secret: process.env["Consumer_Secret"],
  token: process.env['Access_Token'],
  token_secret: process.env['Access_Token_Secret']
});

let url = "https://api.twitter.com/1.1/favorites/list.json",
  qs = {
    count: 200,
    tweet_mode: 'extended',
    include_entities: true
  };

// let first_id;
let favProcessed = 0;
let downloaded = 0;
let recordedId = '';

const removeFav = id_str => new Promise((resolve, reject) => {
  httpClient.post({
    url: 'https://api.twitter.com/1.1/favorites/destroy.json',
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
const { download } = require('./pic-downloader');
const { getPrivatterImgUrls } = require('./privatter-fetch');

let getFavList = (max_id) =>
  new Promise((resolve, reject) => {
    qs.max_id = max_id;
    httpClient.get({
      url,
      oauth: getOauthObj(),
      qs,
      json: true
    }, (err, response, likeList) => {
      if (err) {
        return reject(err);
      }
      resolve(likeList);
    });
  }).then(likeList => {
    processFavList(likeList);

    if (max_id) {
      favProcessed += (likeList.length - 1);
    } else {
      favProcessed += likeList.length;
    }

    // exit process
    if (likeList.length <= 0 || (likeList.length == 1 && likeList[0].id_str == max_id)) {
      console.log(favProcessed);
      console.log(likeList);
      console.log(downloaded);
      fs.writeFile(path.resolve(__dirname, '../download/favRemovedId.txt'), recordedId, {encoding: 'utf8'}, function (err) {
         if (err) {
           console.error(err);
         }
      });
      return;
    }


    console.log(favProcessed);
    return getFavList(likeList[likeList.length - 1].id_str);
  }).catch(err => {
    console.error(err);
    return wait(60 * 1000).then(() => getFavList(max_id));
  });

function processFavList(likeList) {
  likeList.forEach(item => {
    if (
      !((item.entities.urls && item.entities.urls.length > 0) || (item.entities.media && item.entities.media.length > 0))
    ) {
      recordAndRemoveFav(item);
    } else if (
      (!item.entities.media || item.entities.media.length == 0)
    ) {
      if (item.entities.urls.length == 1 && item.entities.urls[0].expanded_url.includes('odaibako')) {
        recordAndRemoveFav(item);
      } else if (item.entities.urls.length == 1 && item.entities.urls[0].expanded_url.includes('pixiv')) {
        recordAndRemoveFav(item);
      } else if (item.entities.urls.length == 1 && item.entities.urls[0].expanded_url.includes('fantia.jp')) {
        recordAndRemoveFav(item);
      } else if (item.entities.urls.length == 1 && item.entities.urls[0].expanded_url.includes('peing.net')) {
        recordAndRemoveFav(item);
      } else if (item.entities.urls.length == 1 && item.entities.urls[0].expanded_url.includes('marshmallow-qa.com')) {
        recordAndRemoveFav(item);
      } else if (item.entities.urls.length == 1 && item.entities.urls[0].expanded_url.includes('shindanmaker.com')) {
        recordAndRemoveFav(item);
      } else if (item.entities.urls.length == 1 && item.entities.urls[0].expanded_url.includes('twitter.com/i/moments/')) {
        recordAndRemoveFav(item);
      }
      // from here will all has media
      else if (item.entities.urls.length == 1 && item.entities.urls[0].expanded_url.includes('privatter.net')) {
        downloadPrivatterAndRemoveFav(item);
      }
    } else if (!item.entities.urls || item.entities.urls.length <= 0) {
      downloadMediaAndRemoveFav(item);
    } else if (item.entities.urls.length == 1 && item.entities.urls[0].expanded_url.includes('odaibako')) {
      downloadMediaAndRemoveFav(item);
    } else if (item.entities.urls.length == 1 && item.entities.urls[0].expanded_url.includes('reqbox.net')) {
      downloadMediaAndRemoveFav(item);
    } else if (item.entities.urls.length == 1 && item.entities.urls[0].expanded_url.includes('patreon')) {
      downloadMediaAndRemoveFav(item);
    } else if (item.entities.media.length == 1 &&item.entities.urls.length == 1 && item.entities.urls[0].expanded_url.includes('privatter.net')) {
      downloadPrivatterAndRemoveFav(item);
    }
  });
}

function recordAndRemoveFav(item) {
  console.log(item.full_text, item.id_str);
  recordedId += item.id_str + '\n';
  removeFav(item.id_str);
}

function downloadMediaAndRemoveFav(item) {
  let promiseArray = [];
  item.entities.media.forEach(pic => {
    let fileArray = pic.media_url_https.split('/');
    let fileName = fileArray[fileArray.length - 1];
    let fileNameArray = fileName.split('.');
    let promise = download(`${pic.media_url_https}:orig`, `${fileNameArray[0]}_${item.id_str}.${fileNameArray[1]}`, item.user.screen_name);
    promiseArray.push(promise);
  });
  downloaded++;
  recordedId += item.id_str + '\n';
  Promise.all(promiseArray).then(() => {
    return removeFav(item.id_str);
  });
}

function downloadPrivatterAndRemoveFav(item) {
  getPrivatterImgUrls(item.entities.urls[0].expanded_url).then(urls => Promise.all(urls.map(url => {
    let fileArray = url.split('/');
    let fileName = fileArray[fileArray.length - 1];
    let fileNameArray = fileName.split('.');
    return download(url, `${fileNameArray[0]}_${item.id_str}.${fileNameArray[1]}`, item.user.screen_name);
  }))).then(() => {
    return removeFav(item.id_str);
  }).catch(err => console.error(item, item.entities.urls[0].expanded_url, err));
  recordedId += item.id_str + '\n';
  downloaded++;
}

getFavList();