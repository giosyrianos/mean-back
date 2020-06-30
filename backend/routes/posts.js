const express = require("express");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth")
const postController = require("../controllers/postsController")

const router = express.Router();


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

// All posts
router
  .route("/")
  .get(postController.getAllPosts)
  .post(multer({storage: storage}).single("image"),postController.postPost)

// Posts per client id
router
  .route("/client/:clientId")
  .get(postController.getAllPostsByClientId)

router
  .route("/:clientId/:postId")
  .get(postController.getPostByClintIdAndPostId)

router
  .route("/:id")
  .get(postController.getPostById)
  .delete(postController.deletePost)
  .put(postController.updatePost)

router
  .route('/bid')
  .post(postController.postBid)

router
  .route('/tasks')
  .post(postController.addTask)  

module.exports = router;
