function objToDynamo (payload, partKey) {
  let UpdateExpression = 'SET ';
  let ExpressionAttributeValues = {};
  let ExpressionAttributeNames = {};
  const keys = Object.keys(payload);

  for (const key of keys) {
    const isArray = Array.isArray(payload[key])
    const isObject = isObj(payload[key])
    if (partKey !== key && !isArray && !isObject) {
      UpdateExpression += `#${key}=:${key},`;
      ExpressionAttributeValues[`:${key}`] = payload[key];
      ExpressionAttributeNames[`#${key}`] = key;
    }
    if (isObject) {
      const params = nestedObj(payload, key)
      UpdateExpression += params.UpdateExpression
      ExpressionAttributeValues = { ...ExpressionAttributeValues, ...params.ExpressionAttributeValues };
      ExpressionAttributeNames = { ...ExpressionAttributeNames, ...params.ExpressionAttributeNames };
    }
    if (isArray) {
      UpdateExpression += `#${key} = list_append(if_not_exists(#${key}, :empty_list), :${key}),`;
      ExpressionAttributeValues[`:${key}`] = payload[key];
      ExpressionAttributeNames[`#${key}`] = key;
      ExpressionAttributeValues[':empty_list'] = []
    }
  }

  UpdateExpression = UpdateExpression.slice(0, -1);

  return {
    UpdateExpression,
    ExpressionAttributeValues,
    ExpressionAttributeNames
  }
}

module.exports = {
  objToDynamo
}

function isObj (data) {
  return data instanceof Object
}

function nestedObj (data, field, _old = {}) {
  const keys = Object.keys(data[field])
  const params = {
    UpdateExpression: '',
    ExpressionAttributeValues: {},
    ExpressionAttributeNames: { [`#${field}`]: field }
  }
  for (const key of keys) {
    params.UpdateExpression += `#${field}.#${key}=:${key},`;
    params.ExpressionAttributeValues[`:${key}`] = data[field][key];
    params.ExpressionAttributeNames[`#${key}`] = key;
  }
  return params
}
