const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const userController = require("../controllers/userController")

const MIME_TYPE_MAP = {
	"image/png": "png",
	"image/jpeg": "jpg",
	"image/jpg": "jpg"
  };
  
  const storage = multer.diskStorage({
	destination: (req, file, cb) => {
	  const isValid = MIME_TYPE_MAP[file.mimetype];
	  let error = new Error("Invalid mime type");
	  if (isValid) {
		error = null;
	  }
	  cb(error, "backend/images");
	},
	filename: (req, file, cb) => {
	  const name = file.originalname
		.toLowerCase()
		.split(" ")
		.join("-");
	  const ext = MIME_TYPE_MAP[file.mimetype];
	  cb(null, name + "-" + Date.now() + "." + ext);
	}
  });


const router = express.Router();
// Sign Up fucntion
router.post('/signup',multer(storage).single("image"), userController.signup);
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
