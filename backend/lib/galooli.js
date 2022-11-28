const axios = require('axios');
const _ = require('lodash');

const INTERFACING_API_URI = 'https://powerx-interface-api-development.eu-gb.mybluemix.net/api/';
const GALOOLI_URI = 'https://sdk.galooli-systems.com/galooliSDKService.svc/json/';
const INTERFACING_BASE_URI = 'https://powerx-interface-api-development.eu-gb.mybluemix.net';
const { userName, password } = { userName: 'PowerXEBI', password: '3M5TqOEr.'};

async function callGalooliApi(url) {
    try {
        let uri = url.replace(GALOOLI_URI, INTERFACING_API_URI);
        uri = uri.replace('Summary_Report', 'summaryreport');
        const response = await axios.post(`${INTERFACING_BASE_URI}/api/authenticate`, { secret: 'L!^+mETLydL8k_L6' });

        const options = {
            headers: {
                'x-access-token': response.data.token,
            },
        };

        console.log(`${uri}`);
        return await axios
            .get(uri, options)
            .then((result) => {
                if (result.data.body) {
                    return JSON.parse(result.data.body);
                } else {
                    return result.data;
                }
            })
            .catch((err) => {
                return { error: err };
            });
    } catch (err) {
        return { error: err };
    }
}

module.exports = callGalooliApi;
