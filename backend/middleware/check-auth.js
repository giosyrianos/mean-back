const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
	try {
		const token = req.headers.authorization
			// "Bearer *kkhfohosrh-TOKEN-ljkhjhadljh*"
			.split(" ")[1];
		jwt.verify(token, 'secret_this_should_be_longer');
		next();
	} catch (error) {
		res.status(401).json({
			message: "Auth failed"
		})
	}
};