const express = require("express");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth")
const projectController = require("../controllers/projectsController")

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

router.post("/create", projectController.postProject)
// All projects
router
  .route("/")
  .get(projectController.getAllProjects)

// Projects per client id
router
  .route("/client/:clientId")
  .get(projectController.getAllProjectsByClientId)

router
  .route("/:clientId/:projectId")
  .get(projectController.getProjectByClintIdAndProjectId)

router
  .route("/:id")
  .get(projectController.getProjectById)
  .delete(projectController.deleteProject)
  // .put(projectController.updateProject)

router
  .route('/bid')
  .post(projectController.postBid)

router
  .route('/tasks')
  .post(projectController.addTask)  

// router.put(
//   "/:id",
//   checkAuth,
//   multer({ storage: storage }).single("image"),
//   (req, res, next) => {
//     let imgPath = req.body.imgPath;
//     if (req.file) {
//       const url = req.protocol + "://" + req.get("host");
//       imgPath = url + "/images/" + req.file.filename
//     }
//     const post = new Post({
//       _id: req.body.id,
//       title: req.body.title,
//       content: req.body.content,
//       imgPath: imgPath
//     });
//     console.log(post);
//     Post.updateOne({ _id: req.params.id }, post).then(result => {
//       res.status(200).json({ message: "Update successful!" });
//     });
//   }
// );

module.exports = router;
