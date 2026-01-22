const express = require('express');
const router = express.Router();
const wordController = require('../controllers/word.controller');


router.get('/', wordController.getAllWords);
router.post('/', wordController.addWord);


module.exports = router;