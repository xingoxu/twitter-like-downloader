const { sendTextMessage, sendReplyTextMessage } = require('./LINE_Message');
const { processFav } = require('./processFav');
const errorHandler = require('./errorHandler');

const processLINEMessage = (event) => {
  let message = event.message;
  if (message.type != 'text') {
    return;
  }
  let ids;
  try {
    let urls = message.text.match(/[a-zA-z]+:\/\/[^\s]*/g);
    if (urls.length <= 0) return;
    ids = urls.map(url => url.match(/status\/\d+/i)[0].split('/')[1]);
  } catch (e) {
    return errorHandler(e);
  }

  sendReplyTextMessage(
    event.replyToken,
    `リクエスト受けました、任務を始めます。${ids.map(id => `\nhttps://twitter.com/i/status/${id}`).join('')}`
  ).catch(errorHandler);

  Promise.all(
    ids.map(id => processFav(id).catch(errorHandler))
  ).then(
    items => sendTextMessage(`任務成功完了。${items.map(
      item => item.id_str ? `\nhttps://twitter.com/${item.user.screen_name}/status/${item.id_str}` : ''
    ).join('')}`)
  );
}

module.exports = processLINEMessage;