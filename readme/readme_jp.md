# Account Activity API使ってる自家用ツイッターBotです

## 機能
- いいねする時勝手にイメージをダウンロードします
- 複数イメージとリンク同時に現れた時LINEにメッセージを送ります、しかもLINEで操作可能
- エラーが発生されたらLINEで知らせます

## ツィート内のイメージリンクサイトもサポートしている
1. privatter
2. mosaic-neriko

## Dockerでデプロイします
1. ツイッター、LINE developer center にアプリを作り
2. Account Activity API を申請
3. 環境変数を記入して、`docker-compose up` で起動
4. Account Activity API を使う、webhook を登録 (`https://${host}/twitter/account_activity`)

## 注意
Account Activity API に登録の webhook は https と 443 ポートのみサポートします、ホスト機に https を配置してリバースプロキシしてください、または自分で`docker-compose`ファイルを書き換えてデプロイします。

Account Activity API の申請[参考](https://blog.xingoxu.com/ja/2018/04/twitter-account-activity-api/)