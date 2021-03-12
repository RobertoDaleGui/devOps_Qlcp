'use strict';
const Joi = require('joi')

const loginValidator = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

function login (data) {
  return loginValidator.validateAsync(data, { abortEarly: false })
}

module.exports = {
  login
}
