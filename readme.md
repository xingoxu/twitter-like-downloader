[English](readme/readme_en.md)
[日本語](readme/readme_jp.md)

# 一个使用 Account Activity API 的自用推特机器人

## 功能
- 点赞时自动下载点赞内容图片
- 多张图片与链接同时出现时发送消息至LINE且可以在LINE进行操作
- 失败时发送错误信息至LINE

## 还支持如下的图片网站的链接
1. privatter
2. mosaic-neriko

## 使用Docker进行部署
1. 推特、LINE 开发者中心注册应用
2. 需要开通 Account Activity API
3. 填入环境变量，`docker-compose up` 启动应用
4. 使用 Account Activity API 注册 webhook (`https://${host}/twitter/account_activity`)

## 注意
Account Activity API 注册 webhook 链接需要 https 且 443 端口，请在宿主机上配置 https 并反代或者自己改写 `docker-compose` 文件部署。

Account Activity API 申请及问题 可以[查看](https://blog.xingoxu.com/2018/04/twitter-account-activity-api/)