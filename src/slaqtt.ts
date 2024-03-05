#!/usr/bin/env node

import 'dotenv/config';
import { App } from '@slack/bolt';
import mqtt from 'mqtt';
import { getChannelFromTextTopic, inferPayloadFormatFromTopic } from './topic';
import { PayloadFormat } from './types/payloadFormat';

interface Message {
  channel: string;
  text: string;
}

async function parseJsonSafely<T>(json: string): Promise<T> {
  return JSON.parse(json);
}

// TODO: validate .env

const app = new App({
  // logLevel: 'debug',
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

(async () => {
  const client = mqtt.connect(process.env.MQTT_BROKER!);

  const textTopic: string = process.env.MQTT_SUB_TEXT_TOPIC!;
  const jsonTopic: string = process.env.MQTT_SUB_JSON_TOPIC!;

  client.on('connect', () => {
    client.subscribe(textTopic.replace(':channel', '+'));
    client.subscribe(jsonTopic);
  });

  client.on('message', async (topic, payload) => {
    const payloadType = await inferPayloadFormatFromTopic(topic, {
      [PayloadFormat.Text]: textTopic,
      [PayloadFormat.Json]: jsonTopic,
    }).catch(e => {
      console.error('Received message with unexpected topic:', topic);
      // FIXME: appropreate error type
      throw new Error(e);
    });

    let message: Message;
    switch (payloadType) {
      case PayloadFormat.Text:
        message = {
          channel: await getChannelFromTextTopic(topic, textTopic),
          text: payload.toString(),
        };
        break;
      case PayloadFormat.Json:
        // TODO: validate JSON
        message = await parseJsonSafely<Message>(payload.toString());
        break;
    }

    // FIXME: no catch
    await app.client.chat.postMessage({ ...message });
  });
})();
