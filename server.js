const dotenv = require('dotenv');
dotenv.config({
	path: './config.env',
});
//require('dotenv').config();
const app = require('./app');
const connect = require('./utils/mongodb.connect');

const port = process.env.PORT || 6040;
const server = app.listen(port, () => {
	if (process.env.NODE_ENV === 'development') {
		console.log('Dev mode!');
	}
	console.log(`beep, bloop, blop, listening to port ${port}...`);
	connect();
});

//handling unhandled rejections from 3th party api
process.on('unhandledRejection', (err) => {
	console.log('UNHANDLED REJECTION! Shutting down...');
	console.log(err.name, err.message);
	server.close(() => {
		process.exit(1); // 0 = success, 1 = uncaught exception
	});
});
