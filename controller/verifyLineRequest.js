const crypto = require('crypto');



function verifyLineRequest(req, res, next) {
  const channelSecret = process.env['LINE_ChannelSecret']; // Channel secret string
  const body = req.body; // Request body string
  console.log(body);
  const signature = crypto.createHmac('SHA256', channelSecret)
    .update(body).digest('base64');
  // Compare  request header and the signature
  req.get('X-Line-Signature') == signature ? next() : res.status(401).json({ message: 'Request not from LINE.' });
}

module.exports = verifyLineRequest;