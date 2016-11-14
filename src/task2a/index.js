import express from 'express';
import getSum from './getSum';

const router = express.Router();

router.get('/task2A', (req, res) => {
  const { a, b } = req.query;

  res.send(getSum(a, b));
});

module.exports = router;
