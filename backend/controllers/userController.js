const {User, SubUser, Client, Developer} = require("../models//user")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { Post } = require("../models/posts");


exports.signup = (req, res, next) => {
    userr = JSON.parse(req.body.newUser)
    const url = req.protocol + "://" + req.get("host")
    imgPath = url + "/images/" + req.file.filename

    bcrypt.hash(userr.password, 10)
    .then(hash => {
        const user = new User({
            email : userr.email,
            username : userr.username,
            userType : userr.userType,
            password : hash,
        });
        const subuser = new SubUser({
            _id: user._id,
            name: userr.firstname,
            surname: userr.lastname,
            gender: userr.gender,
            dateOfBirth: userr.dob,
            imgPath: imgPath
        });
        user.save(function (err, user) {
            if (err){
                return res.status(401).json({
                    message: "Internal server error",
                    error: err.message
                })
            }else{
                if (user.userType == "Client"){
                    const client = new Client({
                        _id: user._id,
                        userFields: user,
                        description: "h js einai boli gali",
                        subUserFields: subuser
                    })
                    client.save()
                        .then( data => {
                            res.status(200).json({
                                message: "Client saved successfuly",
                                data: data
                            })
                        })
                        .catch(error => {
                            res.status(401).json({
                                message: 'Internal server error!',
                                error: error.message
                            });
                        })
                }
                if (user.userType == "Developer") {
                    if (req.body.skills){
                        skillTags =req.body.skills.split(',')
                    }else{
                        skillTags = []
                    }
                    if (req.body.portfolio){
                        portfolio = req.body.porfolio.split(',')
                    }else{
                        portfolio = []
                    }
                    const developer = new Developer({
                        _id: user._id,
                        userFields: user,
                        subUserFields: subuser,
                        skillTags: skillTags,
                        portfolio: portfolio
                    })
                    developer.save()
                        .then( data => {
                            res.status(200).json({
                                message: "Developer saved successfuly",
                                data: data
                            })
                        })

                        .catch(error => {
                            return res.status(401).json({
                                message: 'Internal server error!',
                                error: error.message
                            });
                        })
                }
            }
        })
    })
}

exports.login = (req, res, next) => {
    let fetchedUser;
    User.findOne({ 'email': req.body.email})
        .then(user => {
            if (!user) {
				return res.status(401).json({
					message: 'Auth Failed, no such email'
				});
			}
			fetchedUser = user
			return	bcrypt.compare(req.body.password, user.password)
        })
        .then(result => {
			if (!result) {
				return res.status(401).json({
					message: 'Auth Failed, wront password'
				});
			}
			const token = jwt.sign(
				{ email: fetchedUser.email, userId: fetchedUser._id, userType: fetchedUser.userType },
				'secret_this_should_be_longer',
				{ expiresIn: '1h' }
			);
			res.status(200).json({
                token: token,
                userId: fetchedUser._id,
                userType: fetchedUser.userType,
                expiresIn: 3600
			})
		})
		.catch(error => {
			return res.status(401).json({
				message: 'Server Error!',
				error: error.message
			});
		})
}

exports.getUser = async (req, res, next) => {
    let _id = mongoose.Types.ObjectId(req.params.id)
    User.findById(_id)
    .then(user => {
        if ( user.userType == 'Client'){
            Client.findById(_id)
                .then(client => {
                    if(client){
                        res.status(200).json(client);
                    } else {
                        res.status(404).json({ message: "Client not found!" });
                    }
                })
        }
        if ( user.userType == 'Developer'){
            Developer.findById(_id)
                .then(developer => {
                    if(developer){
                        res.status(200).json(developer);
                    } else {
                        res.status(404).json({ message: "Developer not found!" });
                    }
                })
        }
})
}

