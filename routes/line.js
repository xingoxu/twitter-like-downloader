/**
 * Created by xingo on 2018/03/12.
 */

var express = require("express");
var router = express.Router();

const { processFav, deleteTweet, addFav, getTweet, processLINECallback } = require('../controller/processFav');
const { sendTextMessage, sendReplyTextMessage } = require('../controller/LINE_Message');
const verifyLineRequest = require('../controller/verifyLineRequest');
const qs = require('qs');

const errorHandler = e => sendTextMessage(e.stack || ((typeof e === 'string' ? e : JSON.stringify(e))).substring(0, 1999)).catch(line_err => console.error(line_err, e));

// verfiy line post
router.post("/", verifyLineRequest, function (req, res, next) {
  res.json({ message: 'ok' });
  req.body.events.forEach(event => {
    if (event.type !== 'postback') {
      return;
    }
    let data = qs.parse(event.postback.data);
    sendReplyTextMessage(event.replyToken, `リクエスト受けました、任務を始めます。\nhttps://twitter.com/i/status/${data.id_str}`).catch(errorHandler);

    processLINECallback(data).then(item => sendTextMessage(`任務成功完了。\nhttps://twitter.com/${item.user.screen_name}/status/${item.id_str}`)).catch(errorHandler);

  })
});

module.exports = router;