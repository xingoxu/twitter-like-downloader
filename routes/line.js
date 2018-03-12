/**
 * Created by xingo on 2018/03/12.
 */

var express = require("express");
var router = express.Router();

const { processFav, deleteTweet, addFav, getTweet } = require('../controller/processFav');
const { sendTextMessage } = require('../controller/LINE_Message');

const errorHandler = e => sendTextMessage(e.stack || ((typeof e === 'string' ? e : JSON.stringify(e))).substring(0, 1999)).catch(line_err => console.error(line_err, e));

// verfiy line post
router.post("/", function (req, res, next) {
  console.log(req.body);
  res.json({ message: 'ok' });
});