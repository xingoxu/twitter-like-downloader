/**
 * Created by xingo on 2018/03/09.
 */

var express = require("express");
var router = express.Router();

const { processFav, deleteTweet, addFav, getTweet } = require('../controller/processFav');

router.post("/like", function (req, res, next) {
  let link = req.body.link;
  if (req.body.Secret != process.env['ifttt_Secret'] || !link) {
    return res.status(401).json({ message: 'Permission Denied!' });
  }
  let linkArray = link.split('/');
  let id_str = linkArray[linkArray.length - 1];
  if (id_str && id_str != '') {
    processFav(id_str).catch(e => console.error(e));
    res.json({ title: "Success!" });
  } else {
    console.error(req.body);
    return res.status(400).json({ message: 'id_str error occured.' });
  }
});

router.post("/retweet", function (req, res, next) {
  let link = req.body.link;
  if (req.body.Secret != process.env['ifttt_Secret'] || !link) {
    return res.status(401).json({ message: 'Permission Denied!' });
  }
  let linkArray = link.split('/');
  let id_str = linkArray[linkArray.length - 1];
  if (id_str && id_str != '') {
    res.json({ title: "Success!" });
    getTweet(id_str).then(quoteTweet => ({
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
        console.log(original_id_str);
        return processFav(body.id_str).then(() => Promise.all([deleteTweet(original_id_str), addFav(body.id_str)])).catch(e => console.error(e));
      }
    }).catch(e => console.error(e));
  } else {
    console.error(req.body);
    return res.status(400).json({ message: 'id_str error occured.' });
  }
});

module.exports = router;
