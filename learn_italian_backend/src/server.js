require('dotenv').config();
const app = require('./app');


const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '127.0.0.1';


const server = app.listen(PORT, HOST, () => {
	const addr = server.address();
	const hostShown = typeof addr === 'string' ? addr : `${addr.address}:${addr.port}`;
	console.log(`🚀 Server running on http://${hostShown}`);
});

process.on('unhandledRejection', (err) => {
	console.error('UNHANDLED REJECTION:', err);
});

process.on('uncaughtException', (err) => {
	console.error('UNCAUGHT EXCEPTION:', err);
});