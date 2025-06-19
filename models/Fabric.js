const mongoose=require("mongoose");
const fabricSchema=new mongoose.Schema({
    fabricId:{
        type:String,
        unique:true
    },
    title:String,
    description:String,
    material:String,
    pricepermeter:Number,
    images:String,
    sellerid:String
},{ timestamps: true });
const Fabric=mongoose.model('Fabric',fabricSchema);
module.exports=Fabric;