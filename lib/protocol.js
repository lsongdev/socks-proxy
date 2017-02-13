const Protocol = {};

/**
 * The client connects to the server, and sends a version
 * identifier/method selection message:
 * +----+----------+----------+
 * |VER | NMETHODS | METHODS  |
 * +----+----------+----------+
 * | 1  |    1     | 1 to 255 |
 * +----+----------+----------+
 * @dosc https://tools.ietf.org/html/rfc1928#section-3
 * @return {[type]} [description]
 */
Protocol.parseMethods = greeting => {
  const version = greeting[0];
  const length  = greeting[1];
  const methods = greeting.slice(2);
  return {
    version, methods
  };
};

Protocol.parseAuthentication = data => {
  let offset = 0;
  // Once the SOCKS V5 server has started, and the client has selected the
  // Username/Password Authentication protocol, the Username/Password
  // subnegotiation begins.  This begins with the client producing a
  // Username/Password request:
  // +----+------+----------+------+----------+
  // |VER | ULEN |  UNAME   | PLEN |  PASSWD  |
  // +----+------+----------+------+----------+
  // | 1  |  1   | 1 to 255 |  1   | 1 to 255 |
  // +----+------+----------+------+----------+
  const version = data[offset++];
  const ulength = data[offset++];
  const username = String(data.slice(offset, offset+=ulength));
  const plength = data[offset++];
  const password = String(data.slice(offset, offset+=plength));
  return {
    version,
    username,
    password,
  };
};

Protocol.parseRequest = request => {
  var ver  = request[0];
  var cmd  = request[1];
  var rsv  = request[2];
  var atyp = request[3];
  var addr = request.slice(4);
  return Protocol.parseAddress(atyp, addr);
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
  var parts = [];
  for (var i = 0; i < 16; i += 2)
    parts.push(buffer.readUInt16BE(i).toString(16));
  return parts.join(':');
}

/**
 * [parseAddress description]
 * @param  {[type]} type   [description]
 * @param  {[type]} buffer [description]
 * @return {[type]}        [description]
 * @docs https://tools.ietf.org/html/rfc1928#section-5
 */
Protocol.parseAddress = (type, buffer) => {
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

    default:
      console.error('unknow type:', type);
      break;
  }
};


module.exports = Protocol;
