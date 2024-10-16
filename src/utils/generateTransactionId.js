function generateTransactionId(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }

    const timestamp = Date.now().toString();
    result += timestamp;
    return result;
}

module.exports = {
    generateTransactionId
}