function owner (data) {
  const { authorizer: { claims: decToken } } = data.requestContext;
  if (decToken.type === 'Partner') return `Partner_${decToken.relatedId}`
  return `CRM_${decToken.relatedId}`
}

module.exports = {
  owner
}
