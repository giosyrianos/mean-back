const mongoose = require('mongoose');

// Basic required Post fields
const reqPostSchema = mongoose.Schema({
	title: { type: String, required: true },
	description: { type: String},
	imgPath: { type: String},
	type: { type: String},
	showDevBid: { type: Boolean},
	category: { type: String},
	subCategory: { type: String},
	price: { type: Number},
	ownerId: {type: mongoose.Schema.Types.ObjectId, required: true}
});
// Non required Post fields
const nonReqPostSchema = mongoose.Schema({
	maxPrice: {type:  Number },
	duration: {type: Number },
	durationType: {type: String, default: "N/A"},
	// bid duration int in hours
	bidDuration: {type: Number},
	recomendedTags: [{
		type:String
	}]
});

const bidSchema = mongoose.Schema({
	devId: {type:mongoose.Types.ObjectId, required: true},
	price: {type: Number, required: true},
	username: {type: String, required:true}
})

const taskSchema = mongoose.Schema({
	description: {type:String , required: true},
	completed: { type: Boolean , default: false}
})
// Post schema
const PostSchema = mongoose.Schema({
	// Required fields
	basicFields: reqPostSchema,
	// Non-required fields
	nonReqFields: nonReqPostSchema,
	// Dev bids
	bids : [bidSchema],
	// Task list
	tasks:[taskSchema],
	// Dev ID
	devId: {type: mongoose.Types.ObjectId, default: null}
})

const Post = mongoose.model('Post', PostSchema);
const ReqPost = mongoose.model('ReqPost', reqPostSchema);
const NonReqPost = mongoose.model('NonReqPost', nonReqPostSchema)
const Bid = mongoose.model('Bid', bidSchema)
const Task = mongoose.model('Task', taskSchema)

module.exports = {
	Post: Post,
	ReqPost: ReqPost,
	NonReqPost, NonReqPost,
	Bid: Bid,
	Task: Task
}