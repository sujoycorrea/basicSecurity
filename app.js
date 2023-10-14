require('dotenv').config();
const md5 = require('md5');
const express = require("express");
const app = express()
const port = 3000;
const bodyParser = require("body-parser");
const lodash = require("lodash");
// const encrypt = require("mongoose-encryption");

const { Schema, default: mongoose } = require("mongoose");
const { PassThrough } = require("stream");

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended:true}));

// ---------setUp Database--------------

mongoose.connect("mongodb://127.0.0.1:27017/userDB")


// --------------setup Schema--------------

const userSchema= new mongoose.Schema({
    email:{
        type: String,
        required : [true, "Please provide the email"]
    },
    password:{
        type: String,
        required: [true, "Please provide password"]
    }
})


//------------encryption------------



// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields:['password']})

//-----------------setup Collections-----------

const User = new mongoose.model("user", userSchema);



//----------GET----------------

app.get("/", function(req, res){

    res.render("home");
})

app.get("/login", function(req, res){

    res.render("login");
})

app.get("/register", function(req, res){

    res.render("register");
})



//--------------POST---------------------

app.post("/register", async function(req, res){

    let userName = req.body.username;
    let password = md5(req.body.password);
    
    const newUser = new User({
        email: userName,
        password: password
    })

    
    try{
        await newUser.save()
        console.log("user is saved");
        res.render("secrets");
    }
    catch(error){
        console.log("user is not creted");
        console.log(error.message);
    }
})


app.post("/login", async function(req, res){

    let userName = req.body.username;
    let password = md5(req.body.password);

    try{
       const user=  await User.findOne({email:userName})
        if (user){
            if(user.password === password){
                console.log("User is found");
                res.render("secrets");
            } else{
                console.log("Found, but your password is wrong");
            }
        } else{
            console.log("No match found, homie");
            res.send("There ain't no person like that here")
            
        }
    }
    catch(error){
        console.log("Something went wrong, homie");
        console.log(error.message);
    }
})


//---------Listen---------------

app.listen(port, function(req, res){

    console.log(`Your port number ${port} is fired up`);
})

