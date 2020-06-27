const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

// Basic/req user schema
var basicUserSchema = mongoose.Schema({
	email: { type: String, required: true},
	username: { type: String, required: true },
	password: { type: String, required: true },
	userType: { type: String, required: true }
})

// Basic/non-req user schema
var subUserSchema = mongoose.Schema({
	name: {type: String},
	surname: {type: String},
	gender: {type: String},
	dateOfBirth: {type: Date},
	// imgPath: { type: String, required: true }
})

// Client user schema
var clientSchema = mongoose.Schema({ 
	// Basic required user fields
	userFields: basicUserSchema,
	// Basic non required user fields
	subUserFields: subUserSchema,
	// Client fields
	description: {type: String},
	link: {type: String}
})


// Developer user schema
var developerSchema = mongoose.Schema({
	// Basic required user fields
	userFields: basicUserSchema,
	// Basic non required user fields
	subUserFields: subUserSchema,
	// Dev fields
	skillTags: [{
		type: String
	}],
	// TODO save pdf files for CV
	// Contains links to projects
	portfolio: [{
		type:String
	}]
})


basicUserSchema.plugin(uniqueValidator);
clientSchema.plugin(uniqueValidator);
developerSchema.plugin(uniqueValidator);

const User = mongoose.model('User', basicUserSchema);
const SubUser = mongoose.model('Subuser', subUserSchema)
const Client = mongoose.model('Client', clientSchema);
const Developer = mongoose.model('Developer', developerSchema);

module.exports = {
	User: User,
	SubUser: SubUser,
	Client: Client,
	Developer: Developer
}