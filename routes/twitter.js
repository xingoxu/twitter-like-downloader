/**
 * Created by xingo on 2018/03/09.
 */

var express = require("express");
var router = express.Router();
var bodyParser = require('body-parser');

const { processFav, deleteTweet, addFav, getTweet } = require('../controller/processFav');
const { sendTextMessage } = require('../controller/LINE_Message');
const errorHandler = e => sendTextMessage(e.stack || ((typeof e === 'string' ? e : JSON.stringify(e))).substring(0, 1999)).catch(line_err => console.error(line_err, e));


// process like
router.post("/like", function (req, res, next) {
  let link = req.body.link;
  if (req.body.Secret != process.env['ifttt_Secret'] || !link) {
    return res.status(401).json({ message: 'Permission Denied!' });
  }
  let linkArray = link.split('/');
  let id_str = linkArray[linkArray.length - 1];
  if (id_str && id_str != '') {
    processFav(id_str).catch(errorHandler);
    res.json({ message: "Success!" });
  } else {
    errorHandler(`No id_str in ${JSON.stringify(req.body)}`);
    return res.status(400).json({ message: 'id_str error occured.' });
  }
});

// process retweet
router.post("/retweet", function (req, res, next) {
  let link = req.body.link;
  if (req.body.Secret != process.env['ifttt_Secret'] || !link) {
    return res.status(401).json({ message: 'Permission Denied!' });
  }
  let linkArray = link.split('/');
  let id_str = linkArray[linkArray.length - 1];
  if (id_str && id_str != '') {
    res.json({ message: "Success!" });

    getTweet(id_str).catch(e => Promise.reject({
      err: e,
      url: `https://twitter.com/i/status/${id_str}`
    })).then(quoteTweet => ({
      validate_text: quoteTweet.full_text,
      validate_text_range: quoteTweet.display_text_range,
      original_id_str: quoteTweet.id_str,
      id_str: quoteTweet.quoted_status_id_str,
      is_quote_status: quoteTweet.is_quote_status
    })).then(body => {
      if (!body.is_quote_status) {
        return;
      }
      let validate_text = body.validate_text,
        validate_text_range = body.validate_text_range;
      if (!validate_text || !validate_text_range || validate_text_range.length != 2) {
        console.error(body);
        return;
      }
      if (validate_text.slice(...validate_text_range) == process.env['retweet_text']) {
        let original_id_str = body.original_id_str;
        return processFav(body.id_str).then(item => Promise.all([deleteTweet(original_id_str), addFav(body.id_str)]).catch(err => Promise.reject({
          err,
          url: `https://twitter.com/${item.user.screen_name}/status/${item.id_str}`
        })));
      }
    }).catch(errorHandler);
  } else {
    errorHandler(`No id_str in ${JSON.stringify(req.body)}`);
    return res.status(400).json({ message: 'id_str error occured.' });
  }
});

// process crc request
const crypto = require('crypto');
router.get('/account_activity', (req, res, next) => {
  let crc_token = request.query.crc_token;
  if (!crc_token) {
    return next();
  }
  const signature = crypto.createHmac('sha256', process.env['Consumer_Secret'])
    .update(crc_token).digest('base64');
  res.json({ response_token: `sha256=${signature}` });
});

router.post('/account_activity', bodyParser.text({ type: '*/*' }), require('../controller/verifyLineRequest'), (req, res, next) => {
  let body = JSON.parse(req.body);
  console.log(req.body);
  res.json({ message: "Success!" });
});

module.exports = router;
