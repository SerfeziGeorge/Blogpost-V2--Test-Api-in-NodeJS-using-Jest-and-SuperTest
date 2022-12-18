const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({
	path: './config.env',
});
const mongoDB = process.env.Database;

module.exports = function connect() {
	mongoose
		.connect(mongoDB)
		.then(() =>
			console.log('beep, bloop, blop, successfully connected to mongodb...')
		);
};
