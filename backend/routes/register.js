const express = require("express");
const registerRoutes = express.Router() 
const signup_data = require("../models/model");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtSecret = 'my-secret-key';



//                API
//to register data of user in database using Angular form.


registerRoutes.post('/register', (req,res) => {
    console.log(req.body);

    // const { adminName, email, password } = req.body;
    // const usersignupData = new signup_data({
    //   adminName,
    //   email,
    //   password,
    // });

    const user = new signup_data({
      adminName: req.body.adminName,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)), // Hash the password
      cnfpassword: req.body.cnfpassword,
    })
    user.save()
    .then(() => {
      // Generate a JWT token
      const token = jwt.sign({ email: user.email }, jwtSecret);
      console.log("Registration JWT Token :",token)
      res.json({success: true, message: "Account has been created", token})
      
    }).catch((err) => {
      console.log(err);
      if(err.code === 11000){
        return res.json({success: false, message: "Email Already Exists"})
      }
      res.json({success: false, message: err})
    })
})


module.exports = registerRoutes