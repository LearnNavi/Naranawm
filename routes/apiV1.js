
const express = require('express');
const router = express.Router();

router.use('/definitions', require('./v1/definitions'));
router.use('/models', require('./v1/models'));
router.use('/export', require('./v1/export'));

module.exports = router;
