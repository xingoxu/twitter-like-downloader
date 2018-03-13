const { sendTextMessage } = require('./LINE_Message');

const errorHandler = e => sendTextMessage(e.stack || ((typeof e === 'string' ? e : JSON.stringify(e))).substring(0, 1999)).catch(line_err => console.error(line_err, e));

module.exports = errorHandler;