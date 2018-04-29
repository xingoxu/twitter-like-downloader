var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({"title": "Twitter Bot By xingoxu!"});
});

module.exports = router;
