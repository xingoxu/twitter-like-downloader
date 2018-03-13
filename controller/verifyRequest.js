const crypto = require('crypto');



function verifyLineRequest(req, res, next) {
  const channelSecret = process.env['LINE_ChannelSecret']; // Channel secret string
  const body = req.body; // Request body string
  const signature = crypto.createHmac('SHA256', channelSecret)
    .update(body).digest('base64');
  // Compare  request header and the signature
  req.get('X-Line-Signature') == signature ? next() : res.status(401).json({ message: 'Request not from LINE.' });
}

function verifyTwitterRequest(req, res, next) {
  const consumerSecret = process.env['Consumer_Secret'];
  const body = req.body; // Request body string
  const signature = crypto.createHmac('SHA256', consumerSecret)
    .update(body).digest('base64');
  // Compare  request header and the signature
  `sha256=${signature}` == req.get('x-twitter-webhooks-signature') ? next() : res.status(401).json({ message: 'Request not from Twitter.' });
}

module.exports = {
  verifyLineRequest,
  verifyTwitterRequest
};