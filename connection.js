const EventEmitter = require('events');
const Protocol = require('./protocol');
/**
 * Connection
 * @docs https://tools.ietf.org/html/rfc1928
 * @docs https://tools.ietf.org/html/rfc1929
 */
class Connection extends EventEmitter {
  constructor(socket) {
    super();
    this.stage = 0;
    this.socket = socket;
    this.socket.on('data', this.process.bind(this));
    this.socket.on('error', e => { });
  }
  write(buffer) {
    if (!(buffer instanceof Buffer)) {
      buffer = Buffer.from(buffer);
    }
    this.socket.write(buffer);
    return this;
  }
  end(buffer) {
    this.socket.end(buffer);
    return this;
  }
  close() {
    return this.end();
  }
  pipe(stream) {
    this.socket.pipe(stream);
    return stream;
  }
  process(data) {
    switch (this.stage) {
      case 0:
        Object.assign(this, Protocol.parseMethods(data));
        this.emit('method', this.methods);
        break;
      case 1:
        this.user = Protocol.parseAuthentication(data);
        this.emit('user', this.user);
        break;
      case 2:
        this.request = Protocol.parseRequest(data);
        this.reply = this.response.bind(this, data);
        this.emit('request', this.request, this.reply);
        break;
    }
  }
  selectMethod(method) {
    if (method === 2) { // need auth
      this.stage = 1;
    } else {
      this.stage = 2;
    }
    //  The server selects from one of the methods given in METHODS, and
    //  sends a METHOD selection message:
    //  +----+--------+
    //  |VER | METHOD |
    //  +----+--------+
    //  | 1  |   1    |
    //  +----+--------+
    return this.write([5, method]);
  }
  setAuthenticationStatus(status) {
    // A STATUS field of X'00' indicates success.
    if (status === 0) {
      this.stage = 2;
    } else {
      this.stage = -1;
      // If the server returns a `failure' (STATUS value other than X'00') status,
      // it MUST close the connection.
      setTimeout(() => this.close(), 3000);
    }
    // The server verifies the supplied UNAME and PASSWD, and sends the
    // following response:
    // +----+--------+
    // |VER | STATUS |
    // +----+--------+
    // | 1  |   1    |
    // +----+--------+
    return this.write([0x01, status]);
  }
  response(request, reply) {
    this.stage = 3;
    // The SOCKS request information is sent by the client as soon as it has
    // established a connection to the SOCKS server, and completed the
    // authentication negotiations.  The server evaluates the request, and
    // returns a reply formed as follows:
    // +----+-----+-------+------+----------+----------+
    // |VER | REP |  RSV  | ATYP | BND.ADDR | BND.PORT |
    // +----+-----+-------+------+----------+----------+
    // | 1  |  1  | X'00' |  1   | Variable |    2     |
    // +----+-----+-------+------+----------+----------+
    const response = Buffer.from(request);
    response[0] = 0x05;
    response[1] = reply || 0;
    response[2] = 0x00;
    return this.write(response);
  }
}

module.exports = Connection;