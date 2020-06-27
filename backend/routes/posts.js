const express = require("express");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth")

const Post = require("../models/post");

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

router.post(
  "",
  // You do not execute "checkAuth",
  // you add reference instead and EXPESS executes
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imgPath: url + "/images/" + req.file.filename,
      owner: req.userData.userId
    });
    post.save().then(createdPost => {
      res.status(201).json({
        message: "Post added successfully",
        post: {
          ...createdPost,
          id: createdPost._id
        }
      });
    });
  }
);

router.put(
  "/:id",
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    let imgPath = req.body.imgPath;
    if (req.file) {
      const url = req.protocol + "://" + req.get("host");
      imgPath = url + "/images/" + req.file.filename
    }
    const post = new Post({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      imgPath: imgPath,
      owner: req.userData.userId
    });
    Post.updateOne({ _id: req.params.id, owner: req.userData.userId }, post).then(result => {
      if (result.nModiied > 0) {
        res.status(200).json({ message: "Update successful!" });
      } else {
        res.status(401).json({ message: "Unauthorized User" });
      }
    });
  }
);

router.get("", (req, res, next) => {
	// parameters are always strings, add(+) to convert them to numbers
	const pageSize = +req.query.pagesize;
	const currentPage = +req.query.page;
  const postQuery = Post.find();
  let totalPosts;

	if (pageSize && currentPage) {
		postQuery
			.skip(pageSize * (currentPage - 1))
			.limit(pageSize);
	}

  postQuery
    .then(documents => {
      totalPosts = documents;
      return Post.countDocuments();
    })
    .then(count => {
        res.status(200).json({
        message: "Posts fetched successfully!",
        posts: totalPosts,
        total: count
      });
  });
});

router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found!" });
    }
  });
});

router.delete("/:id", checkAuth, (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, owner: req.userData.userId }).then(result => {
    console.log(result);
      if (result.n > 0) {
        res.status(200).json({ message: "Deletion successful!" });
      } else {
        res.status(401).json({ message: "Not authorized!" });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "Deleting posts failed!"
      });
    });
});

module.exports = router;
