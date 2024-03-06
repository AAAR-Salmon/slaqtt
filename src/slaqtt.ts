#!/usr/bin/env node

import { App as SlackApp } from '@slack/bolt';
import mqtt, { MqttClient } from 'mqtt';
import { getChannelFromTextTopic, inferPayloadFormatFromTopic } from './topic';
import { PayloadFormat } from './types/payloadFormat';

interface Message {
  channel: string;
  text: string;
}

async function parseJsonSafely<T>(json: string): Promise<T> {
  return JSON.parse(json);
}

async function main() {
  // TODO: validate .env

  const slackApp = new SlackApp({
    // logLevel: 'debug',
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
  });

  const mqttClient = mqtt.connect(process.env.MQTT_BROKER!);
  const mqttTopics = {
    textTopic: process.env.MQTT_SUB_TEXT_TOPIC!,
    jsonTopic: process.env.MQTT_SUB_JSON_TOPIC!,
  };

  run(slackApp, mqttClient, mqttTopics);
}

async function run(
  slackApp: SlackApp,
  mqttClient: MqttClient,
  mqttTopics: { textTopic: string; jsonTopic: string },
) {
  mqttClient.on('connect', () => {
    mqttClient.subscribe(mqttTopics.textTopic.replace(':channel', '+'));
    mqttClient.subscribe(mqttTopics.jsonTopic);
  });

  mqttClient.on('message', async (topic, payload) => {
    try {
      const payloadType = await inferPayloadFormatFromTopic(topic, {
        [PayloadFormat.Text]: mqttTopics.textTopic,
        [PayloadFormat.Json]: mqttTopics.jsonTopic,
      }).catch((e) => {
        console.error('Received message with unexpected topic:', topic);
        // FIXME: appropreate error type
        throw new Error(e);
      });

      let message: Message;
      switch (payloadType) {
        case PayloadFormat.Text:
          message = {
            // FIXME: no catch
            channel: await getChannelFromTextTopic(topic, mqttTopics.textTopic),
            text: payload.toString(),
          };
          break;
        case PayloadFormat.Json:
          // FIXME: no catch
          // TODO: validate JSON
          message = await parseJsonSafely<Message>(payload.toString());
          break;
      }

      // FIXME: no catch
      await slackApp.client.chat.postMessage({ ...message });
    } catch (e) {
      console.error(e);
    }
  });
}

main();
