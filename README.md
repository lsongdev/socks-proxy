## socks-proxy ![socks-proxy@1.0.0](https://img.shields.io/npm/v/socks-proxy.svg)

> socks proxy client and server in node.js

### Installation

```bash
$ npm install socks-proxy
```

### Example

```js
const socks = require('socks-proxy');

const server = socks.createServer(client => {
  client.reply(0);
  client.end('hello \n');
});

server.listen(1080);
```

### SPEC

+ rfc1928
+ rfc1929

### Contributing
- Fork this Repo first
- Clone your Repo
- Install dependencies by `$ npm install`
- Checkout a feature branch
- Feel free to add your features
- Make sure your features are fully tested
- Publish your local branch, Open a pull request
- Enjoy hacking <3

### MIT

---