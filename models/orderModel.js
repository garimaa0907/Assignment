const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId

const orderSchema = new mongoose.Schema({
userId: {
    type:ObjectId, 
    ref:"User",
    required:true,
    trim:true
},
  productIds: {
    type: Array, 
    ref:"Product", 
    required:true,
},
status: {
    type : String,
    default: 'pending',
    enum: ['approve', 'reject', 'pending'], // Enum values
}

},{ timestamps: true })

module.exports = mongoose.model("Order", orderSchema)