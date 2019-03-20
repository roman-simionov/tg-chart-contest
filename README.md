# Telegram Contests JS Application

This is a simple web application that shows 5 charts on a page.

The application is deployed [here](https://simionov-tg-chart.azurewebsites.net)

## Supported browsers

### Desktop browsers

* Google Chrome
* Safari (excluding Safari for Windows)
* Opera

### Browsers integrated in the following mobile OS

* iOS (latest)
* Android (latest)

## Install and Run

Install packages that is required for building the application using the following command:

```bash
npm install
```

After installation, the following NPM scripts are available:

- `npm run build` - bundles minified js bundle from sources to ./app/js/bundle.js
- `npm run build-dev` - bundles js bundle with map sources to ./app/js/bundle.js
- `npm start` - builds dev bundle and starts dev-server on http://localhost:8080

Setup a local web server in ./app after building the bundle folder and run this application in it or use dev-server and go to http://localhost:8080 in your browser
