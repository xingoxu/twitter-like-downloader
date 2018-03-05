/**
 * Created by xingo on 2017/03/06.
 */


let router = require('express').Router();
let allowCrossDomain = require('../utils/setCrossDomain.js');
let { currentUser } = require('../utils/environment.js');
let bangumiCacheModule = require('../controller/bangumi-cache.js');
let bangumiRssModule = require('../controller/bangumi-rss.js');

router.get('/', allowCrossDomain, function (req, res, next) {
  let { cache, taskMap } = bangumiCacheModule;
  if (cache[currentUser] && cache[currentUser].contribution) {
    return res.json(cache[currentUser].contribution);
  }
  else {
    return taskMap.getBangumiContribution.func(currentUser).then(json => {
      res.json(json);
    }).catch(err => {
      console.error(err);
      taskMap.getBangumiContribution.cycleTask(currentUser);
      return res.status(500).json({
        code: 500,
        message: 'something went wrong',
      });
    });
  }
});

function setTimelineTimeText(timeline) {
  let resultTimeline = JSON.parse(JSON.stringify(timeline));
  resultTimeline.entries.forEach(entry =>
    entry.timeText = bangumiRssModule.parseTimeText(entry.time)
  );
  return resultTimeline;
}

router.get('/timeline', allowCrossDomain, function (req, res, next) {
  let { cache, taskMap } = bangumiCacheModule;
  if (cache[currentUser] && cache[currentUser].timeline) {
    return res.json(setTimelineTimeText(cache[currentUser].timeline));
  }
  else {
    return taskMap.getBangumiRss.func(currentUser).then(json => {
      res.json(setTimelineTimeText(json));
    }).catch(err => {
      console.error(err);
      taskMap.getBangumiRss.cycleTask(currentUser);
      return res.status(500).json({
        code: 500,
        message: 'something went wrong',
      });
    });
  }
});


module.exports = router;