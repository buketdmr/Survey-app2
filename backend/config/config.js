let env = process.env.NODE_ENV; // 'dev' or 'test'

if (env === undefined) {
    env = 'localhost'
}

const localhost = {
    app: {
        surveyEmailSentTo: 'powerx-monitoring@ebisolutions.co.uk',
        dropTestRequestSentTo: 'powerx-monitoring@ebisolutions.co.uk',
        surveyEmailSentFrom: 'powerx-monitoring@ebisolutions.co.uk',
        dropTestRequestSentFrom: 'powerx-monitoring@ebisolutions.co.uk',
        uiBaseUri: 'http://localhost:4200',
        apiBaseUri: 'http://localhost:3000',
        port: 3000
    },
    db: {
        dsn:
            'DATABASE=BLUDB;HOSTNAME=aea0c5d8-0f7e-4e18-b3f6-07c310297e6d.bs2io90l08kqb1od8lcg.databases.appdomain.cloud;UID=im1vkwot;PWD=mFBEtelKHxaPDe3C;PORT=31789;PROTOCOL=TCPIP;currentSchema=BUCAP;Security=SSL',
        host: 'aea0c5d8-0f7e-4e18-b3f6-07c310297e6d.bs2io90l08kqb1od8lcg.databases.appdomain.cloud',
        port: 31789,
        name: 'BLUDB',
    }
};

const development = {
    app: {
        surveyEmailSentTo: 'powerx-monitoring@ebisolutions.co.uk',
        dropTestRequestSentTo: 'powerx-monitoring@ebisolutions.co.uk',
        surveyEmailSentFrom: 'powerx-monitoring@ebisolutions.co.uk',
        dropTestRequestSentFrom: 'powerx-monitoring@ebisolutions.co.uk',
        uiBaseUri: 'https://powerx-ui-development.eu-gb.mybluemix.net',
        apiBaseUri: 'https://powerx-api-development.eu-gb.mybluemix.net',
        port: 8080
    },
    db: {
        dsn:
            'DATABASE=BLUDB;HOSTNAME=aea0c5d8-0f7e-4e18-b3f6-07c310297e6d.bs2io90l08kqb1od8lcg.databases.appdomain.cloud;UID=im1vkwot;PWD=mFBEtelKHxaPDe3C;PORT=31789;PROTOCOL=TCPIP;currentSchema=BUCAP;Security=SSL',
        host: 'aea0c5d8-0f7e-4e18-b3f6-07c310297e6d.bs2io90l08kqb1od8lcg.databases.appdomain.cloud',
        port: 31789,
        name: 'BLUDB',
    }
};

const production = {
    app: {
        surveyEmailSentTo: 'powerx-monitoring@ebisolutions.co.uk',
        dropTestRequestSentTo: 'powerx-monitoring@ebisolutions.co.uk',
        surveyEmailSentFrom: 'powerx-monitoring@ebisolutions.co.uk',
        dropTestRequestSentFrom: 'powerx-monitoring@ebisolutions.co.uk',
        uiBaseUri: 'https://powerx-ui-development.eu-gb.mybluemix.net',
        apiBaseUri: 'https://powerx-api-development.eu-gb.mybluemix.net',
        port: 8080
    },
    db: {
        dsn:
            'DATABASE=BLUDB;HOSTNAME=aea0c5d8-0f7e-4e18-b3f6-07c310297e6d.bs2io90l08kqb1od8lcg.databases.appdomain.cloud;UID=im1vkwot;PWD=mFBEtelKHxaPDe3C;PORT=31789;PROTOCOL=TCPIP;currentSchema=BUCAP;Security=SSL',
        host: 'aea0c5d8-0f7e-4e18-b3f6-07c310297e6d.bs2io90l08kqb1od8lcg.databases.appdomain.cloud',
        port: 31789,
        name: 'BLUDB',
    }
};

const config = {
    localhost,
    development,
    production,
};

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
        'clientId',
        'secret',
        'tenantId',
        'oauthServerUrl',
        'profilesUrl',
    ];
    requiredParams.forEach(function (requiredParam) {
        if (!localConfig[requiredParam]) {
            console.error(
                'When running locally, make sure to create a file *config.json* in the config directory.'
            );
            console.error(`Required parameter is missing: ${requiredParam}`);
            process.exit(1);
        }
        config[requiredParam] = localConfig[requiredParam];
    });
    //config['redirectUri'] = `http://localhost:${port}${CALLBACK_URL}`;
    // config[
    //   'redirectUri'
    // ] = `https://powerx-api-development.eu-gb.mybluemix.net:${port}${CALLBACK_URL}`;

    config[
        'redirectUri'
    ] = `http://localhost:${port}${CALLBACK_URL}`;

    return config;
}

module.exports = config[env];
