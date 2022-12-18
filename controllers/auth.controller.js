const dotenv = require('dotenv');
dotenv.config({
	path: './config.env',
});

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const User = require('../models/user.model');

exports.SignUp = async (req, res, next) => {
	try {
		// get signup input
		const firstName = req.body.firstName;
		const lastName = req.body.lastName;
		const email = req.body.email;
		const password = req.body.password;

		// check if email, lastName and  firstName exists
		if (!firstName || !lastName || !email) {
			return res.status(400).json({
				message:
					'All fields required! Please provide firstName, lastName and valid email address.',
			});
		}
		// check password is at least 8 char before hashing
		if (password.length < 8) {
			return res.status(400).json({
				message: 'Password must be at least 8 characters long.',
			});
		}

		// check if user already exist
		// validate if user exist in our database
		const oldUser = await User.findOne({ email });

		if (oldUser) {
			// return res.status(409).send('User Already Exist. Please Login');
			return res.status(409).json({
				message: 'User Already Exist. Please Login!',
			});
		}

		// first registered user has default role: admin
		const isFirstAccount = (await User.countDocuments({})) === 0;
		const role = isFirstAccount ? 'admin' : 'user';

		//encrypt user password
		const hashedpassword = await bcrypt.hash(password, 10);

		// create user in our database
		const userObject = new User({
			firstName,
			lastName,
			email: email.toLowerCase(), // sanitize: convert email to lowercase
			password: hashedpassword,
			role,
		});

		const user = await userObject.save();
		// create token https://www.section.io/engineering-education/how-to-build-authentication-api-with-jwt-token-in-nodejs/
		const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
			expiresIn: process.env.JWT_EXPIRES_IN,
		});

		//user.token = token;

		const cookieOptions = {
			expires: new Date(
				Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
			),
			httpOnly: true,
		};
		res.cookie('jwt', token, cookieOptions);

		//If everything ok, send token to client
		if (user) {
			return res.status(201).json({
				user,
				token,
				message: 'Sign up successful, please login.',
			});
		}
	} catch (err) {
		next(err);
	}
};

exports.Login = async (req, res, next) => {
	try {
		// get user input
		const email = req.body.email;
		const password = req.body.password;
		// check if email exists
		if (!email) {
			return res.status(400).json({
				message: 'All fields required! Please provide valid email address.',
			});
		}
		// check password is at least 8 char before hashing
		if ([password.length] < 8) {
			return res.status(400).json({
				message: 'Password must be at least 8 characters long.',
			});
		}

		// validate if user exist in db
		const user = await User.findOne({ email: email }).select('+password');
		if (!user) {
			// return res.status(409).send('User Already Exist. Please Login');
			return res.status(401).json({
				message: 'User not found!',
			});
		}

		const match = await bcrypt.compare(password, user.password);
		if (user && match) {
			// create token
			const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
				expiresIn: process.env.JWT_EXPIRES_IN,
			});

			// save user token
			//user.token = token;

			const cookieOptions = {
				expires: new Date(
					Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
				),
				httpOnly: true,
			};
			//console.log(cookieOptions);
			res.cookie('jwt', token, cookieOptions);
			//If everything ok, send token to client

			// user
			res.status(200).json({ user, token, message: 'Success for login!' });
		} else {
			res.status(400).send('Invalid Credentials!');
		}
	} catch (err) {
		next(err);
	}
};

//We can successfully create and log in a user. Here we create a route that requires a user token in the header, which is the JWT token we generated earlier.

exports.authenticatedUser = async (req, res, next) => {
	try {
		//let token = req.cookies.jwt;

		let token;
		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith('Bearer')
		) {
			token = req.headers.authorization.split(' ')[1];
		} else if (req.cookies.jwt) {
			token = req.cookies.jwt;
		}

		if (!token) {
			return res.status(401).send('Please log in to get access!');
		}
		// verification token
		const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

		const currentUser = await User.findById(decoded.id);
		if (!currentUser) {
			return res
				.status(401)
				.send('The user belonging to this token does no longer exist.');
		}
		req.user = currentUser;
		res.locals.user = currentUser;
		next();
	} catch (err) {
		next(err);
	}
};

exports.adminGuard = (...roles) => {
	return (req, res, next) => {
		// roles ['admin']. role='user'
		if (!roles.includes(req.user.role)) {
			return res
				.status(403)
				.send({ message: 'Unauthorized! Resource reserved for admin' });
		}

		next();
	};
};

exports.logout = (req, res) => {
	res.cookie('jwt', 'loggedout', {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true,
	});
	res.status(200).json({ message: 'success' });
};
