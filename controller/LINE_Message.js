const httpClient = require('request');

function sendTextMessage(text) {
  return new Promise((resolve, reject) => {
    httpClient.post({
      url: 'https://api.line.me/v2/bot/message/push',
      json: true,
      auth: {
        'bearer': process.env['LINE_AccessToken']
      },
      body: {
        to: process.env['LINE_UserId'],
        messages: [{
          type: 'text',
          text
        }]
      }
    }, (err, res, body) => {
      if (err) {
        return reject(err);
      }
      resolve(body);
    });
  })
}

function sendButtonMessage({ img, url, actions, text, title }) {
  return new Promise((resolve, reject) => {
    httpClient.post({
      url: 'https://api.line.me/v2/bot/message/push',
      json: true,
      auth: {
        'bearer': process.env['LINE_AccessToken']
      },
      body: {
        to: process.env['LINE_UserId'],
        messages: [{
          'type': 'template',
          'altText': `Tweet has to be checked\n${url}`,
          'template': {
            'type': 'buttons',
            'thumbnailImageUrl': img || 'https://pbs.twimg.com/media/DYFYBjpVAAEdjnz.jpg:orig',
            "imageAspectRatio": "rectangle",
            "imageSize": "cover",
            "imageBackgroundColor": "#FFFFFF",
            title,
            text: text.substring(0, 59),
            "defaultAction": {
              "type": "uri",
              "label": "View Tweet",
              "uri": url
            },
            "actions": actions.map(({ label, data }) => ({ label, data, type: 'postback' }))
          }
        }]
      }
    }, (err, res, body) => {
      if (err) {
        return reject(err);
      }
      resolve(body);
    });
  })
}

function sendReplyTextMessage(replyToken, text) {
  return new Promise((resolve, reject) => {
    httpClient.post({
      url: 'https://api.line.me/v2/bot/message/reply',
      json: true,
      auth: {
        'bearer': process.env['LINE_AccessToken']
      },
      body: {
        replyToken,
        messages: [{
          type: 'text',
          text
        }]
      }
    }, (err, res, body) => {
      if (err) {
        return reject(err);
      }
      resolve(body);
    });
  })
}


module.exports = {
  sendTextMessage,
  sendButtonMessage,
  sendReplyTextMessage
}
