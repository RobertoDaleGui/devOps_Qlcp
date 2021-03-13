const AWS = require('aws-sdk');
const region = process.env.AWS_DEPLOY_REGION

const dynamoDb = new AWS.DynamoDB.DocumentClient({
  api_version: process.env.AWS_DYNAMODB_VERSION,
  region: region
})

const secretMng = new AWS.SecretsManager({ region: region })

if (process.env.IS_LOCAL || process.env.IS_OFFLINE || process.env.SERVERLESS_TEST_ROOT || process.env.NODE_ENV === 'test') {
  const credentials = new AWS.SharedIniFileCredentials({ profile: 'Roberlove' });
  AWS.config.credentials = credentials;
}

function dynamoGet (data) {
  return dynamoDb.query(data).promise();
}

async function dynamoScan (data) {
  return dynamoDb.scan(data).promise()
}

async function dynamoPut (data) {
  return dynamoDb.put(data).promise()
}

async function dynamoUpdate (data) {
  return dynamoDb.update(data).promise()
}

function getSecretMng (data) {
  return secretMng.getSecretValue({ SecretId: data }).promise()
}

module.exports = {
  dynamoGet,
  dynamoPut,
  dynamoScan,
  dynamoUpdate,
  getSecretMng
}
