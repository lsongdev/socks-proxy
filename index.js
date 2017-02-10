
function SocksProxy(){
  
}

SocksProxy.Server = require('./server');
SocksProxy.createServer = function(options, callback){
  return new SocksProxy.Server(options);
};

exports = SocksProxy;