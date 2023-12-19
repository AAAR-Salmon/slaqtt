require('dotenv').config();
const { App } = require('@slack/bolt');

const app = new App({
  // logLevel: 'debug',
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

(async () => {
  await app.client.chat.postMessage({
    channel: '#bottest',
    text: 'hoge'
  });
})();
