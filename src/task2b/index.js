import express from 'express';
import getFIO from './getFIO';

const router = express.Router();

router.get('/task2B', (req, res) => {
  const { fullname } = req.query;

  res.send(getFIO(fullname));
});

module.exports = router;
