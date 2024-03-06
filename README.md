# Slaqtt

Slack と MQTT ブローカを接続するためのブリッジ

## 機能

- [x] MQTT メッセージを subscribe し Slack にメッセージを送信する
- [ ] Slack のメッセージを監視し MQTT メッセージを publish する

## セットアップ手順

### 依存ソフトウェア

* Node.js 20+

### Slack app の作成

1. [Slack API][slack-api-app] のページから Create New App を押す．
2. From Scratch を選び，アプリ名を適当に決める．
3. Slaqtt を利用するワークスペースを選ぶ．
4. OAuth & Permissions から以下の Bot Token Scopes を追加する．
   + channels:join
   + chat:write
5. 同ページから Install to Workspace を押し，権限を確認した後インストールする．

### 実行

1. このリポジトリを clone する．
2. `.env.example` をコピーし `.env` とする．
3. Signing Secret と Bot User OAuth Token を [Slack API][slack-api-app] のページから取得し `.env` に書き込む．
4. MQTT ブローカのアドレスと Subscribe する Topic を `.env` に書き込む．
5. リポジトリのディレクトリに移動する (`cd slaqtt`)．
6. `npm install; npm run build; npm run start:env`

## 利用方法

### メッセージの送信

メッセージを送信するためには予め [Slack app の作成](#slack-app-の作成) で作成した app をチャンネルに追加しておく必要がある．

#### JSON

`.env` に `MQTT_SUB_JSON_TOPIC` で指定した MQTT Topic で，以下の形式の JSON メッセージを Publish することで，このブリッジはメッセージを送信する．

```json
{
   "channel": "<チャンネル名 または チャンネル ID>",
   "text": "<メッセージの内容>"
}
```

#### プレーンテキスト

`.env` に `MQTT_SUB_TEXT_TOPIC` で指定した MQTT Topic で，テキストを Publish することで，このブリッジはメッセージを送信する．

送信先のチャンネルは `MQTT_SUB_TEXT_TOPIC` の設定値の `:channel` を置換して設定する．
例えば，`MQTT_SUB_TEXT_TOPIC=a/topic/to/subscribe/text/:channel` の場合，Topic が `a/topic/to/subscribe/text/general` であるメッセージを Publish することで，ブリッジは general チャンネルにメッセージを送信する．

テキストのエンコーディングは UTF-8 を用いる必要がある．

[slack-api-app]: https://api.slack.com/apps
