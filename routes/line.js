/**
 * Created by xingo on 2018/03/12.
 */

var express = require("express");
var router = express.Router();

const { processFav, deleteTweet, getTweet, processLINECallback } = require('../controller/processFav');
const { sendTextMessage, sendReplyTextMessage } = require('../controller/LINE_Message');
const { verifyLineRequest } = require('../controller/verifyRequest');
const qs = require('qs');

const errorHandler = require('../controller/errorHandler');

// verfiy line post
router.post("/", verifyLineRequest, function (req, res, next) {
  res.json({ message: 'ok' });
  JSON.parse(req.body).events.forEach(event => {
    // validate the user who trigger the event
    if (!(event.source.type == 'user' && event.source.userId == process.env['LINE_UserId'])) {
      return;
    }
    if (event.type === 'postback') {
      let data = qs.parse(event.postback.data);
      sendReplyTextMessage(event.replyToken, `リクエスト受けました、任務を始めます。\nhttps://twitter.com/i/status/${data.id_str}`).catch(errorHandler);

      processLINECallback(data).then(item => sendTextMessage(`任務成功完了。\nhttps://twitter.com/${item.user.screen_name}/status/${item.id_str}`)).catch(errorHandler);

    } else if (event.type === 'message') {
      require('../controller/process-LINE-message')(event);
    }

  })
});

module.exports = router;