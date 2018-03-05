let httpClient = require('request');

const getOauthObj = () => ({
  consumer_key: process.env['Consumer_Key'],
  consumer_secret: process.env["Consumer_Secret"],
  token: process.env['Access_Token'],
  token_secret: process.env['Access_Token_Secret']
});

let url = "https://api.twitter.com/1.1/favorites/list.json",
  qs = {
    count: 200,
    include_entities: true
  };

// let first_id;
let favProcessed = 0;
let downloaded = 0;

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
    likeList.forEach(item => {
      if (
        !((item.entities.urls && item.entities.urls.length > 0) || (item.entities.media && item.entities.media.length > 0))
      ) {
        console.log(item.text, item.id_str);
        // removeFav(item.id_str);
      } else if (!item.entities.urls || item.entities.urls.length <= 0) {
        item.entities.media.forEach(pic => {
          let fileArray = pic.media_url_https.split('/');
          let fileName = fileArray[fileArray.length - 1];
          downloaded++;
          // download(`${pic.media_url_https}:orig`, fileName, item.user.screen_name);
        });
        // removeFav(item.id_str);
      }
    });
    if (max_id) {
      favProcessed += (likeList.length - 1);
    } else {
      favProcessed += likeList.length;
    }
    if (likeList.length <= 0 || (likeList.length == 1 && likeList[0].id_str == max_id)) {
      console.log(favProcessed);
      console.log(likeList);
      console.log(downloaded);
      return;
    }
    console.log(favProcessed);
    return getFavList(likeList[likeList.length - 1].id_str);
  }).catch(err => {
    console.error(err);
  });

getFavList();