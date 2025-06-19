const mongoose=require("mongoose");
const designSchema = new mongoose.Schema({
    designId:{
        type:String,
        unique:true,
        required:true
    },
    title:{
        type:String
    },
    description:{
        type:String
    },
    makingCharges:{
        type:Number
    },
    images:[String],
    tailorId:String
            
});
const Design = new mongoose.model('Design',designSchema);
module.exports=Design;