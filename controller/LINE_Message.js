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


module.exports = {
  sendTextMessage
}