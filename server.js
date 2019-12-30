'use strict';
const tcp = require('net');
const Connection = require('./connection');

class Server extends tcp.Server {
  constructor(options, proxy) {
    if (typeof options === 'function') {
      proxy = options;
      options = {
        proxy
      };
    }
    super();
    Object.assign(this, options);
    this.on('connection', this.createConnection.bind(this));
  }
  createConnection(socket) {
    const connection = new Connection(socket);
    connection.on('method', this.processMethod.bind(this, connection));
    connection.on('user', this.processAuth.bind(this, connection));
    connection.on('request', this.proxy.bind(this, connection));
    return connection;
  }
  processMethod(connection, methods) {
    let { method } = this;
    if (typeof method === 'function') {
      const r = method.call(connection, methods);
      if (typeof r === 'number') {
        connection.selectMethod(r);
      }
      if (r && typeof r.then === 'function') {
        r.then(m => connection.selectMethod(m));
      }
    } else {
      method = typeof method === 'undefined' && this.auth ? 2 : method || 0;
      connection.selectMethod(method);
    }
  }
  processAuth(connection, user) {
    const { auth } = this;
    if (typeof auth === 'function') {
      const r = auth.call(connection, user);
      if (typeof r === 'number') {
        connection.setAuthenticationStatus(r);
      }
      if (r && typeof r.then === 'function') {
        r.then(m => connection.setAuthenticationStatus(m));
      }
    } else if (
      typeof auth === 'object' &&
      auth.username === user.username &&
      auth.password === user.password) {
      connection.setAuthenticationStatus(0);
    } else {
      connection.setAuthenticationStatus(1);
    }
  }
  direct(client) {
    const {
      address,
      port
    } = client.request;
    const conn = tcp.connect(port, address, function (err) {
      if (err) return console.error(`connect ${address}:${port} got an error`, err);
      client.reply(0);
      client.pipe(this).pipe(client);
    });
    conn.on('error', err => {
      console.error(`connection ${address}:${port} got an error`, err.message);
    });
  }
  /**
   * default proxy handler
   * @param {*} client 
   */
  proxy(client) {
    return this.direct(client);
  }
}

module.exports = Server;