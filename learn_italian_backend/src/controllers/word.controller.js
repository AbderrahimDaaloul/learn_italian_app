const wordService = require('../services/word.service');


exports.getAllWords = async (req, res, next) => {
try {
const words = await wordService.getAllWords();
res.status(200).json(words);
} catch (error) {
next(error);
}
};


exports.addWord = async (req, res, next) => {
try {
const { italian_word, english_word } = req.body;


if (!italian_word || !english_word) {
return res.status(400).json({ message: 'Both words are required' });
}


const newWord = await wordService.addWord(italian_word, english_word);
res.status(201).json(newWord);
} catch (error) {
next(error);
}
};