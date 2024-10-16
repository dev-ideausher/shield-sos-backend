require('dotenv').config();

const providerConfig = {
    wowpe: {
        'f1b21d61-e576-41ee-a090-7751fdd9cc93': {
            clientId: process.env.WOWPE_ACCOUNT_1_CLIENT_ID,
            secretKey: process.env.WOWPE_ACCOUNT_1_SECRET_KEY,
            number: process.env.WOWPE_ACCOUNT_1_PHONE_NUMBER
        },
    },
    eko: {
        'another-client-id': {
            developerKey: process.env.EKO_ACCOUNT_1_DEVELOPER_KEY,
            initiatorId: process.env.EKO_ACCOUNT_1_INITIATOR_ID,
            authenticatorKey: process.env.EKO_ACCOUNT_1_AUTHENTICATOR_KEY
        }
    }
};

module.exports = {
    providerConfig
}