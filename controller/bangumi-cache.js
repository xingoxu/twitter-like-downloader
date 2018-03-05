/**
 * Created by xingo on 2017/08/10 .
 */

let errTimes = 0, MAX_ERR_TIMES = 10;
let { currentUser } = require('../utils/environment.js');
let taskMap = {};
let getTask = (func) => {
  return {
    errTimes: 0,
    func,
    cycleTask: undefined
  }
};

let { getBangumiTimelineJSON } = require('../controller/bangumi-contribution.js');
function getBangumiContribution(username) {
  return getBangumiTimelineJSON(username).then(json => {
    exportModule.cache[username] || (exportModule.cache[username] = {});
    return exportModule.cache[username].contribution = json;
  });
}

taskMap.getBangumiContribution = getTask(getBangumiContribution);


let { getRss: getBangumiRssJson } = require('../controller/bangumi-rss.js');
function getBangumiRss(username) {
  return getBangumiRssJson(username).then(json => {
    exportModule.cache[username] || (exportModule.cache[username] = {});
    return exportModule.cache[username].timeline = json;
  });
}

taskMap.getBangumiRss = getTask(getBangumiRss);

let taskArray = [];

for (let taskName in taskMap) {
  let task = taskMap[taskName];
  let cycleTask = function (username) {
    task.func(username).then(result => {
      task.errTimes = 0;
      return result;
    }).catch(err => {
      console.error(err);
      if (task.errTimes >= MAX_ERR_TIMES) {
        return;
      }
      task.errTimes++;
      return cycleTask(username);
    });
  }
  task.cycleTask = cycleTask;
}

let runAllCycleTaskFunc = (username) => {
  for (let taskName in taskMap) {
    taskMap[taskName].cycleTask(username);
  }  
}

runAllCycleTaskFunc(currentUser);


// function getBangumiContributionTask(username) {
//   return getBangumiContribution(username).catch(err => {
//     console.error(err);
//     return getBangumiContributionTask(username);
//   });
// }

// getBangumiContributionTask(currentUser);

// function getBangumiRssTask(username) {
//   return getBangumiRss(username).catch(err => {
//     console.error(err);
//     return getBangumiRssTask(username);
//   });
// }

// getBangumiRssTask(currentUser);

let moment = require('moment');
function runCycleTask() {
  setTimeout(() => {
    exportModule.cache = {};
    runAllCycleTaskFunc(currentUser);
    runCycleTask();
    exportModule.cache.time = moment().format('HH:mm:ss');
  }, moment().endOf('day').add(1, 'hours').valueOf() - Date.now());
}

runCycleTask();

let exportModule = {
  cache: {},
  taskMap
};

module.exports = exportModule;