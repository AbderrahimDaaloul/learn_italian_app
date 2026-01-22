const wordModel = require('../models/word.model');


exports.getAllWords = async () => {
return await wordModel.findAll();
};


exports.addWord = async (italianWord, englishWord) => {
return await wordModel.create(italianWord, englishWord);
};