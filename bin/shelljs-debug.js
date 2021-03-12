const shell = require('shelljs');

let path = shell.which('serverless').toString().toLowerCase();

// AJUSTANDO O CAMINHO PARA RODAR NO WINDOWS
if (path.match(/^c:/)) {
  path = path.replace('serverless.cmd', '\\node_modules\\serverless\\bin\\serverless')
}

shell.env.SLS_DEBUG = '*'
shell.exec(`node --inspect=5858 ${path} offline -s staging`);
