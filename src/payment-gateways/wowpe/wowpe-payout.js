const axios = require('axios');
const providerConfig = require('../provider-config');

async function wowpeInitiateTransaction(clientKey, amount, ifscCode, accountNo, beneficiaryName, clientOrderId) {
    const selectedAccount = providerConfig.providerConfig.wowpe[clientKey];
    const url = 'https://api.wowpe.in/api/api/api-module/payout/payout';
    const payload = {
        clientId: selectedAccount.clientId,
        secretKey: selectedAccount.secretKey,
        number: selectedAccount.number,
        amount: amount,
        transferMode: 'IMPS',
        accountNo: accountNo,
        ifscCode: ifscCode,
        beneficiaryName: beneficiaryName,
        vpa: '123456789@ybl',
        clientOrderId: clientOrderId
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json'
            }
        });

        console.log('Wowpe payment Response:', response.data);
        return response.data;
    } catch (error) {
        console.error("wowpe initiate transaction error", error.message, error?.response?.data);
        return {
            status: false,
            message: error.message
        }
    }
}

async function verifyBankAccountByWowpe(clientKey, accountNo, ifscCode, clientOrderId) {
    const selectedAccount = providerConfig.providerConfig.wowpe[clientKey];
    const url = 'https://api.wowpe.in/api/api/api-module/payout/account-validate';
    const payload = {
        clientId: selectedAccount.clientId,
        secretKey: selectedAccount.secretKey,
        number: selectedAccount.number,
        accountNo: accountNo,
        ifscCode: ifscCode,
        clientOrderId: clientOrderId
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json'
            }
        });

        console.log('Wowpe bank account verification:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

async function checkWowpeBalance(clientKey) {
    const selectedAccount = providerConfig.providerConfig.wowpe[clientKey];
    const url = 'https://api.wowpe.in/api/api/api-module/payout/balance';
    const payload = {
        clientId: selectedAccount.clientId,
        secretKey: selectedAccount.secretKey,
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json'
            }
        });

        console.log('Wowpe Fetch Balance Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

async function checkTransactionStatus(receipt) {
    let clientKey = "f1b21d61-e576-41ee-a090-7751fdd9cc93"
    const selectedAccount = providerConfig.providerConfig.wowpe[clientKey];
    const url = 'https://api.wowpe.in/api/api/api-module/payout/status-check';
    const payload = {
        clientId: selectedAccount.clientId,
        secretKey: selectedAccount.secretKey,
        clientOrderId: receipt
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        console.error("wowpe initiate transaction error", error.message, error?.response?.data);
        return {
            status: false,
            message: error.message
        }
    }
}

// payin
async function createPayinOrder(data) {
    let clientKey = "f1b21d61-e576-41ee-a090-7751fdd9cc93"
    const selectedAccount = providerConfig.providerConfig.wowpe[clientKey];
    try {
        const response = await axios.post('https://api.wowpe.in/api/api/api-module/payin/orders', {
            clientId: selectedAccount.clientId,
            secretKey: selectedAccount.secretKey,
            name: data.name,
            mobileNo: data.mobileNo,
            emailID: data.emailID,
            amount: data.amount,
            clientOrderId: data.clientOrderId
        }, {
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json'
            }
        });

        console.log('Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        throw error;
    }
}

async function getDeepLink(data) {
    let clientKey = "f1b21d61-e576-41ee-a090-7751fdd9cc93"
    const selectedAccount = providerConfig.providerConfig.wowpe[clientKey];
    try {
        const response = await axios.post('https://api.wowpe.in/api/api/api-module/payin/intent-initiate', {
            clientId: selectedAccount.clientId,
            secretKey: selectedAccount.secretKey,
            note: data.note,
            orderId: data.orderId
        }, {
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json'
            }
        });

        console.log('Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// const payinData = {
//     name: 'John Doe',
//     mobileNo: '1234567890',
//     emailID: 'johndoe@example.com',
//     amount: '1000',
//     clientOrderId: 'order1234'
// };
// createPayinOrder(payinData)

// const intentData = {
//     note: 'Sample note',
//     orderId: 'ENANOD24375100'
// };

// getDeepLink(intentData)

// verifyBankAccountByWowpe("97f4b313-7422-419c-a991-50a1355a6100", "40672202936", "SBIN0011201", "1234567817")
// checkWowpeBalance("97f4b313-7422-419c-a991-50a1355a6100")

// validateAccount()

// validateAccount()
// checkWowpeBalance()

// wowpePayout()

module.exports = {
    wowpeInitiateTransaction,
    checkWowpeBalance,
    verifyBankAccountByWowpe,
    checkTransactionStatus
}