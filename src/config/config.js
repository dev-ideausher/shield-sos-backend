const Joi = require("joi");
const path = require("path");
const dotnev = require("dotenv");

dotnev.config({ path: path.join(__dirname, "../../.env") });

// schema of env files for validation
const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid("test", "development", "production")
      .required(),
    PORT: Joi.number().default(8001),
    MONGODB_URL: Joi.string().required(),
    AWS_REGION: Joi.string().required(),
    AWS_ACCESS_KEY_ID: Joi.string().required(),
    AWS_SECRET_ACCESS_KEY: Joi.string().required(),
    AWS_S3_BUCKET: Joi.string().required(),
    FIREBASE_SECRET: Joi.string().required(),
  })
  .unknown();

// validating the process.env object that contains all the env variables
const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

// throw error if the validation fails or results into false
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  firebase_secret: envVars.FIREBASE_SECRET,
  aws: {
    name: envVars.AWS_S3_BUCKET,
    region: envVars.AWS_REGION,
    accessKeyId: envVars.AWS_ACCESS_KEY_ID,
    secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
  },
  mongoose: {
    url:
      envVars.NODE_ENV === "production"
        ? envVars.MONGODB_URL
        : envVars.MONGODB_URL,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
};
