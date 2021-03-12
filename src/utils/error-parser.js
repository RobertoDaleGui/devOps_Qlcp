function errorParser (data) {
  console.log('Erro!!!!: ', data);
  if (data.details) return { message: 'Payload inválido.', body: data.details, code: 400 }
  if (data.message) return { message: 'Erro interno.', body: 'Contate o suporte para comunicar o problema.', code: 500 }
}

module.exports = errorParser
