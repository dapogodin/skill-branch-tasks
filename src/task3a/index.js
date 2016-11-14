import express from 'express';

const router = express.Router();

router.get('/task3A', (req, res) => {
  res.send('task3A');
});

module.exports = router;
