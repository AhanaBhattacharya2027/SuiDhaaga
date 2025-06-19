const mongoose=require("mongoose");
const orderSchema = new mongoose.Schema({
    sellerid:{
        type:String
    },
    tailorid:{
        type:String
    },
    fabricImage:String,
    designImage:String,
    fabricId:String,
    orderdate:{
        type:Date,
        default:Date.now
    },
    contactnumber:String,
    contactnumberTailor:String,
    quantity:Number,
    address:String,
    addressTailor:String
},{timestamps:true});
const Order = new mongoose.model('Order',orderSchema);
module.exports=Order;
