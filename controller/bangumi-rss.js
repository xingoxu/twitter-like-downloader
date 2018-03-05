let parser = require('rss-parser');
let moment = require('moment');

function parseTimeText(time) {
  let duration = moment.duration(Date.now() - moment(time, 'YYYY-MM-DD HH:mm:ss').valueOf());
  let handler = ['years', 'months', 'days', 'hours', 'minutes', 'seconds'];
  let unitText = ['年', '月', '天', '小时', '分钟', '秒'];
  let timeText = '';
  for (let i = 0; i < handler.length; i++) {
    let currentUnitValue = duration[handler[i]]();
    if (currentUnitValue > 0) {
      timeText = `${duration[handler[i]]()} ${unitText[i]}`;
      let secondTimeHanlder = handler[i + 1];
      if (secondTimeHanlder && duration[secondTimeHanlder]() > 0) {
        timeText += ` ${duration[secondTimeHanlder]()} ${unitText[i + 1]}`;
      }
      break;
    }
  }
  if (timeText == '') {
    timeText = '刚才';
  } else {
    timeText += '前'
  }
  return timeText;
}

function getRss(username) {
  return new Promise((resolve, reject) => {
    let userTimeLineRssLink = `https://bgm.tv/feed/user/${username}/timeline`;
    parser.parseURL(userTimeLineRssLink, function (err, parsed) {
      if (err) {
        return reject(err);
      }
      let title = parsed.feed.title.trim();
      let entries = parsed.feed.entries.map(({
        content,
        isoDate
      }) => {
        return {
          content: content.trim(),
          time: moment(isoDate).format('YYYY-MM-DD HH:mm:ss')
        }
      });
      resolve({
        title,
        entries,
        link: `https://bgm.tv/user/${username}/timeline`
      });
    });
  });
}

module.exports = {
  getRss,
  parseTimeText
}

