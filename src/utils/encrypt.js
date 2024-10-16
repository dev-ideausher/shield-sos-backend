const crypto = require('crypto');

const encryptData = (encryptionKey, data) => {
    const iv = crypto.randomBytes(16);
    const keyBuffer = Buffer.from(encryptionKey, 'hex');
    const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted,
    };
}

const generateKey = () => {
    return crypto.randomBytes(32).toString('hex');
}

const decryptData = (encryptionKey, encryptedObj) => {
    const keyBuffer = Buffer.from(encryptionKey, 'hex');
    const ivBuffer = Buffer.from(encryptedObj.iv, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, ivBuffer);

    let decrypted = decipher.update(encryptedObj.encryptedData, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    return JSON.parse(decrypted);
};


const generateKey2 = (secretKey) => {
    return crypto.createHash("sha256").update(secretKey).digest();
};

const decryptText = (encryptedText, secretKey) => {
    try {
        const [ivHex, encryptedHex, authTagHex] = encryptedText.split(":");
        const iv = Buffer.from(ivHex, "hex");
        const encryptedBuffer = Buffer.from(encryptedHex, "hex");
        const authTag = Buffer.from(authTagHex, "hex");

        const key = crypto.createHash('sha256').update(secretKey).digest(); // Generate the same key used for encryption

        // Create decipher with aes-256-gcm algorithm
        const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);

        // Set the authentication tag
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedBuffer, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted; // Return the decrypted text
    } catch (error) {
        console.error("Decryption error:", error);
        return null; // Return null if decryption fails
    }
};


const decryptObjectData = (encryptionKey, data) => {
    try {
        const [iv, encryptedData] = data.split(":");
        // Hash the key to ensure it's 32 bytes long
        const hash = crypto.createHash('sha256');
        hash.update(encryptionKey);
        const keyBuffer = hash.digest(); // This will be 32 bytes

        const ivBuffer = Buffer.from(iv, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, ivBuffer);
        let decrypted = decipher.update(encryptedData, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');

        return JSON.parse(decrypted);
    } catch (error) {
        console.error('Decryption error:', error.message);
        return null; // Or handle the error as needed
    }
};


const encryptText = (plainText, secretKey) => {
    const key = crypto.createHash('sha256').update(secretKey).digest();
    const iv = crypto.randomBytes(12); // Initialization vector for GCM

    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    let encrypted = cipher.update(plainText, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag().toString("hex"); // Get GCM authentication tag

    return iv.toString("hex") + ":" + encrypted + ":" + authTag;
};


// let c = encryptText("superadmin", "fusion&%@34Vector")
// console.log(c)
// console.log(decryptText("6d3b449e330790ce808e01b4:d59199e2384680f9:9331fcfd0a7133b9324da390abaa9b4f", "fusion&%@34Vector"))

module.exports = {
    encryptData,
    generateKey,
    decryptData,
    decryptText,
    decryptObjectData,
    encryptText
}