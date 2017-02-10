const net = require('net');
/**
 * [Socks5 description]
 * @param {[type]} socket [description]
 */
function Socks5(socket){
  socket.write(new Buffer([5, 0]));
  socket.once('data', function(connection) {
    var address_type = connection[3];
    var address = readAddress(address_type, connection.slice(4));
    this.proxy(address, socket);
  }.bind(this));
};
/**
 * [proxy description]
 * @param  {[type]} address  [description]
 * @param  {[type]} response [description]
 * @return {[type]}          [description]
 */
Socks5.prototype.proxy = function(address, socket){
  net.connect(address.port, address.address, function() {
    socket.pipe(this).pipe(socket);
    var response = new Buffer(connection);
    response[1] = 0;
    socket.write(response);
  });
};


function formatIPv4(buffer) {
  // buffer.length == 4
  return [ 
    buffer[0], 
    buffer[1], 
    buffer[2], 
    buffer[3] 
  ].join('.');
}

function formatIPv6(buffer) {
  // buffer.length == 16
  var parts = [];
  for (var i = 0; i < 16; i += 2)
    parts.push(buffer.readUInt16BE(i).toString(16));
  return parts.join(':');
}


/**
Returns an object with three properties designed to look like the address
returned from socket.address(), e.g.:

    { family: 'IPv4', address: '127.0.0.1', port: 12346 }
    { family: 'IPv6', address: '1404:abf0:c984:ed7d:110e:ea59:69b6:4490', port: 8090 }
    { family: 'domain', address: '1404:abf0:c984:ed7d:110e:ea59:69b6:4490', port: 8090 }

The given `type` should be either 1, 3, or 4, and the `buffer` should be
formatted according to the SOCKS5 specification.
*/
function readAddress(type, buffer) {
  switch (type) {
    case 1: // IPv4 address
      return {
        family: 'IPv4',
        address: formatIPv4(buffer),
        port: buffer.readUInt16BE(4),
      };
      break;
    case 3: // Domain name
      var length = buffer[0];
      return {
        family: 'domain',
        address: buffer.slice(1, length + 1).toString(),
        port: buffer.readUInt16BE(length + 1),
      };
      break;
    case 4: // IPv6 address
      return {
        family: 'IPv6',
        address: formatIPv6(buffer),
        port: buffer.readUInt16BE(16),
      };
      break;
  }
}