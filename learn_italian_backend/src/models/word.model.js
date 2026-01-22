const pool = require('../config/db');


exports.findAll = async () => {
const result = await pool.query('SELECT * FROM translations ORDER BY id');
return result.rows;
};


exports.create = async (italianWord, englishWord) => {
const result = await pool.query(
'INSERT INTO translations (italian_word, english_word) VALUES ($1, $2) RETURNING *',
[italianWord, englishWord]
);
return result.rows[0];
};