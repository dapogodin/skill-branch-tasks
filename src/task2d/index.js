import express from 'express';
import getHexColor from './getHexColor';

const router = express.Router();

router.get('/task2D', (req, res) => {
  const { color } = req.query;

  res.send(getHexColor(color));
});

module.exports = router;
