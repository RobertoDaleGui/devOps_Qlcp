'use strict';
const awsApi = require('../apis/aws-api');
const awsFactory = require('../factory/aws-factory')
const { v4: uuid } = require('uuid')
const { owner } = require('../utils/keysFromJWT')
const { objToDynamo } = require('../utils/aws-utils')
const errorParser = require('../utils/error-parser')

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

async function setTableItem (TableName, key, { body, ...event }, validator) {
  return validator(JSON.parse(body))
    .then(res => {
      const params = {
        TableName,
        Item: { [key]: uuid(), active: true, owner: owner(event), ...res }
      };
      return awsApi.dynamoPut(params)
    }).catch(err => { throw err })
}

async function editTableItemAttribute (TableName, Key, data, validator) {
  return validator(JSON.parse(data))
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

module.exports = {
  setTableItem,
  getTableItem,
  getTableList,
  editTableItemAttribute
}
