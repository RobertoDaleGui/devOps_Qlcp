'use strict';
const { httpFactory } = require('../factory/responses/httpFactory')
const { getTableList } = require('../services/aws-sevice')
const table = 'Users-staging'

async function getUsers (event) {
  const { limit, next } = (event.queryStringParameters || {})
  const ExclusiveStartKey = next ? { email: next } : null
  return getTableList(table, limit, ExclusiveStartKey, ['email', 'name', 'active'])
    .then(res => {
      if (res.Count < 1) return httpFactory('Nenhum usuário encontrado', 404)
      return httpFactory(res, 200)
    })
}
async function createUser (event) {
  return httpFactory('Tudo ok', 200)
}
async function getUser (event) {
  return httpFactory('Tudo ok', 200)
}
async function editUser (event) {
  return httpFactory('Tudo ok', 200)
}
async function deleteUser (event) {
  return httpFactory('Tudo ok', 200)
}
async function editPasword (event) {
  return httpFactory('Tudo ok', 200)
}

module.exports = {
  getUsers,
  createUser,
  getUser,
  editUser,
  deleteUser,
  editPasword
}
