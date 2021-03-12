'use strict';
const { httpFactory } = require('../factory/responses/httpFactory')
const awsService = require('../services/aws-sevice')
const table = process.env.TB_USER
const validator = require('../validators/user')
const bcrypt = require('bcryptjs')
const { tokenValidator } = require('./auth')

async function getUsers (event) {
  const validToken = await tokenValidator(event.headers.Authorization)
  if (!validToken) return httpFactory('Usuário não autorizado', 401)
  const { limit, next } = (event.queryStringParameters || {})
  const ExclusiveStartKey = next ? { email: next } : null
  return awsService.getTableList(table, limit, ExclusiveStartKey, ['email', 'name'])
    .then(res => {
      if (res.Count < 1) return httpFactory('Nenhum usuário encontrado', 404)
      return httpFactory(res, 200)
    })
}
async function createUser (event) {
  const validToken = await tokenValidator(event.headers.Authorization)
  if (!validToken) return httpFactory('Usuário não autorizado', 401)
  const data = JSON.parse(event.body)
  if (data.password) data.password = await bcrypt.hash(data.password, 10)
  return awsService.setTableItem(table, data, 'email', validator.createUser)
    .then(res => {
      return httpFactory('Usuário criado.', 200)
    })
    .catch(err => {
      return httpFactory(JSON.parse(err.body), err.statusCode)
    })
}
async function getUser (event) {
  const { email } = event.pathParameters
  const validToken = await tokenValidator(event.headers.Authorization)
  if (!validToken) return httpFactory('Usuário não autorizado', 401)
  return awsService.getTableItem(table, 'email', email, ['name', 'email'])
    .then(res => {
      if (!res.Count) return httpFactory('Usuário não encontrado.', 404)
      return httpFactory(res.Items[0], 200)
    })
}
async function editUser (event) {
  const validToken = await tokenValidator(event.headers.Authorization)
  if (!validToken) return httpFactory('Usuário não autorizado', 401)
  const { email } = event.pathParameters
  const data = JSON.parse(event.body)
  if (data.password) data.password = await bcrypt.hash(data.password, 10)
  return awsService.getTableItem(table, 'email', email)
    .then(res => {
      if (!res.Count) return httpFactory('Usuário não encontrado.', 404)
      return awsService.editTableItemAttribute(table, { email }, data, validator.editUser)
        .then(res => httpFactory('Usuario editado.', 200))
        .catch(err => httpFactory(err.body, err.code))
    })
}
async function deleteUser (event) {
  const validToken = await tokenValidator(event.headers.Authorization)
  if (!validToken) return httpFactory('Usuário não autorizado', 401)
  const { email } = event.pathParameters
  const data = { active: false }
  return awsService.getTableItem(table, 'email', email)
    .then(res => {
      if (!res.Count) return httpFactory('Usuário não encontrado.', 404)
      return awsService.editTableItemAttribute(table, { email }, data, validator.deleteUser)
        .then(res => {
          return httpFactory('Usuario deletado.', 200)
        })
        .catch(err => httpFactory(err.body, err.code))
    })
}

module.exports = {
  getUsers,
  createUser,
  getUser,
  editUser,
  deleteUser
}
