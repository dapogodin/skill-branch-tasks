import express from 'express';
import getUserName from './getUserName';

const router = express.Router();

router.get('/task2C', (req, res) => {
  const { username } = req.query;

  res.send(getUserName(username));
});

module.exports = router;
