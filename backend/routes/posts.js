const express = require("express");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth")
const postController = require("../controllers/postsController")
const extractFile = require("../middleware/file")
const router = express.Router();

// All posts
router
  .route("/")
  .get(postController.getAllPosts)
  .post(extractFile,postController.postPost)

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
  .put(extractFile,postController.updatePost)

router
  .route('/bid')
  .post(postController.postBid)

router
  .route('/bid/accept')
  .put(postController.acceptBid)

router
  .route('/bid/decline')
  .put(postController.declineBid)

router
  .route('/tasks')
  .post(postController.addTask)  

  router
  .route('/set/complete')
  .put(postController.completePost)  

router
  .route('/tasks/complete')
  .put(postController.completeTask)

module.exports = router;
