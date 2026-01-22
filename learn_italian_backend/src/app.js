const express = require('express');
const wordRoutes = require('./routes/word.routes');
const errorHandler = require('./middlewares/error.middleware');


const app = express();


app.use(express.json());


// Healthcheck endpoint for quick reachability tests
app.get('/health', (req, res) => {
	res.status(200).json({ status: 'ok' });
});


app.use('/api/words', wordRoutes);


app.use(errorHandler);


module.exports = app;