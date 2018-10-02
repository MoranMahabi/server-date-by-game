var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/test1', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/test2', function (req, res, next) {
  res.status(200).json({ payload: 'some data...' });
});

router.get('/test2/:data', function (req, res, next) {
  const data = req.params.data;
  res.status(200).json(
    {
      payload: 'some data...',
      data: data,
    });
});

module.exports = router;
