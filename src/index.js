import express from 'express';

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(require('./task2a'));
app.use(require('./task2b'));
app.use(require('./task2c'));
app.use(require('./task3a'));

app.get('/', (req, res) => {
  res.send('Hello skill-branch!');
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});