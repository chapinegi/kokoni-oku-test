# こころの荷物置き場 — 検索需要実証サイト

AI傾聴サービスを開発する前に、検索流入と「AIに聞いてほしい」需要を確認するための静的サイトです。

- 本文入力は現在サーバーへ送信・保存しない
- AI/APIは未接続
- GitHub Pages で公開
- 公開URL: https://chapinegi.github.io/kokoni-oku-test/

## 現在の実証フロー

1. 会話前に「今は、どうしてほしい？」を選択
   - ただ聞いてほしい
   - 共感してほしい
   - 気持ちを整理したい
   - アドバイスもほしい
   - 自分でもまだ分からない
2. 選択内容は `sessionStorage` に一時保持
3. 本文は端末上だけで入力
4. 「AIに文章で聞いてほしい」「AIに声で聞いてほしい」で需要を確認

## AI接続後に使う終了フロー

`assets/app.js` に将来用の終了時評価UIを実装済みです。

- 会話の5段階評価
- 最初に選んだ希望に合っていたか
- 匿名の改善用データ提供の可否
- 匿名提供の説明だけはAI人格と分離した運営側の敬語

AI会話終了時に以下を呼ぶ想定です。

```js
window.KokoroListening.completeConversation({ tone: 'polite' });
// または tone: 'casual'
```

本文の匿名提供先は未設定です。`window.KOKORO_FEEDBACK_ENDPOINT` に安全な送信先を設定するまで、会話本文は送信されません。

## Pages 設定

Settings → Pages → Source: Deploy from a branch → main / (root)
