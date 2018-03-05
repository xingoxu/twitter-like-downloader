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

let first_id;
let favProcessed = 0;

let getFavList = (max_id) =>
  new Promise((resolve, reject) => {
    qs.max_id = max_id;
    httpClient.get({
      url,
      oauth: getOauthObj(),
      qs,
      json: true
    }, (error, response, likeList) => {
      resolve(likeList);
    });
  }).then(likeList => {
    
  });

