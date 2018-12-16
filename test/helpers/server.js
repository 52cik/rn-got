const util = require('util');
const http = require('http');
const getPort = require('get-port');

exports.host = 'localhost';
const { host } = exports;

exports.createServer = async () => {
  const port = await getPort();

  const s = http.createServer((request, response) => {
    const event = decodeURI(request.url);
    if (s.listeners(event).length === 0) {
      response.writeHead(404, 'Not Found');
      response.end(`No listener for ${event}`);
    } else {
      s.emit(event, request, response);
    }
  });

  s.host = host;
  s.port = port;
  s.url = `http://${host}:${port}`;
  s.protocol = 'http';

  s.listen = util.promisify(s.listen);
  s.close = util.promisify(s.close);

  return s;
};
