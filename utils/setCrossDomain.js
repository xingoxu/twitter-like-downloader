/**
 * Created by xingo on 2017/08/10 .
 */

module.exports = function (req, res, next) {
  res.set('Access-Control-Allow-Origin', '*');
  // res.set('Access-Control-Allow-Methods', 'GET, POST');
  // res.set('Access-Control-Allow-Headers', 'Origin, Accept-Language, Accept-Encoding, X-Forwarded-For, Connection, Accept, User-Agent, Host, Referer, Cookie, Content-Type, Cache-Control');
  next();
};