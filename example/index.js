const SOCKS = require('..');

const proxy = new SOCKS({
  type: 5,
  host: '192.168.88.1',
  port: 1080
});

const socket = proxy.createConnection({
  host: 'lsong.org',
  port: 80
});

socket.on('data', chunk => {
  console.log(chunk.toString());
});

socket.on('close', () => {
  console.log('close');
});

socket.write('GET / HTTP/1.1\n');
socket.write('Host: lsong.org\n');
socket.write('\n');
socket.end();