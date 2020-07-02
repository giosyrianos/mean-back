const {Post, ReqPost, NonReqPost, Bid, Task} = require("../models/posts")
const {User} = require("../models/user")
const checkAuth = require("../middleware/check-auth")
const {Client} = require("../models/user")
const mongoose = require('mongoose');
const multer = require("multer");
const extractFile = require("../middleware/file")




createPost =( Post, res) => {
    Post.save()
    .then( proj => {
        if(proj){
            res.status(200).json({
                message: "Post created coble",
                data:proj
            })
        }else{
            res.status(401).json({
                message: "Internal Server error",
            })
        }
    })
    .catch(error => {
        console.log(error.message)
    })
}

getClientIdByUsername = (username) => {
    Client.findOne("userFields.username")
    .then( client =>{
        return client._id
    })
}

getUsernameByID = (id) => {
    User.findOne({_id: id})
    .then(
        user => { return user.username}
    )
}

exports.postPost = async(req, res) => {

    // data = JSON.parse(req.body.postData)
    console.log(req.body)
    const url = req.protocol + "://" + req.get("host")
    imgPath = url + "/images/" + req.file.filename

    const reqPost = new ReqPost({
        title: req.body.title,
        description: req.body.content,
        type: req.body.type,
        showDevBid: req.body.showDevBid,
        category: req.body.category,
        subCategory: req.body.subCategory,
        price: req.body.price,
        imgPath: imgPath,
        ownerId: req.body.ownerId
    })
    const nonReqPost = new NonReqPost({
        _id:reqPost._id,
        maxPrice: req.body.maxPrice,
        duration: req.body.duration,
        durationType: req.body.duration,
        bodDuration: req.body.bodDuration,
        recomendedTags: req.body.recomendedTags,
    })
    const post = new Post({
        _id:reqPost._id,
        basicFields: reqPost,
        nonReqFields: nonReqPost
    })
    createPost(post, res)
}

exports.getAllPosts = async(req, res) => {
    const pageSize = +req.query.pagesize
    const currentPage = +req.query.page
    const posts = Post.find({devId: null});
    let totalPosts;

     if (pageSize && currentPage) {
            posts
                .skip(pageSize * (currentPage - 1))
                .limit(pageSize)
        }
        posts
            .then(projs => {
                totalPosts = projs
                return Post.countDocuments()
            })
            .then(count => {
                res.status(200).json({
                    message: "Posts fetched successfully!",
                    posts: totalPosts,
                    total: count
            })
        })
}
exports.getAllPostsByClientId = async(req, res)=> {
    id = mongoose.Types.ObjectId(req.params.clientId)
    Post.find({'basicFields.ownerId': id})
    .then(posts => {
        console.log(posts)
        if(posts.length > 0){
            res.status(200).json(posts)
        }
    })
}

exports.getPostById = async(req, res) => {
    id = mongoose.Types.ObjectId(req.params.id)
    Post.findById(id)
    .then(post => {
        if(post){
            res.json(post)
        }else{
            res.json("Post not found")
        }
    })
}

exports.deletePost = async(req, res) => {
    id = mongoose.Types.ObjectId(req.params.id)
    Post.findOneAndDelete({_id:id})
    .then(data => {
        res.json({
            message: "Post deleted",
            data: data
        })
    })
}

exports.getPostByClintIdAndPostId = async(req, res) =>{
    var clientId = mongoose.Types.ObjectId(req.params.clientId)
    var postId = mongoose.Types.ObjectId(req.params.postId)
    Post.find({'basicFields._id': postId,'basicFields.clientId': clientId })
        .then(post => {
            if(post){
                res.status(200).json({
                    message: "post found",
                    data: post
                })
            }else{
                res.status(401).json({
                    message: "post not found"
                })
            }
        })
}

exports.postBid = async(req, res) => {
    var devId = mongoose.Types.ObjectId(req.body.devId)
    var projId = mongoose.Types.ObjectId(req.body.postId)
    const bid = new Bid({
        devId: devId,
        projId: projId,
        price: req.body.price
    })
    console.log(bid)
    Post.findById(projId)
        .then(project => {
            project.updateOne(
                {$push : {
                    bids: bid
                }}
            )
            res.status(200).json({
                message: "bid added"
            })
        })
        .catch(error => {
            res.status(500).json({
                messgae: "Internal server error",
                error: error.message
            })
        })
}

exports.addTask = async(req, res) => {
    var devId = mongoose.Types.ObjectId(req.body.devId)
    var projId = mongoose.Types.ObjectId(req.body.postId)
    
    const task = new Task({
        description: req.body.description,
    })
    Post.findById(projId)
        .then(project => {
            project.updateOne({
                $push : {
                    tasks: task
                }
            })
            .then(data => {
                if(data){
                    res.status(200).json({
                        message: "task added"
                    })
                }else{
                    res.status(401).json({
                        message: "Internal Server error"
                    })
                }
            })
        })
}

exports.updatePost = async(req, res) => {

    if (req.file) {
        const url = req.protocol + "://" + req.get("host")
        imgPath = url + "/images/" + req.file.filename
    }else{
        imagePath = req.body.imgPath
    }

    id = mongoose.Types.ObjectId(req.params.id)
    // const url = req.protocol + "://" + req.get("host")
    // imgPath = url + "/images/" + req.file.filename
    Post.findById(id)
    .then(post => {
            const reqPost = new ReqPost({
                title: req.body.title,
                description: req.body.content,
                type: req.body.type,
                showDevBid: req.body.showDevBid,
                category: req.body.category,
                subCategory: req.body.subCategory,
                imgPath: imgPath,
                price: req.body.price,
                ownerId: req.body.owner
            })
            const nonReqPost = new NonReqPost({
                _id:reqPost._id,
                maxPrice: req.body.maxPrice,
                duration: req.body.duration,
                durationType: req.body.duration,
                bodDuration: req.body.bodDuration,
                recomendedTags: req.body.recomendedTags,
            })
            console.log(reqPost)
            post.updateOne({
                $set:{
                    basicFields:reqPost,
                    nonReqFields: nonReqPost
                }
            })
            .then(resp=> {
                    res.status(200).json({
                        message: "post updated!"
                    })
            })
    })
}

exports.acceptBid = async(req, res) => {
    console.log(req.body)
    const postId = mongoose.Types.ObjectId(req.body.postId)
    const bidId = mongoose.Types.ObjectId(req.body.bidId)
    const devId = mongoose.Types.ObjectId(req.body.devId)
    Post.findOneAndUpdate({_id: postId},
        {
            $set: {
                devId:devId
            }
        })
    .then(res =>{
        console.log(res)
    })
}

exports.declineBid = async(req, res) => {
    const postId = mongoose.Types.ObjectId(req.body.postId)
    const bidId = mongoose.Types.ObjectId(req.body.bidId)
    const devId = mongoose.Types.ObjectId(req.body.devId)
        Post.findOneAndUpdate({_id: postId},
            {
                $pull: {
                    bids:{
                        _id: bidId
                    }
                }
            })
        .then(res =>{
            console.log(res)
        })
}