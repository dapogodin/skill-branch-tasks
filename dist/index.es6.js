import express from 'express';

var app = express();

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(require('./task2a'));
app.use(require('./task2b'));
app.use(require('./task2c'));
app.use('/task3A', require('./task3a'));

app.get('/', function (req, res) {
  res.send('Hello skill-branch!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
//# sourceMappingURL=index.es6.js.map
