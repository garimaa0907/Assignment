const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId

const wareHouseSchema = new mongoose.Schema({
name: {
    type:String, 
    ref:"User",
    required:true,
    trim:true
},
  productIds: {
    type: Array, 
    ref:"Product", 
    required:true,
},
location : {
    type : Number
}     // by default Taken in kilometer

},{ timestamps: true })

module.exports = mongoose.model("WareHouse", wareHouseSchema)