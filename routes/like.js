/**
 * Created by xingo on 2018/03/09.
 */

var express = require("express");
var router = express.Router();

router.post("/like", function(req, res, next) {
  console.log(req.body);
  res.json({ title: "Success!" });
});

module.exports = router;
