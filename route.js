const express=require("express")
const router=express.Router()
const { signUpUser ,logIn , createProduct ,getDataOfProductAndUser} = require("./controllers/userController")
const {  AdminLogin, userList ,statusUpdateByAdmin ,approveAndRejectOrder ,createOrder , createWarehouse} = require("./controllers/adminController")
const {authorize , approveUser} = require('./middleware')
var passport = require('passport')
require('./passportConfig')(passport);

//user route
router.post("/signUp", signUpUser)
router.post("/logIn", logIn)
router.post("/createProduct", passport.authenticate('jwt', { session: false }) ,createProduct)
router.get("/getData", passport.authenticate('jwt', { session: false }), approveUser, getDataOfProductAndUser)

//admin route
router.post("/adminLogin",  AdminLogin)
router.get("/userList",passport.authenticate('jwt', { session: false }), authorize , userList)
router.post("/statusUpdateByAdmin", passport.authenticate('jwt', { session: false }) , authorize ,statusUpdateByAdmin)
router.post("/createOrder", passport.authenticate('jwt', { session: false }), authorize , createOrder)
router.post("/approveAndRejectOrder", passport.authenticate('jwt', { session: false }), authorize , approveAndRejectOrder)
router.post("/createWareHouse", passport.authenticate('jwt', { session: false }), authorize , createWarehouse)


router.all("/*", function (req, res) {
    try{
        res.status(404).send({status: false,msg: "The api you request is not available"})
    }catch(err){res.send(err.message)}})
    

module.exports=router