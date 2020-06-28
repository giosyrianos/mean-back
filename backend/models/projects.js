const mongoose = require('mongoose');

// Basic required project fields
const reqProjectSchema = mongoose.Schema({
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
// Non required project fields
const nonReqProjectSchema = mongoose.Schema({
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
	price: {type: Number, required: true}
})

const taskSchema = mongoose.Schema({
	description: {type:String , required: true},
	completed: { type: Boolean , default: false}
})
// Project schema
const projectSchema = mongoose.Schema({
	// Required fields
	basicFields: reqProjectSchema,
	// Non-required fields
	nonReqFields: nonReqProjectSchema,
	// Dev bids
	bids : [bidSchema],
	// Task list
	tasks:[taskSchema],
	// Dev ID
	devId: mongoose.Types.ObjectId
})

const Project = mongoose.model('Project', projectSchema);
const ReqProject = mongoose.model('ReqProject', reqProjectSchema);
const NonReqProject = mongoose.model('NonReqProject', nonReqProjectSchema)
const Bid = mongoose.model('Bid', bidSchema)
const Task = mongoose.model('Task', taskSchema)

module.exports = {
	Project: Project,
	ReqProject: ReqProject,
	NonReqProject, NonReqProject,
	Bid: Bid,
	Task: Task
}