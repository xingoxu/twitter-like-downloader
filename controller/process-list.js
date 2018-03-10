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

let url = "https://api.twitter.com/1.1/statuses/lookup.json",
  qs = {
    tweet_mode: 'extended',
    include_entities: true
  };

// let first_id;
let favProcessed = 0;
let downloaded = 0;

let favNotAdded = '';
let favNotReturned = '';

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

const { download } = require('./pic-downloader');
const { getPrivatterImgUrls } = require('./privatter-fetch');

let favIdsString = fs.readFileSync(path.resolve(__dirname, '../download/favIds.txt'), { encoding: 'utf8' });

let favIds = favIdsString.split('\n');

let sendListRequest = (ids) => new Promise((resolve, reject) => {
  qs.id = ids;
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
});

async function getFavList() {
  let processingString = '';
  for (let i = 1; i <= favIds.length; i++){
    if (i % 100 != 0) {
      processingString += `${favIds[i - 1]},`;
    } else {
      processingString += favIds[i - 1];
      let likeList = await sendListRequest(processingString);

      await processFavList(likeList);
      await wait(5000);
      if (likeList.length < 100) {
        let processFavs = processingString.split(',');
        for (let x = 0; x < processFavs.length; x++) {
          let findResult = likeList.find(item => item.id_str == processFavs[x]);
          if (!findResult) {
            favNotReturned += `${processFavs[x]}\n`;
            console.error(processFavs[x], 'not processed');
          }
        }
      }
      favProcessed += likeList.length;

      processingString = '';
    }
  }
  if (processingString != '') {
    processingString.substr(0, processingString.length - 1);
    let likeList = await sendListRequest(processingString);
    await processFavList(likeList);
    favProcessed += likeList.length;
  }
  try {
    await Promise.all(tasks);
  } catch (e) {
    console.error(e);
  }

  fs.writeFile(path.resolve(__dirname, '../download/favNotAdded.txt'), favNotAdded, {encoding: 'utf8'}, function (err) {
     if (err) {
       console.error(err);
     }
  });
  fs.writeFile(path.resolve(__dirname, '../download/favNotReturned.txt'), favNotReturned, {encoding: 'utf8'}, function (err) {
     if (err) {
       console.error(err);
     }
  });
  console.log(downloaded);
  console.log(favProcessed);
}

let tasks = [];

async function processFavList(likeList) {
  for (let i = 0; i < likeList.length; i++){
    let item = likeList[i];
    let promise;
    if (
      !((item.entities.urls && item.entities.urls.length > 0) || (item.entities.media && item.entities.media.length > 0))
    ) {
      promise = recordAndRemoveFav(item);
    } else if (
      (!item.entities.media || item.entities.media.length == 0)
    ) {
      if (item.entities.urls.length == 1 && item.entities.urls[0].expanded_url.includes('odaibako')) {
        promise = recordAndRemoveFav(item);
      } else if (item.entities.urls.length == 1 && item.entities.urls[0].expanded_url.includes('pixiv')) {
        promise = recordAndRemoveFav(item);
      } else if (item.entities.urls.length == 1 && item.entities.urls[0].expanded_url.includes('fantia.jp')) {
        promise = recordAndRemoveFav(item);
      } else if (item.entities.urls.length == 1 && item.entities.urls[0].expanded_url.includes('peing.net')) {
        promise = recordAndRemoveFav(item);
      } else if (item.entities.urls.length == 1 && item.entities.urls[0].expanded_url.includes('marshmallow-qa.com')) {
        promise = recordAndRemoveFav(item);
      } else if (item.entities.urls.length == 1 && item.entities.urls[0].expanded_url.includes('shindanmaker.com')) {
        promise = recordAndRemoveFav(item);
      } else if (item.entities.urls.length == 1 && item.entities.urls[0].expanded_url.includes('twitter.com/i/moments/')) {
        promise = recordAndRemoveFav(item);
      }
      // from here will all has media
      else if (item.entities.urls.length == 1 && item.entities.urls[0].expanded_url.includes('privatter.net')) {
        promise = downloadPrivatterAndRemoveFav(item);
      }
    } else if (!item.entities.urls || item.entities.urls.length <= 0) {
      promise = downloadMediaAndRemoveFav(item);
    } else if (item.entities.urls.length == 1 && item.entities.urls[0].expanded_url.includes('odaibako')) {
      promise = downloadMediaAndRemoveFav(item);
    } else if (item.entities.urls.length == 1 && item.entities.urls[0].expanded_url.includes('reqbox.net')) {
      promise = downloadMediaAndRemoveFav(item);
    } else if (item.entities.urls.length == 1 && item.entities.urls[0].expanded_url.includes('patreon')) {
      promise = downloadMediaAndRemoveFav(item);
    } else if (item.extended_entities.media.length == 1 && item.entities.urls.length == 1 && item.entities.urls[0].expanded_url.includes('privatter.net')) {
      promise = downloadPrivatterAndRemoveFav(item).catch(err => {
        // report to line
        console.error(item, item.entities.urls[0].expanded_url, err);
        return downloadMedia(item);
      });
    }
    if (promise) {
      tasks.push(promise);
    }
  }
}

async function recordAndRemoveFav(item) {
  console.log(item.full_text, item.id_str);
  try {
    await addFav(item.id_str);
    if (['ghosrt', 'chengr28', 'hara_1008', 'ilools', 'chenshaoju'].includes(item.user.screen_name)) {
      await removeFav(item.id_str);
    }
  } catch (e) {
    console.error(e, item.id_str);
    favNotAdded += `${item.id_str}\n`;
  }
}

async function downloadMediaAndRemoveFav(item) {
  let promiseArray = [];
  item.extended_entities.media.forEach(pic => {
    let fileArray = pic.media_url_https.split('/');
    let fileName = fileArray[fileArray.length - 1];
    let fileNameArray = fileName.split('.');
    let promise = download(`${pic.media_url_https}:orig`, `${fileNameArray[0]}_${item.id_str}.${fileNameArray[1]}`, item.user.screen_name);
    promiseArray.push(promise);
  });
  try {
    await Promise.all(promiseArray);
  } catch (e) {
    console.error('download Error', e, item.id_str);
  }
  downloaded++;
  try {
    await addFav(item.id_str);
  } catch (e) {
    console.error(e, item.id_str);
    favNotAdded += `${item.id_str}\n`;
  }
}

async function downloadPrivatterAndRemoveFav(item) {
  try {
    await getPrivatterImgUrls(item.entities.urls[0].expanded_url).then(urls => Promise.all(urls.map(url => {
      let fileArray = url.split('/');
      let fileName = fileArray[fileArray.length - 1];
      let fileNameArray = fileName.split('.');
      return download(url, `${fileNameArray[0]}_${item.id_str}.${fileNameArray[1]}`, item.user.screen_name);
    })));
  } catch (err) {
    console.error(item, item.entities.urls[0].expanded_url, err)
  }
  downloaded++;
  try {
    await addFav(item.id_str);
  } catch (e) {
    console.error(e, item.id_str);
    favNotAdded += `${item.id_str}\n`;
  }
}

getFavList().catch(e => {
  console.error(e);
})