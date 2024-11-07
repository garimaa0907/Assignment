const {isValidObjectId} = require("mongoose")
// this file contains validator for fields like firstName , lastName , email with the help of regex

const validName=function(name){
    const nameRegex=/^[ a-z ]+$/i
    return nameRegex.test(name)
}

const isValid=function(value){
    if( typeof value=='undefined' || value==null) return false
    if( typeof value=='string' && value.trim().length===0) return false
    return true
}

const validPhone=function(phone){
   const phoneRegex=/^[6789]\d{9}$/
   return phoneRegex.test(phone)
}

const validEmail=function(email){
   const emailRegex=/^[\w-\.]+@([\w-]+\.)+[\w-][a-z]{1,4}$/
   return emailRegex.test(email)
}


module.exports={validName,isValid,validPhone,validEmail}