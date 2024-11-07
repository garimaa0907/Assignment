const mongoose=require("mongoose")

const productSchema=new mongoose.Schema({
        title: {
            type:String, 
            required:true, 
            unique:true,
            trim:true
        },
        inStock: {
            type:Boolean,
            default: false
        },
       
},{ timestamps: true })

module.exports = mongoose.model("Product", productSchema)