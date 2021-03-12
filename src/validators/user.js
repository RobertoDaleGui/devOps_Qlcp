'use strict';
const Joi = require('joi')

const createUserValidator = Joi.object({
  name: Joi.string().min(5).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
})

const editUserValidator = Joi.object({
  name: Joi.string().min(5),
  password: Joi.string().min(8)
}).or('name', 'password')

const deleteUserValidator = Joi.object({
  active: Joi.boolean().required()
})

function createUser (data) {
  return createUserValidator.validateAsync(data, { abortEarly: false })
}

function editUser (data) {
  return editUserValidator.validateAsync(data, { abortEarly: false })
}

function deleteUser (data) {
  return deleteUserValidator.validateAsync(data, { abortEarly: false })
}

module.exports = {
  createUser,
  editUser,
  deleteUser
}
