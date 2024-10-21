const AWS = require('aws-sdk');
const config = require("../config/config");

AWS.config.update({
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
    region: config.aws.region
});

const iot = new AWS.Iot();

function generateUniquePassword() {
    return Math.random().toString(36).substring(2, 15);
}

async function createIoTDevice(macAddress) {
    const thingName = macAddress.replace(/:/g, '');

    try {
        // Step 1: Create the IoT Thing
        const thing = await iot.createThing({ thingName }).promise();
        console.log('Thing Created:', thing);

        // Step 2: Generate a unique password (for authentication)
        const uniquePassword = generateUniquePassword();

        // Store the generated credentials (username = MAC address, password = uniquePassword)
        console.log(`Device Credentials: MAC Address (username): ${thingName}, Password: ${uniquePassword}`);

        // No need to attach a policy directly; the custom authorizer will return the policy

        // Return the device credentials (username and password)
        return {
            username: thingName,
            password: uniquePassword,
            thingId: thing.thingId
        };

    } catch (error) {
        console.error('Error creating IoT device:', error);
    }
}

async function deleteIoTDevice(macAddress) {
    const thingName = macAddress.replace(/:/g, '');

    try {
        // Step 1: List the principals (attached certificates) of the IoT thing
        const attachedPrincipals = await iot.listThingPrincipals({ thingName }).promise();

        for (let principal of attachedPrincipals.principals) {
            // Step 2: Detach policies associated with the certificate (principal)
            const attachedPolicies = await iot.listPrincipalPolicies({ principal }).promise();
            for (let policy of attachedPolicies.policies) {
                await iot.detachPolicy({ policyName: policy.policyName, target: principal }).promise();
            }

            // Step 3: Detach the certificate from the Thing
            await iot.detachThingPrincipal({ thingName, principal }).promise();

            // Step 4: Inactivate and delete the certificate
            const certificateId = principal.split('/')[1]; // Extract the certificateId from the ARN
            await iot.updateCertificate({ certificateId, newStatus: 'INACTIVE' }).promise();
            await iot.deleteCertificate({ certificateId, forceDelete: true }).promise();
        }

        // Step 5: Delete the IoT Thing
        const deleteThingResult = await iot.deleteThing({ thingName }).promise();
        console.log('Thing Deleted:', deleteThingResult);

        return { success: true, message: `IoT Device ${thingName} deleted successfully.` };
    } catch (error) {
        console.error('Error deleting IoT device:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    createIoTDevice,
    deleteIoTDevice
}

// // Example usage: Provide a MAC address
// const macAddress = '11:22:33:44:55:66'; // Replace with the actual MAC address
// createIoTDevice(macAddress)
//     .then((credentials) => {
//         console.log('Device Credentials:', credentials);
//     })
//     .catch((error) => {
//         console.error('Failed to create IoT device:', error);
//     });