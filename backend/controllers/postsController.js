const {Post, ReqPost, NonReqPost, Bid, Task} = require("../models/posts")
const checkAuth = require("../middleware/check-auth")
const {Client} = require("../models/user")
const mongoose = require('mongoose');
const multer = require("multer");



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

exports.postPost = async(req, res) => {
    console.log(req.body)
    const url = req.protocol + "://" + req.get("host")
    const reqPost = new ReqPost({
        title: req.body.title,
        description: req.body.description,
        type: req.body.type,
        showDevBid: req.body.showDevBid,
        category: req.body.category,
        subCategory: req.body.subCategory,
        price: req.body.price,
        imgPath: url + "/images/" + req.file.name,
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
    const posts = Post.find();
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
    Post.find({'basicFields.clientId': id})
    .then(posts => {
        console.log(posts)
        if(posts.length > 0){
            res.status(200).json(posts)
        }
        else{
            res.status(400).json({
                message: "No posts found"
            })
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
        price: req.body.price
    })
    Post.findById(projId)
        .then(project => {
            project.updateOne(
                {$push : {
                    bids: bid
                }}
            )
            .then(data => {
                if(data){
                    res.status(200).json({
                        message: "bid added"
                    })
                }else{
                    res.status(401).json({
                        message: "Internal Server error"
                    })
                }
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
    id = mongoose.Types.ObjectId(req.params.id)
    Post.findById(id)
    .then(post => {
            const reqPost = new ReqPost({
                title: req.body.title,
                description: req.body.description,
                type: req.body.type,
                showDevBid: req.body.showDevBid,
                category: req.body.category,
                subCategory: req.body.subCategory,
                price: req.body.price,
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
            post.updateOne({
                $set:{
                    basicFields:reqPost,
                    nonReqFields: nonReqPost
                }
            })
            .then(res=> {
                if(res.ok == '1'){
                    res.status(200).json({
                        message: "post updated!"
                    })
                }else{
                    res.status(401).json({
                        message: "Server erro!"
                    })
                }
            })
    })
}
