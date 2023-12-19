const { z } = require('zod');
require('dotenv').config();
const { App } = require('@slack/bolt');
const mqtt = require('mqtt');

const Message = z.object({
  channel: z.string(),
  text: z.string(),
});

async function jsonParseAsync(json) {
  return JSON.parse(json);
}

const app = new App({
  // logLevel: 'debug',
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

(async () => {
  const client = mqtt.connect(process.env.MQTT_BROKER);

  client.on('connect', () => {
    client.subscribe(process.env.MQTT_SUB_TOPIC);
  });

  client.on('message', (_topic, json) => {
    jsonParseAsync(json)
      .then(Message.parse)  // validate Message Schema
      .then(async ({ channel, text }) => {
        await app.client.chat.postMessage({
          channel,
          text
        });
      })
      .catch(console.error);
  });
})();
