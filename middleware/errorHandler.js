const globalErrorMiddleware = (err, req, res, next) => {
	// disable console log when i run test mode
	//console.log(err);
	let customError = {
		// set default
		statusCode: err.statusCode || 500,
		message: err.message || 'Something went wrong try again later',
	};

	if (err.name === 'ValidationError') {
		customError.message = Object.values(err.errors)
			.map((element) => element.message)
			.join(',');
		customError.statusCode = 400;
	}

	if (err.code && err.code === 1100) {
		customError.message = `Duplicate value entered for ${Object.keys(
			err.keyValue
		)} field, please choose another value`;
		customError.statusCode = 400;
	}

	if (err.name === 'CastError') {
		customError.message = `Unable to find value with id : ${err.value}`;
		customError.statusCode = 404;
	}

	return res
		.status(customError.statusCode)
		.json({ message: customError.message });
};

module.exports = globalErrorMiddleware;
