'use strict';
const { httpFactory } = require('../factory/responses/httpFactory')
const awsService = require('../services/aws-sevice')
const bcrypt = require('bcryptjs')
const table = process.env.TB_USER
const validator = require('../validators/login')
const jwt = require('jwt-simple')

async function login (event) {
  const secretKey = await awsService.getsecretKey()
  console.log(event)
  const body = JSON.parse(event.body)
  return validator.login(body)
    .then(() => {
      console.log('Etapa 1')
      const { email, password } = body
      return awsService.getTableItem(table, 'email', email)
        .then(async res => {
          console.log('Etapa 2: ', res)
          const user = res.Items[0]
          if (res.Count === 1) {
            const validPassword = await bcrypt.compare(password, res.Items[0].password)
            if (!validPassword) return httpFactory('E-mail ou senha inválidos', 401)
            const hashObj = {
              email: user.email,
              name: user.name
            }
            const hash = jwt.encode(hashObj, secretKey)
            return httpFactory(hash, 200)
          }
          return httpFactory('E-mail ou senha inválidos', 401)
        })
    })
    .catch(err => httpFactory(err.details, 404))
}

async function tokenValidator (data) {
  const secretKey = await awsService.getsecretKey()
  if (!data) return false
  const token = data.replace(/bearer /i, '')
  return new Promise((resolve, reject) => {
    jwt.decode(token, secretKey)
    resolve()
  })
    .then(() => true)
    .catch(() => false)
}

module.exports = {
  login,
  tokenValidator
}
