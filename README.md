# Ambisie SendBird Messenger
This is a widgetisation of the sample [Sendbird web-basic-sample code for desktop browsers](https://github.com/sendbird/SendBird-JavaScript/tree/master/web-basic-sample).

There is a significant amount of code in the samples to get a js chat client operational - so following their advice, we are amending theirs.

1. [Demo](#demo)
1. [Run the sample](#run-the-sample)
1. [Customizing the sample](#customizing-the-sample)

## [Demo](https://sample.sendbird.com/basic)
You can try out the ORIGINAL SENDBIRD live demo from the link [here](https://sample.sendbird.com/basic).

To try this one `npm start` and navigate to `http://localhost:9000`

Querystring params can be used to change participants in the chat:
`http://localhost:9000?sendBirdAppId=<SendBird APP ID>&userid=<your user id>&nickname=<your nickname>&targetuserid=<other persons user id>`

IF your user id is a new one - the server will create a user with that id.

We run against our Pre Prod SendBird server atm.

## Run the sample
1. Install packages

> Require that you have Node v8.x+ installed.

```bash
npm install
```

2. Run

```bash
npm start
```

## Dependencies
Ensure `lodash` is loading in the relevant env

## Building

* `npm start` - build distribution in `prod` mode and run the test server
* `npm run start:dev` - run webpack dev server
* `npm run build` - build distribution files (`/dist`) in `prod` mode
* `npm run dev` - build distribution files (`/dist`) in `dev` mode
* `npm run dev:w` - build distribution files (`/dist`) in `dev` mode and rebuild on file changes

## Developing

Run in separate terminals
* `npm run dev:w`
* `npm run start:dev`

