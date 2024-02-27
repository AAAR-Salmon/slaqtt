#!/usr/bin/env node

import 'dotenv/config';
import { App } from '@slack/bolt';
import mqtt from 'mqtt';

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
    const payloadType = inferPayloadTypeFromTopic(topic, {
      [PayloadType.Text]: textTopic,
      [PayloadType.Json]: jsonTopic,
    });
    if (payloadType === null) {
      console.error('Received message with unexpected topic:', topic);
      return;
    }

    let message: Message;
    switch (payloadType) {
      case PayloadType.Text:
        message = {
          channel: getChannelFromTextTopic(topic, textTopic),
          text: payload.toString(),
        };
        break;
      case PayloadType.Json:
        // TODO: validate JSON
        message = await parseJsonSafely<Message>(payload.toString());
        break;
    }

    // FIXME: no catch
    await app.client.chat.postMessage({ ...message });
  });
})();

enum PayloadType {
  Text = "text/plain",
  Json = "application/json",
}

function inferPayloadTypeFromTopic(
  topic: string,
  pattern: { [key in PayloadType]: string },
): PayloadType | null {
  if (topic === pattern[PayloadType.Json]) {
    return PayloadType.Json;
  }

  const re = new RegExp(pattern[PayloadType.Text].replace(':channel', '(?<channel>[^/]+)'));
  if (re.test(topic)) {
    return PayloadType.Text;
  }

  return null;
}

function getChannelFromTextTopic(topic: string, pattern: string): string {
  // FIXME: duplicated code
  const re = new RegExp(pattern.replace(':channel', '(?<channel>[^/]+)'));
  const match = topic.match(re)!;
  return match.groups!.channel;
}