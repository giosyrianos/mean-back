const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const postRoutes = require("./routes/posts");
const userRoutes = require("./routes/user");

const app = express();

// Connecting to DB
mongoose.connect(
	'mongodb://localhost:27017/mean',
	{
		useNewUrlParser: true,
		useUnifiedTopology: true
	},
	() =>	console.log("DB connection success")
);

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join("backend/images")));

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', "*");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
	next();
});

app.use("/api/posts", postRoutes);
app.use("/api/user", userRoutes);

module.exports = app;