'use strict';
const tcp = require('net');

/**
 * [Server description]
 * @param {[type]} options [description]
 * @docs https://www.ietf.org/rfc/rfc1928.txt
 */
function Server(options){
  this.options = options;
  this.server = tcp.createServer(function(socket){
    socket.once('data', function(greeting){
    var version = greeting[0];
    var proxy = new (require('./socks' + version))(socket);
    this.emit('request', proxy);
  });
  }.bind(this));
  return this;
}

/**
 * [listen description]
 * @param  {[type]}   port     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Server.prototype.listen = function (port, callback) {
  this.server.listen(port, callback);
  return this;
};

module.exports = Server;