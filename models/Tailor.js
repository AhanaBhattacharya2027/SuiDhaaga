const mongoose=require("mongoose");
const tailorSchema =new mongoose.Schema({
    fullname:{
        type:String,
        required:true
    },
    tailorId:{
        type:String,
        unique:true,
        required:true
    },
    contactno:{
        type:String,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true,
    },
    area:{
        type:String
    }, 
});

const Tailor=mongoose.model('Tailor',tailorSchema);
module.exports=Tailor;