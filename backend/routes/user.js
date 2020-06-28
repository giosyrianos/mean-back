const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const router = express.Router();

router.post("/signup", (req, res, next) => {
	bcrypt.hash(req.body.password, 10)
		.then(hash => {
			const user = new User({
				email: req.body.email,
				role: req.body.role,
				password: hash
			});
			user.save()
				.then(result => {
					res.status(201).json({
						message: 'User created',
						result: result
					});
				})
				.catch(err => {
					res.status(500).json({
						message: "Email already used " + String.fromCodePoint(0x1F641)
					});
				});
		});
});

router.post('/login', (req, res, next) => {
	let fetchedUser;
	User.findOne({ email: req.body.email })
		.then(user => {
			if (!user) {
				return res.status(401).json({
					message: 'Auth Failed, no such email'
				});
			}
			fetchedUser = user
			return	bcrypt.compare(req.body.password, user.password)
		})
		.then(result => {
			if (!result) {
				return res.status(401).json({
					message: 'Auth Failed, no such email'
				});
			}
			const token = jwt.sign(
				{ email: fetchedUser.email, userId: fetchedUser._id },
				'secret_this_should_be_longer',
				{ expiresIn: '1h' }
			);
			res.status(200).json({
				token: token,
				expiresIn: 3600,
				userId: fetchedUser._id,
				role: fetchedUser.role
			})
		})
		.catch(error => {
			return res.status(401).json({
				message: 'Auth Failed, no such email'
			});
		})
});

module.exports = router;