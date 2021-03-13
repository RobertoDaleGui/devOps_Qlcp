'use strict';
const awsApi = require('../apis/aws-api');
const awsFactory = require('../factory/aws-factory')
const { objToDynamo } = require('../utils/aws-utils')
const errorParser = require('../utils/error-parser')
const { httpFactory } = require('../factory/responses/httpFactory')

async function getTableItem (table, key, value, fields) {
  const params = awsFactory.tableItem(table, key, value, fields);
  return awsApi.dynamoGet(params)
    .catch(err => { throw errorParser(err) });
}

// A variável "_old" é de uso interno, não deve ser usada.
async function getTableList (TableName, Limit, ExclusiveStartKey, fields, _old = []) {
  const params = awsFactory.tableList(TableName, Limit, ExclusiveStartKey, fields)
  return awsApi.dynamoScan(params)
    .then(res => {
      if (typeof res.LastEvaluatedKey !== 'undefined' && res.Count < Limit) {
        _old.push(...res.Items)
        return getTableList(TableName, Limit - res.Count, res.LastEvaluatedKey, fields, _old)
      }
      return {
        Items: [..._old, ...res.Items],
        LastEvaluatedKey: res.LastEvaluatedKey,
        Count: res.Count + _old.length
      }
    })
}

async function setTableItem (TableName, data, key, validator) {
  return validator(data)
    .then(res => {
      return getTableItem(TableName, key, res[key])
        .then(_res => {
          if (_res.Count) {
            throw httpFactory('O e-mail informado já está sendo usado por outro usuário', 409)
          }
          const params = {
            TableName,
            Item: { active: true, ...res }
          };
          return awsApi.dynamoPut(params)
        })
    })
    .catch(err => {
      if (err.details) throw httpFactory(err.details, 400)
      throw httpFactory(JSON.parse(err.body), err.statusCode)
    })
}

async function editTableItemAttribute (TableName, Key, data, validator) {
  return validator(data)
    .then(res => {
      const dynamoDataObj = objToDynamo(res, Key)
      const param = {
        TableName,
        Key,
        UpdateExpression: dynamoDataObj.UpdateExpression,
        ExpressionAttributeValues: dynamoDataObj.ExpressionAttributeValues,
        ExpressionAttributeNames: dynamoDataObj.ExpressionAttributeNames
      }
      return awsApi.dynamoUpdate(param)
        .catch(err => { throw err })
    }).catch(err => { throw errorParser(err) })
}

async function getsecretKey () {
  return awsApi.getSecretMng(process.env.SECRET_NAME)
    .then(res => JSON.parse(res.SecretString)[`secretKey-${process.env.STAGE}`])
}

module.exports = {
  setTableItem,
  getTableItem,
  getTableList,
  editTableItemAttribute,
  getsecretKey
}
