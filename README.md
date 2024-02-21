# Slaqtt

Slack と MQTT ブローカを接続するためのブリッジ

## 機能

- [x] MQTT メッセージを subscribe し Slack にメッセージを送信する
- [ ] Slack のメッセージを監視し MQTT メッセージを publish する

## 使用方法

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
2. .env.example をコピーし .env とする．
3. Signing Secret と Bot User OAuth Token を [Slack API][slack-api-app] のページから取得し .env に書き込む．
4. MQTT ブローカのアドレスと Subscribe する Topic を .env に書き込む．

### メッセージの送信

指定した MQTT Topic で以下の形式の JSON メッセージを Publish することで，このブリッジはメッセージを送信する．
メッセージを送信するためには予め <u>Slack app の作成</u> で作成した app をチャンネルに追加しておく必要がある．

```json
{
   "channel": "<チャンネル名 または チャンネル ID>",
   "text": "<メッセージの内容>"
}
```

[slack-api-app]: https://api.slack.com/apps
