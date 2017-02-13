const Stream = require('stream');
const EventEmitter = require('events');

class SOCKS extends EventEmitter {
  constructor(options){
    super();
    Object.assign(this, options);
    return this;
  }
  createConnection(options){
    return new Connection(options);
  }
}

class Connection extends Stream {
  write(){

  }
  end(){

  }
}

SOCKS.Server = require('./server');
SOCKS.createServer = function(options, callback){
  return new SOCKS.Server(options);
};

module.exports = SOCKS;