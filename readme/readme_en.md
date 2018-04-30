# A self-use twitter bot which use Account Activity API

## Functions
- Download content pictures when you like a tweet.
- A tweet have multiple pictures and link will be sent to LINE and can be operated on LINE.
- The error message will be sent to LINE.

## Also support the Image websites' link in tweet
1. privatter
2. mosaic-neriko

## Use Docker to depoly
1. Create App in Twitter and Line developer center.
2. Apply Account Activity API
3. Fill the environment vars and start the app with `docker-compose up`
4. Use Account Activity API to register webhook (`https://${host}/twitter/account_activity`)

## Caution
Use Account Activity API to register webhook need https and only support 443 port.
Please config https and use reverse proxy or edit `docker-compose` file by yourself in your host server.
