'use strict';
const { httpFactory } = require('./factory/responses/httpFactory');
const qlcpService = require('./services/qlcp-service')

function getProfessions () {
  return qlcpService.getProfessions()
    .then(res => httpFactory({
      message: 'Solicitação aceita e bem sucedida.',
      body: res
    }, 200))
}

function getProfessionsByEntity () {
  return qlcpService.getProfessionsByEntity()
    .then(res => httpFactory({
      message: 'Solicitação aceita e bem sucedida.',
      body: res
    }, 200))
}

function setProfessions () {
  return qlcpService.setProfessions()
    .then(res => httpFactory({
      message: 'Solicitação aceita e bem sucedida.',
      body: res
    }, 200))
}

module.exports = {
  getProfessions,
  getProfessionsByEntity,
  setProfessions
}
