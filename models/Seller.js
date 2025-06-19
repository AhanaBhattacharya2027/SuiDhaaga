const mongoose=require("mongoose");
const sellerSchema=new mongoose.Schema({
    name:
    {
        type:String,
        required:true
    },
    sellerid:
    {
        type:String,
        required:true,
        unique:true
    },
    password:
    {
        type:String
    },
    contactno:{
        type:String
    },
    brandname:String,
    city:String
});
const Seller = mongoose.model('Seller',sellerSchema);
module.exports=Seller;