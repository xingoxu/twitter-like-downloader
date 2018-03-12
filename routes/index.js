var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({"title": "Welcome to RESTAPI service!"});
});

module.exports = router;
