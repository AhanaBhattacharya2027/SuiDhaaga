const express=require('express');
const app=express();
const path=require('path');
require('dotenv').config(); 
const session = require('express-session');
const mongoose=require("mongoose");
const Seller = require('./models/Seller.js');
const Fabric = require('./models/Fabric.js');
const Tailor = require('./models/Tailor.js');
const Design =require('./models/Design.js');
const Order = require('./models/Order.js');
const multer = require('multer');
const OWNER_USERNAME = process.env.OWNER_ID;
const OWNER_PASSWORD = process.env.OWNER_PASSWORD;
const { storage } = require('./cloudinary'); // adjust path as needed
const upload = multer({ storage });
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
 
app.get('/',(req,res)=>{
    res.render('Homepage.ejs');
});
app.get('/Register-as-a-seller', (req,res)=>{
    res.render('SellerForm.ejs');
});
app.post('/Save-seller-data', async (req,res)=>{
    const{name,sellerid,password,contactno,brandname,city}=req.body;
    const existingSeller = await Seller.findOne({sellerid:sellerid});
    if(existingSeller)
    {
        return res.send("User already exists! Choose a different seller ID");
    }
    const newSeller = new Seller({
        name,
        sellerid,
        password,
        contactno,
        brandname,
        city
    });
    await newSeller.save();
    req.session.sellerid = sellerid;
    res.redirect(`seller-account/${sellerid}`);

});
app.get('/seller-account/:id', async (req,res)=>{
    const sellerid=req.params.id;
    if (req.session.sellerid !== req.params.id) {
        return res.status(403).send("Unauthorized access — please log in with the correct account");
    }
    const existingUser=await Seller.findOne({sellerid:sellerid});
    if(existingUser)
    {
        const fabricCards=await Fabric.find({sellerid:sellerid});
        return res.render('Seller-Account.ejs',{existingUser,fabricCards});
    }
    else
    {
        res.send("No user exists! Sign up first");
    }
});
app.get('/login-as-a-seller',(req,res)=>{
    res.render('SellerLoginForm.ejs');
});
app.post('/logged-in-as-a-seller', async (req,res)=>{
    const{sellerid,password}=req.body;
    const existingUser=await Seller.findOne({sellerid:sellerid});
    if(!existingUser)
    {
        return res.send("No user exists!Sign up first");
    }
    else if (existingUser.password !== password) {
        return res.send("Incorrect password. Please try again.");
    }
    else
    {
        req.session.sellerid=sellerid;        
        res.redirect(`seller-account/${sellerid}`);
    }
});
app.post('/check-obtained-orders',(req,res)=>{
    const {ownerid, password } = req.body;
    if (ownerid === OWNER_USERNAME && password === OWNER_PASSWORD) {
    req.session.owner = true;
    res.redirect('/owner-orders');
  } else {
    res.send('Invalid credentials. <a href="/owner-login">Try again</a>');
  }
});
app.get('/owner-orders',async (req,res)=>{
    const orders=await Order.find({}).sort({createdAt:-1});
    res.render("Received-Orders.ejs",{orders});
})
app.get('/upload-a-fabric',(req,res)=>{
    res.render('FabricForm.ejs');    
});
app.post('/fabric-uploaded-to-your-account', upload.single('images'), async (req,res)=>{
    const sellerid=req.session.sellerid;
    const {fabricId,title,description,material,pricepermeter}=req.body;
    const imageUrls = req.file.path;
    const newFabric = new Fabric({
        fabricId:fabricId,
        title:title,
        description:description,
        material:material,
        pricepermeter:pricepermeter,
        images:imageUrls,
        sellerid:sellerid

    });
    await newFabric.save();
    res.redirect(`/seller-account/${sellerid}`);

});
app.get('/all-fabrics',async (req,res)=>{
    const allFabrics=await Fabric.find({}).sort({createdAt:-1});
    res.render('Allfabrics.ejs',{allFabrics});
});
app.get('/join-as-a-tailor',(req,res)=>{
    res.render('TailorSignupForm.ejs');
});
app.get('/Fabric-selected/:id',async (req,res)=>{
    req.session.fabricId=req.params.id;
    const ExistingFabric= await Fabric.findOne({fabricId:req.session.fabricId});
    req.session.sellerid=ExistingFabric.sellerid;
    res.redirect('/our-tailors');
});
app.post('/Tailor-design-selected/:id',async (req,res)=>{
    const designId = req.params.id;
    const design= await  Design.findOne({designId:designId});
    const fabric=await Fabric.findOne({fabricId:req.session.fabricId});
    const{contactnumber,quantity,address}=req.body;
    const tailor=await Tailor.findOne({tailorId:req.session.tailorId});
    const addressTailor=tailor.address;
    const contactnumbertailor=tailor.contactno;
    const fabricPrice = Number(fabric.pricepermeter);
    const makingCharges = Number(design.makingCharges);
    const qty = Number(quantity);
    const total = (fabricPrice * qty) + makingCharges + 100 + 100;

    const newOrder = new Order({
        sellerid:req.session.sellerid,
        tailorid:req.session.tailorId,
        fabricId:req.session.fabricId,
        fabricImage:fabric.images,
        designImage:design.images[0],
        contactnumber:contactnumber,
        contactnumberTailor:contactnumbertailor,
        quantity:quantity,
        address:address,
        addressTailor:addressTailor,
        
    });
    await newOrder.save();
    const cn=tailor.contactno;
    res.render("YourOrderSummary.ejs",{newOrder,total,cn});
});
app.get('/owner-login', (req,res)=>{
    res.render("UserCredentialsLogin.ejs");
})
app.get('/see-orders/:id',async (req,res)=>{
    const orders= await Order.find({sellerid:req.params.id});
    res.render("Orders.ejs",{orders});
});
app.post('/joined-as-a-tailor', async(req,res)=>{
    const{fullname, tailorId, contactno, password, address, area}=req.body;
    const newTailor = new Tailor({
        fullname:fullname,
        tailorId:tailorId,
        contactno:contactno,
        password:password,
        address:address,
        area:area
    });
    await newTailor.save();
    req.session.tailorId=tailorId;
    res.redirect(`/your-tailor-account/${tailorId}`);
});
app.get('/post-design',(req,res)=>{
    res.render("DesignForm.ejs");
});
app.get('/enter-measurements',(req,res)=>{

})
app.post('/design-added-to-your-account',upload.array('images',5), async(req,res)=>{
    const imageURLs=req.files.map(file=>file.path);
    const tailorId=req.session.tailorId;
    const {designId,title,description,makingCharges}=req.body;
    const newDesign = new Design({
        designId:designId,
        title:title,
        description:description,
        makingCharges:makingCharges,
        images:imageURLs,
        tailorId:tailorId
    });
    await newDesign.save();
    res.redirect(`/your-tailor-account/${tailorId}`);
});
app.get('/Tailor-designs/:id',async (req,res)=>{
    const tailorId=req.params.id;
    req.session.tailorId=tailorId;
    const designs=await Design.find({tailorId:tailorId});
    res.render("Designs.ejs",{designs});
});
app.get('/confirm-order',(req,res)=>{

})
app.get('/login-as-tailor',(req,res)=>{
    res.render("TailorLogin.ejs");
});
app.post('/logged-in',async (req,res)=>{
    const {tailorId,password}=req.body;
    const existingTailor=await Tailor.findOne({tailorId:tailorId});
    if(!existingTailor)
    {
        return res.render("No account exists! Sign up first");
    }
    req.session.tailorId=tailorId;
    res.redirect(`/your-tailor-account/${tailorId}`);
});
app.get('/your-tailor-account/:id',async (req,res)=>{
    const tailorId = req.params.id;
    const existingTailor =await Tailor.findOne({tailorId:tailorId});
    if(!existingTailor)
    {
        return res.send("User doesn't exists!");
    }    
    const designs= await Design.find({tailorId:tailorId});
    res.render('Tailor-Account.ejs',{existingTailor,designs});
    
});
app.get('/our-tailors',async (req,res)=>{
    const Tailors= await Tailor.find({});
    res.render("Alltailors.ejs",{Tailors});
});
app.listen(8080, ()=> {
    console.log("App is listening at port 8080");
});

