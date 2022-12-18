const dotenv = require('dotenv');
dotenv.config({
	path: './config.env',
});

// JwtStrategy can not see the secret key with the below require format
//require('dotenv').config();

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

// passport local strategy function
// verifing user input with the user retrivied from mongodb
passport.use(
	new LocalStrategy((username, password, done) => {
		User.findOne({ email: username })
			.select('+password')
			.exec((err, user) => {
				if (err) {
					return done(err);
				}
				// Return if user not found in database
				if (!user) {
					return done(null, false, {
						message: 'Unable to find user with this email!',
					});
				}
				bcrypt.compare(password, user.password, (err, res) => {
					if (res) {
						// matched password. the user logges in
						return done(null, user);
					} else {
						// input password does not match the password retrived from mongodb
						return done(null, false, {
							message: 'The password provided is incorrect!',
						});
					}
				});
			});
	})
);

// passport JWT strategy function
passport.use(
	new JwtStrategy(
		{
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: process.env.TOKEN_KEY,
		},
		function (jwtPayload, done) {
			User.findOne({ _id: jwtPayload._id }, (err, user) => {
				if (err) {
					return done(err, false);
				}
				if (user) {
					return done(null, user);
				}
				// no errors return the user object
				return done(null, false);
			});
		}
	)
);
