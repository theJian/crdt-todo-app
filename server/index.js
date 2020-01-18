const http = require('http');
const uuidv4 = require('uuid/v4');

let primary = null;

const port = 4000;

const routeId = () => {
  const data = {
    id: uuidv4(),
    primary,
  }
  primary = primary || data.id;
  return data;
}

const routeSync = (req, res) => {

}

const routeTodos = (req, res) => {
  const todos = [
    { id: uuidv4(), completed: false, title: 'Take a break' }
  ];
  return { todos };
}

const routes = {
  '/id': {
    'GET': routeId,
  },
  '/sync': {
    'POST': routeSync
  },
  '/todos': {
    'GET': routeTodos
  }
}

http.createServer(function(req, res) {
  const route = routes[req.url];
  const handler = route && route[req.method.toUpperCase()];
  if (handler) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(handler(req, res)));
  } else {
    res.writeHead(404);
    res.write('404');
    res.end();
  }
}).listen(port, function() {
  console.log(`server listen on port ${port}`)
})
