const config = require('./config');
const { createLogger, format, transports } = require('winston');
const WinstonCloudWatch = require('winston-cloudwatch');
const { combine, printf } = format;
const moment = require('moment-timezone');

// Custom log format
const myFormat = printf(({ level, message, timestamp, body }) => {
    let logOutput = `[${level}] ${timestamp} ${message}`;
    if (body) {
        logOutput += ` - body: ${JSON.stringify(body)}`; // Append body if present
    }
    return logOutput;
});

const logger = () => {
    const cloudwatchTransport = new WinstonCloudWatch({
        logGroupName: 'fusion_logs',
        logStreamName: `${moment().tz("Asia/Kolkata").format('YYYY-MM-DD')}-stream`,
        awsRegion: 'ap-south-1',
        jsonMessage: true,
        awsOptions: {
            credentials: {
                accessKeyId: config.aws.accessKeyId,
                secretAccessKey: config.aws.secretAccessKey
            },
            region: config.aws.region
        }
    });

    return createLogger({
        level: config.env === 'development' ? 'debug' : 'info',
        format: combine(
            format.timestamp({ format: () => moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss") }),
            myFormat
        ),
        transports: config.env === 'development' || config.env === 'production' ? [
            new transports.Console({
                format: combine(
                    format.colorize(),
                    myFormat
                ),
            }),
            cloudwatchTransport
        ] : [
            new transports.Console(),
            cloudwatchTransport
        ],
    });
}

module.exports = logger;