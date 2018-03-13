const crypto = require('crypto');



function verifyLineRequest(req, res, next) {
  const consumerSecret = process.env['Consumer_Secret']; // Channel secret string
  const body = req.body; // Request body string
  const signature = crypto.createHmac('SHA256', consumerSecret)
    .update(body).digest('base64');
  // Compare  request header and the signature
  // req.get('x-twitter-webhooks-signature') == signature ? next() : res.status(401).json({ message: 'Request not from LINE.' });
  console.log(signature, req.get('x-twitter-webhooks-signature'));
  next();
}

module.exports = verifyLineRequest;