exports.updateUser = async(req, res, next) => {
    userr = JSON.parse(req.body.newUser)

    let imagePath = userr.imgPath
    if (req.file) {
        const url = req.protocol + "://" + req.get("host");
        imagePath = url + "/images/" + req.file.filename
    }

    var id = mongoose.Types.ObjectId(req.params.id)
    bcrypt.hash(userr.password, 10)
    .then(hash => {
        const basicuser = new User({
            email : userr.email,
            username : userr.username,
            userType : userr.userType,
            password : hash,
        });
        const subuser = new SubUser({
            _id: id,
            name: userr.firstname,
            surname: userr.lastname,
            gender: userr.gender,
            dateOfBirth: userr.dob
        });
        User.findById(req.params.id)
        .then(user => {
            user.updateOne(
                {
                    $set: {
                        email: basicuser.email,
                        username: basicuser.username,
                        userType: basicuser.userType,
                        password: hash
                    }
                }
            )
            .then(resp => {
                if ( user.userType == 'Client'){
                    Client.findById(user._id)
                    .then(client => {
                        client.updateOne(
                            {
                                $set:{
                                    userFields: basicuser,
                                    subUserFields: subuser,
                                    description: req.body.description
                                }
                            }
                        )
                        .then(data => {
                            if(data){
                                res.status(200).json({
                                    message: "User changed success"
                                })
                            }else{
                                res.status(401).json({
                                    message: "Internal Server error"
                                })
                            }
                        })
                    })
                }
                if ( user.userType == 'Developer'){
                    Developer.findById(user._id)
                    .then(dev => {
                        dev.updateOne(
                            {
                                $set:{
                                    userFields: basicuser,
                                    subUserFields: subuser
                                }
                            }
                        )
                        .then(data => {
                            if(data){
                                res.status(200).json({
                                    message: "User changed success"
                                })
                            }else{
                                res.status(401).json({
                                    message: "Internal Server error"
                                })
                            }
                        })
                    })
                }
            }
            )
        })
})}

exports.deleteUser = (req, res, next) => {
    let userType = req.body.userType
    if (userType == 'Developer'){
        Developer.findByIdAndDelete({_id: req.params.id})
        .then( result => {
            return res.status(200).json({
                message: "Dev removed!",

            })
        })
        .catch(error => {
            console.log(error)
        })
    }
}

exports.getAll = async(req, res, next) => {
    let users = []
    Client.find()
    .then(clients => {
        if(clients.length > 0){
            for (client in clients){
                users.push(clients[client])
            }
            return users
        }
        else{
            res.status(400).json({
                message: "No clients found"
            })
            return
        }
    })
    Developer.find()
    .then(devs => {
        if(devs.length > 0){
            for (dev in devs){
                users.push(devs[dev])
            }
            return users
        }
        else{
            res.status(400).json({
                message: "No devs found"
            })
            return
        }
    })
    .then( users => {
        res.status(200).json(users)
    })
}

exports.getDevelopers = async(req, res) => {
    Developer.find()
        .then(devs => {
            console.log(devs)
            res.status(200).json({
                message: "Developers found",
                data: devs
            })
            return
        })
        .catch(error => {
            res.status(400).json({
                message: "No devs found",
                error: error.message
            })
            return
        })
}

exports.getDeveloperById = (req, res, next) =>{
    var id = mongoose.Types.ObjectId(req.params.id)
    Developer.findById(id)
        .then(developer => {
            res.status(200).json({
                message: "Developer found",
                data: developer
            })
        })
        .catch(error => {
            res.status(400).json({
                message: "No dev found",
                error: error.message
            })
        })
}

exports.getDeveloperPosts = (req, res, next) => {
    var id = mongoose.Types.ObjectId(req.params.devId)
    var devposts = []
    Post.find()
        .then(posts => {
            for (post in posts){
                bids = post.bids
                for (bid in bids){
                    if(bid.devId == id){
                        devposts.push(bid)
                    }
                }
            }
            if(devposts.length > 0){
                res.status(200).json({
                    message: "Posts found",
                    data: devposts
                })
            }else{
                res.status(401).json({
                    message: "posts not found"
                })
            }
        })

}

