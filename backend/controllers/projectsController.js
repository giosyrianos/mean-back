const {Project, ReqProject, NonReqProject, Bid, Task} = require("../models/projects")
const checkAuth = require("../middleware/check-auth")
const {Client} = require("../models/user")
const mongoose = require('mongoose');

createProject =( Project, res) => {
    Project.save()
    .then( proj => {
        if(proj){
            res.status(200).json({
                message: "Project created coble",
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

exports.postProject = async(req, res) => {
    let clientId = req.body.clientId
    const reqProj = new ReqProject({
        title: req.body.title,
        description: req.body.description,
        type: req.body.type,
        showDevBid: req.body.showDevBid,
        category: req.body.category,
        subCategory: req.body.subCategory,
        price: req.body.price,
        ownerId: clientId
    })
    const nonReqProj = new NonReqProject({
        _id:reqProj._id,
        maxPrice: req.body.maxPrice,
        duration: req.body.duration,
        durationType: req.body.duration,
        bodDuration: req.body.bodDuration,
        recomendedTags: req.body.recomendedTags,
    })
    const project = new Project({
        _id:reqProj._id,
        basicFields: reqProj,
        nonReqFields: nonReqProj
    })
    createProject(project, res)
}

exports.getAllProjects = async(req, res) => {
    const pageSize = +req.query.pagesize
    const currentPage = +req.query.page
    const projects = Project.find();
    let totalProjects;

     if (pageSize && currentPage) {
            projects
                .skip(pageSize * (currentPage - 1))
                .limit(pageSize)
        }
        projects
            .then(projs => {
                totalProjects = projs
                return Project.countDocuments()
            })
            .then(count => {
                res.status(200).json({
                    message: "Projects fetched successfully!",
                    projects: totalProjects,
                    total: count
            })
        })
}
exports.getAllProjectsByClientId = async(req, res)=> {
    id = mongoose.Types.ObjectId(req.params.clientId)
    Project.find({'basicFields.clientId': id})
    .then(projects => {
        console.log(projects)
        if(projects.length > 0){
            res.status(200).json(projects)
        }
        else{
            res.status(400).json({
                message: "No projects found"
            })
        }
    })
}

exports.getProjectById = async(req, res) => {
    id = mongoose.Types.ObjectId(req.params.id)
    Project.findById(id)
    .then(project => {
        if(project){
            res.json(project)
        }else{
            res.json("Project not found")
        }
    })
}

exports.deleteProject = async(req, res) => {
    id = mongoose.Types.ObjectId(req.params.id)
    Project.findOneAndDelete({_id:id})
    .then(data => {
        res.json({
            message: "proj deleted",
            data: data
        })
    })
}

exports.getProjectByClintIdAndProjectId = async(req, res) =>{
    var clientId = mongoose.Types.ObjectId(req.params.clientId)
    var projectId = mongoose.Types.ObjectId(req.params.projectId)
    Project.find({'basicFields._id': projectId,'basicFields.clientId': clientId })
        .then(project => {
            if(project){
                res.status(200).json({
                    message: "project found",
                    data: project
                })
            }else{
                res.status(401).json({
                    message: "project not found"
                })
            }
        })
}

exports.postBid = async(req, res) => {
    var devId = mongoose.Types.ObjectId(req.body.devId)
    var projId = mongoose.Types.ObjectId(req.body.projId)
    const bid = new Bid({
        devId: devId,
        price: req.body.price
    })
    Project.findById(projId)
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
    var projId = mongoose.Types.ObjectId(req.body.projId)
    
    const task = new Task({
        description: req.body.description,
    })
    Project.findById(projId)
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

