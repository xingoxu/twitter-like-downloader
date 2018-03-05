/**
 * Created by xingo on 2017/03/06.
 */

let httpClient = require('request');

function fetchPage(username) {
  return new Promise((resolve, reject) => {
    httpClient.get({
      url: `https://github.com/${username}`,
      headers: {
        'User-Agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36`,
        'Upgrade-Insecure-Requests': 1,
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Accept-Language': 'en-US,en;q=0.8,zh-CN;q=0.6,zh;q=0.4,ja;q=0.2,zh-TW;q=0.2',
        'Cookie': `"logged_in=no; domain=.github.com; path=/; expires=Fri, 06 Mar 2037 11:50:30 -0000; secure; HttpOnly_gh_sess=eyJzZXNzaW9uX2lkIjoiYTg3YjRkMTNlNmQ1Nzg2Y2YxN2YxZWU4MjZjOTlmN2IiLCJfY3NyZl90b2tlbiI6IkpUSSsyempjcGlrVGYyQkVTY2p6TTZhd3YwbEltQVpPVERnOWVzUWVjMms9In0%3D--dcfc55d6afe099b0975d269a7a388b142d11f201; path=/; secure; HttpOnly"`
      }
    }, (err, response, body) => {
      if (err)
        return reject(err);
      resolve(body)
    })
  });
}
let domEnv = require('jsdom').env,
    jQInit = require('jquery');
function toJson(body) {
  return new Promise((resolve, reject) => {
    domEnv(body, (errors, window) => {
      if (errors)
        return reject(errors);
      let $ = jQInit(window);

      let json = {
        max: 0,
        data: [],
      };
      $('.js-calendar-graph-svg>g>g>rect').each(function (index) {
        let count = Number.parseInt($(this).attr('data-count'));
        if (count > json.max)
          json.max = count;
        json.data.push({
          count: count,
          date: $(this).attr('data-date'),
        })
      });
      resolve(json);
    })
  });
}

let cache = {};
function getGithubContribution(username) {
  return fetchPage(username).then(toJson)
      .then(json => {
        return cache[username] = json;
      });
}

let moment = require('moment');

let router = require('express').Router();
let currentUser = process.env.github_username || 'xingoxu';
getGithubContribution(currentUser);
function runCycleTask() {
  setTimeout(() => {
    cache = {};
    getGithubContribution(currentUser);
    runCycleTask();
  }, moment().endOf('day').add(8, 'hours').valueOf() - Date.now());
}
runCycleTask();
router.get('/', function (req, res, next) {
  res.append('Access-Control-Allow-Origin', '*');
  if (cache[currentUser]) {
    return res.json(cache[currentUser]);
  }
  else {
    return getGithubContribution(currentUser)
        .then(json => {
          res.json(json);
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            code: 500,
            message: 'something went wrong',
          });
        });
  }
});

module.exports = router;