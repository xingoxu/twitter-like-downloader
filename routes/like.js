/**
 * Created by xingo on 2018/03/09.
 */

var express = require("express");
var router = express.Router();

const { processFav } = require('../controller/processFav');

router.post("/like", function (req, res, next) {
  let link = req.body.link;
  console.log(req.body.text);
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

module.exports = router;
