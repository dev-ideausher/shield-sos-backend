const axios = require('axios');

const retryApiCall = async (url, payload, retries = 2) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response;
        } catch (error) {
            if (i === retries - 1) throw error;
        }
    }
};

module.exports = {
    retryApiCall
}