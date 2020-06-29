const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userController = require("../controllers/userController")

const router = express.Router();
// Sign Up fucntion
router.post('/signup', userController.signup);
// Log in function
router.post('/login', userController.login);



// User funcs
router
	.route('/:id')
	.get(userController.getUser)
	.put(userController.updateUser)
	.delete(userController.deleteUser);
router
	.route('/')
	.get(userController.getAll)

router
	.route('/developers')
	.get(userController.getDevelopers)

// Get developer
router
	.route('/developers/:id')
	.get(userController.getDeveloperById)
// Get Post of Single Dev
router
	.route('/:devId/posts')
	.get(userController.getDeveloperPosts)

module.exports = router;
