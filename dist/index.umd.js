(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('express')) :
  typeof define === 'function' && define.amd ? define(['express'], factory) :
  (factory(global.express));
}(this, (function (express) { 'use strict';

express = 'default' in express ? express['default'] : express;

function getFIO(name) {
  console.log('"' + name + '"');

  var regName = new RegExp('^(\\s+)?([^0-9 _\/]+)(\\s+([^0-9 _\/]+))?(\\s+([^0-9 _\/]+))?$');

  if (!name || !regName.test(name)) return 'Invalid fullname';

  var matches = name.match(regName);
  //console.log(matches);

  var result = '';

  if (matches[6]) result = '' + matches[6].slice(0, 1).toUpperCase() + matches[6].slice(1).toLowerCase() + ' ' + matches[2].slice(0, 1).toUpperCase() + '. ' + matches[4].slice(0, 1).toUpperCase() + '.';else if (matches[4]) result = '' + matches[4].slice(0, 1).toUpperCase() + matches[4].slice(1).toLowerCase() + ' ' + matches[2].slice(0, 1).toUpperCase() + '.';else result = '' + matches[2].slice(0, 1).toUpperCase() + matches[2].slice(1).toLowerCase();

  return result;
}

var app = express();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', function (req, res, next) {
  res.send('Hello skill-branch!');
});

app.get('/task2B', function (req, res, next) {
  var fullname = req.query.fullname;


  res.send(getFIO(fullname));
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

})));
//# sourceMappingURL=index.umd.js.map
