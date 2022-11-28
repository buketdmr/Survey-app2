/*
 Copyright 2017 IBM Corp.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

const express = require('express');
const session = require('express-session');
const memoryStore = require('memorystore')(session);
const path = require('path');
const nconf = require('nconf');

const helmet = require('helmet');
const express_enforces_ssl = require('express-enforces-ssl');
const cfEnv = require('cfenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rp = require('request-promise');
const Config = require('./config/config');

const errorHandler = require('./lib/error-handler/error-handler');

const surveysRouter = require('./routes/surveys');

const cog_base_url =
  process.env.DDE_BASE_URL ||
  'https://eu-gb.dynamic-dashboard-embedded.cloud.ibm.com';


const CALLBACK_URL = '/ibm/bluemix/appid/callback';

// const API_BASE_URL = 'https://powerx-api-development.eu-gb.mybluemix.net';
// const UI_BASE_URL = 'https://powerx-ui-development.eu-gb.mybluemix.net';

const API_BASE_URL = Config.app.apiBaseUri;
const UI_BASE_URL = Config.app.uiBaseUri;

console.log(Config);

var app = express();
var port = process.env.PORT || 3000;

whitelist = [UI_BASE_URL, API_BASE_URL, cog_base_url, 'http://cloud.ibm.com', undefined, null, 'null'];

//app.options('./site-config/save', cors());

app.use(
  cors({
    credentials: true,
    origin: function(origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const isLocal = cfEnv.getAppEnv().isLocal;
const config = getLocalConfig();
configureSecurity();

// Setup express application to use express-session middleware
// Must be configured with proper session storage for production
// environments. See https://github.com/expressjs/session for
// additional documentation
app.use(
  session({
    store: new memoryStore({
      checkPeriod: 86400000
    }),
    secret: 'keyboardcat',
    resave: true,
    saveUninitialized: true,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: !isLocal,
      maxAge: 600000000
    },
  })
);

//ROUTING
app.use('/surveys', surveysRouter);

function getLocalConfig() {
  if (!isLocal) {
    return {};
  }
  let config = {};
  const localConfig = nconf
    .env()
    .file(`${__dirname}/config/config.json`)
    .get();
  const requiredParams = [
  ];
  requiredParams.forEach(function(requiredParam) {
    if (!localConfig[requiredParam]) {
      console.error(
        'When running locally, make sure to create a file *config.json* in the root directory. See config.template.json for an example of a configuration file.'
      );
      console.error(`Required parameter is missing: ${requiredParam}`);
      process.exit(1);
    }
    config[requiredParam] = localConfig[requiredParam];
  });
  config['redirectUri'] = `${Config.app.apiBaseUri}${CALLBACK_URL}`;
  return config;
}

function configureSecurity() {
  app.use(helmet());
  app.use(cookieParser());
  app.use(helmet.noCache());
  app.enable('trust proxy');
  if (!isLocal) {
    app.use(express_enforces_ssl());
  }
}

app.use(function(err, req, res, next) {
  errorHandler.returnError(err, req, res, next);
});

module.exports = app;
