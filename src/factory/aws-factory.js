function tableItem (TableName, key, value, fields) {
  const param = {
    TableName,
    KeyConditionExpression: '#key = :value',
    ExpressionAttributeNames: {
      '#key': key
    },
    ExpressionAttributeValues: {
      ':value': value
    }
  }
  if (fields) {
    param.ProjectionExpression = ''
    for (const field of fields) {
      param.ProjectionExpression += `#${field},`
      param.ExpressionAttributeNames[`#${field}`] = field
    }
    param.ProjectionExpression = param.ProjectionExpression.slice(0, -1)
  }
  return param
}

function tableList (TableName, Limit, ExclusiveStartKey, fields) {
  var params = {
    TableName,
    FilterExpression: '#active = :active',
    Limit,
    ExpressionAttributeNames: {
      '#active': 'active'
    },
    ProjectionExpression: '',
    ExpressionAttributeValues: {
      ':active': true
    }
  };
  for (const field in fields) {
    params.ProjectionExpression += `,#${fields[field]}`
    params.ExpressionAttributeNames[`#${fields[field]}`] = fields[field]
  }
  if (!params.ProjectionExpression) delete params.ProjectionExpression
  if (params.ProjectionExpression) params.ProjectionExpression = params.ProjectionExpression.replace(',', '')
  if (ExclusiveStartKey) params.ExclusiveStartKey = ExclusiveStartKey
  return params
}

module.exports = {
  tableItem,
  tableList
}
