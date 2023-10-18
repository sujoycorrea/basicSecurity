require('dotenv').config();
// const md5 = require('md5');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
const express = require("express");
const app = express()
const port = 3000;
const bodyParser = require("body-parser");
const lodash = require("lodash");
// const encrypt = require("mongoose-encryption");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const { Schema, default: mongoose } = require("mongoose");
const { PassThrough } = require("stream");

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret: process.env.ANOTHER_SECRET,
    resave: false,
    saveUninitialized: true
}))

app.use(passport.initialize());

app.use(passport.session())

// ---------setUp Database--------------

mongoose.connect("mongodb://127.0.0.1:27017/userDB")

// --------------setup Schema--------------

const userSchema= new mongoose.Schema({
    email: String,
    password: String
})

userSchema.plugin(passportLocalMongoose);   //This will be used to hash and salt our passwords

//------------encryption------------



// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields:['password']})

//-----------------setup Collections-----------

const User = new mongoose.model("user", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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

app.get("/secrets", function(req, res){
    
    if(req.isAuthenticated()){
        res.render("secrets")
    } else{
        res.redirect("/login");
    }
    
})

app.get("/logout", function(req, res){
    req.logout(function(err){
        if (err){
            console.log(err);
        } else {
            res.redirect("/");
        }
    })
})

//--------------POST---------------------

app.post("/register", async function(req, res){

 User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
        console.log(err);
        res.redirect("/register");
    } else {
        passport.authenticate("local")(req, res, function(){
            console.log(user); //This will give you the details as it is created in the DB
            res.redirect("/secrets");
        });

    }
 })
    
    
})


app.post("/login", async function(req, res){

    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user, function(err){
        if (err){
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function(){
                console.log(req.user); //This will give you the details as it is created in the DB
                res.redirect("/secrets");
            })
        }
    })
})


//---------Listen---------------

app.listen(port, function(req, res){

    console.log(`Your port number ${port} is fired up`);
})

