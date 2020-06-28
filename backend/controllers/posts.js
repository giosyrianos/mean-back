const checkAuth = require("../middleware/check-auth")
const Post = require("../models/post");

exports.createPost =   (req, res, next) => {
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
	})
	.catch(error => {
		res.status(500).json({
			message: "Creating a post failed!"
		});
	});
}

exports.updatePost =   (req, res, next) => {
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
		console.log(result)
		if (result.nModified > 0) {
			res.status(200).json({ message: "Update successful!" });
		} else {
			res.status(401).json({ message: "Unauthorized User" });
		}
	})
	.catch(error => {
		res.status(500).json({
			message: "Couldn't udpate post!"
		});
	});
}

exports.getAllPosts = (req, res, next) => {
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
    })
    .catch(error => {
      res.status(500).json({
        message: "Fetching posts failed!"
      });
    });
}

exports.getSinglePost = (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found!" });
    }
  })
  .catch(error => {
    res.status(500).json({
      message: "Fetching posts failed!"
    });
  });
}

exports.deletePost = (req, res, next) => {
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
}