const morgan = require('morgan');
const config = require('./config');
const logger = require('./logger');

// Custom token to capture the error message
morgan.token('message', (req, res) => {
  return res.locals.errorMessage || 'No message';
});

morgan.token('client-ip', (req) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP';
  return Array.isArray(ip) ? ip[0] : ip.split(',')[0].trim();
});

morgan.token('username', (req) => {
  return req.user && req.user.username ? req.user.username : '';
});

// // Capture request body
// morgan.token('body', (req) => {
//   try {
//     return req.body ? JSON.stringify(req.body) : 'No body';
//   } catch (error) {
//     return 'Invalid body';
//   }
// });

// morgan.token('response-body', (req, res) => {
//   return res.locals.responseBody ? JSON.stringify(res.locals.responseBody) : 'No response';
// });

morgan.token('body', (req) => {
  try {
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {

      // Prepare an array to hold file metadata
      const filesInfo = [];

      // Iterate over each field in req.files
      for (const fieldName in req.files) {
        if (req.files[fieldName]) {
          // req.files[fieldName] is an array, so iterate over it
          req.files[fieldName].forEach(file => {
            filesInfo.push({
              fieldname: file.fieldname,
              originalname: file.originalname,
              size: file.size,
              mimetype: file.mimetype
            });
          });
        }
      }

      // Combine the other request body data with the file metadata
      const combinedBody = {
        ...req.body,  // Include other non-file fields
        files: filesInfo  // Add the file metadata
      };
      // Return the combined request body and file data as a JSON string
      return JSON.stringify(combinedBody);
    }

    return req.body ? JSON.stringify(req.body) : 'No body';
  } catch (error) {
    return 'Invalid body';
  }
});

morgan.token('response-body', (req, res) => {
  try {
    return res.locals.responseBody ? JSON.stringify(res.locals.responseBody) : 'No response';
  } catch (error) {
    return 'Invalid response';
  }
});

// Define log formats for success and error responses
const successResponseFormat = `:client-ip -u :username -u :method :url :status - :response-time ms - body: :body - response: :response-body`;
const errorResponseFormat = `:client-ip -u :username -u :method :url :status - :response-time ms - body: :body - message: :message - response: :response-body`;

const successHandler = morgan(successResponseFormat, {
  skip: (req, res) => req.method === 'OPTIONS' || res.statusCode >= 400,
  stream: {
    write: (message) => {
      try {
        const logParts = message.trim().split(' - body: ');
        const clientIp = logParts[0].split(' -u ')[0];
        const username = logParts[0].split(' -u ')[1];
        const logMessage = logParts[0].split(' -u ')[2];

        const logBody = logParts[1] ? JSON.parse(logParts[1].split(' - response: ')[0]) : {};
        const logResponse = logParts[1] ? JSON.parse(logParts[1].split(' - response: ')[1]) : {};

        logger().info(logMessage, { ip: clientIp, username, body: logBody, response: logResponse });
      } catch (error) {
        logger().error('Error processing success log message', {
          error: error.message,
          originalMessage: message,
        });
      }
    },
  },
});

const errorHandler = morgan(errorResponseFormat, {
  skip: (req, res) => req.method === 'OPTIONS' || res.statusCode < 400,
  stream: {
    write: (message) => {
      try {

        const logParts = message.trim().split(' - body: ');
        const clientIp = logParts[0].split(' -u ')[0];
        const username = logParts[0].split(' -u ')[1];
        const logMessage = logParts[0].split(' -u ')[2];


        let logBody = {};
        let logResponse = {};
        let logErrorMessage = 'No message';

        if (logParts[1]) {
          const bodyPart = logParts[1].split(' - message: ')[0] || 'No body';
          const messagePart = logParts[1].split(' - message: ')[1] || '';
          const responsePart = messagePart.split(' - response: ')[1] || 'No response';

          try {
            logBody = JSON.parse(bodyPart);
          } catch (e) {
            logBody = bodyPart;
          }

          logErrorMessage = messagePart.split(' - response: ')[0] || 'No message';

          try {
            logResponse = JSON.parse(responsePart);
          } catch (e) {
            logResponse = responsePart;
          }
        }

        logger().error(logMessage, { ip: clientIp, username: username, body: logBody, message: logErrorMessage, response: logResponse });
      } catch (error) {
        console.log("Logging error:", error);
        logger().error('Error processing error log message', {
          error: error.message,
          originalMessage: message,
        });
      }
    },
  },
});

module.exports = {
  successHandler,
  errorHandler,
};