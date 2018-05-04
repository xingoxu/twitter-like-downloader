/**
 * Created by xingo on 2018/03/09.
 */

var express = require("express");
var router = express.Router();
var bodyParser = require('body-parser');

const { processFav, deleteTweet, getTweet } = require('../controller/processFav');
const { sendTextMessage } = require('../controller/LINE_Message');
const errorHandler = require('../controller/errorHandler');

// process crc request
const crypto = require('crypto');
router.get('/account_activity', (req, res, next) => {
  let crc_token = req.query.crc_token;
  if (!crc_token) {
    return next();
  }
  const signature = crypto.createHmac('sha256', process.env['Consumer_Secret'])
    .update(crc_token).digest('base64');
  res.json({ response_token: `sha256=${signature}` });
});

// process account_activity webhook
const { verifyTwitterRequest } = require('../controller/verifyRequest');
router.post('/account_activity', bodyParser.text({ type: '*/*' }), verifyTwitterRequest, (req, res, next) => {
  res.json({ message: "Success!" });
  let body;
  try {
    body = JSON.parse(req.body);
    if (!body) {
      throw new Error('Body is empty');
    }
  } catch (e) {
    errorHandler(e);
    return;
  }

  // process favourite event
  if (body.favorite_events) {
    Promise.all(
      body.favorite_events.map(
        webhook => {
          // People favourite my tweet
          if (webhook.user.id_str != process.env['Twitter_UserId']) {
            return Promise.resolve();
          }

          return processFav(webhook.favorited_status.id_str).catch(errorHandler);
        }
      )
    );
  }
});

module.exports = router;
