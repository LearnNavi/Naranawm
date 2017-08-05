
const express = require('express');
const router = express.Router();

router.use('/auth', require('./v1/auth'));
router.use('/definitions', require('./v1/definitions'));
router.use('/models', require('./v1/models'));
router.use('/rebuild', require('./v1/rebuild'));
router.use('/export', require('./v1/export'));

module.exports = router;
