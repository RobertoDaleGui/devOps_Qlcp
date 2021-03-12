function httpFactory (message, code) {
  return {
    statusCode: code,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(message, null, 2)
  }
}

module.exports = { httpFactory };
