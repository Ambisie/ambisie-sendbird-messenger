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

## Customizing the sample
If you want to put some changes into the sample, you should build it using `webpack`.

1. Install packages

> Require that you have Node v8.x+ installed.

```bash
npm install
```

2. Modify files
If you want to change `APP_ID`, change `APP_ID` in const.js to the other `APP_ID` you want.
You can test the sample with local server by running the following command.

```bash
npm run start:dev
```

3. Build the sample
When the modification is complete, you'll need to bundle the file using `webpack`. The bundled files are created in the `dist` folder.
Please check `webpack.config.js` for settings.

```bash
npm run build
```

> The `npm start` command contains `npm run build`. Check the scripts part of the package.json file.
