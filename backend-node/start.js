/**
 * start.js - Ponto de entrada para o Railway
 * Inicia a API (server.js) e o Robô de E-mails (imap_listener.js) ao mesmo tempo.
 */
const { fork } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando todos os serviços...');

// Inicia a API
const server = fork(path.join(__dirname, 'server.js'));
server.on('exit', (code) => {
  console.error(`❌ API encerrou com código: ${code}. Reiniciando em 5s...`);
  setTimeout(() => fork(path.join(__dirname, 'server.js')), 5000);
});

// Inicia o Robô de E-mails
const robot = fork(path.join(__dirname, 'imap_listener.js'));
robot.on('exit', (code) => {
  console.error(`❌ Robô encerrou com código: ${code}. Reiniciando em 5s...`);
  setTimeout(() => fork(path.join(__dirname, 'imap_listener.js')), 5000);
});

console.log('✅ API e Robô de E-mails iniciados!');
