
const express = require('express');
const router = express.Router();

router.use('/dictionary/blocks', require('./v1/dictionary/blocks'));
router.use('/dictionary/builds', require('./v1/dictionary/builds'));
router.use('/dictionary/buildData', require('./v1/dictionary/buildData'));
router.use('/dictionary/templates', require('./v1/dictionary/templates'));

router.use('/lemmas', require('./v1/lemmas'));

router.use('/entry/layouts', require('./v1/entry/layouts'));
router.use('/entry/layoutTemplates', require('./v1/entry/layoutTemplates'));
router.use('/entry/templates', require('./v1/entry/templates'));
router.use('/entry/typeEntries', require('./v1/entry/typeTemplates'));
router.use('/entry/types', require('./v1/entry/types'));
router.use('/entry/typeTemplates', require('./v1/entry/typeTemplates'));

router.use('/languages', require('./v1/languages'));

router.use('/localized/definitions', require('./v1/localized/definitions'));
router.use('/localized/entry/layouts', require('./v1/localized/entryLayouts'));
router.use('/localized/metadata', require('./v1/localized/metadata'));

router.use('/metadata', require('./v1/metadata'));

router.use('/partsOfSpeech', require('./v1/partsOfSpeech'));

router.use('/sources', require('./v1/sources'));


module.exports = router;
