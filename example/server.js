const socks = require('..');

const server = socks.createServer(client => {
  // client.reply(0);
  // client.end('hello \n');
  server.direct(client);
});

server.listen(1099);
