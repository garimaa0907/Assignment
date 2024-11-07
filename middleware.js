
// This file contains middleware for the pourpose of validation of admin and user permission 

const authorize = async function(req,res,next){
    // check if the user is not admin , then it should not get access to make amendments
    try{
     if(req.user.role !== 'admin'){
        return res.status(403).send({ status: false, message: 'You Are Not Authorized To Perform Requested Action'});
     }
      next()
    }
    catch(err){
        return res.status(500).send({ status: false, message: err.message});
    }
}

const approveUser = async function(req,res,next){
     // check if the user should be approved to get access to make amendments
    try{
        console.log(req.user.role === 'user')
     if(req.user.role === 'user'   && req.user.status !== 'approve'){
        return res.status(403).send({ status: false, message: 'You Are Not Authorized To Perform Requested Action'});
     }
      next()
    }
    catch(err){
        return res.status(500).send({ status: false, message: err.message});
    }
}

 
module.exports = {authorize ,approveUser}


