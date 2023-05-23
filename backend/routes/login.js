const express = require("express");
const loginRoutes = express.Router() 
const signup_data = require("../models/model");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtSecret = 'my-secret-key';
// const localStorage = require('localStorage');


//              API
//to login user using the credentials used in signup.


loginRoutes.post('/login', async (req,res) => {
    // console.log(req.body);
    console.log("Entered Email :",req.body.email);
    console.log("Entered Password :",req.body.password);

  
    const { email, password } = req.body;
  
        try {
          const user = await signup_data.findOne({ email });
  
          if (!user) {
            return res.status(401).json({ success: false, message: "Authentication failed. User not found." });
          }
  
          // Compare the provided password with the hashed password stored in the database
          const isPasswordValid = bcrypt.compareSync(password, user.password);


          // Perform password validation here, e.g., by comparing hashes or using a library like bcrypt.
          // if (user.password !== password) {
          //   return res.status(401).json({ success: false, message: "Authentication failed. Incorrect password." });
          // }
          if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Authentication failed. Incorrect password.' });
          }
  
          // User authentication successful.

          // Generate a JWT token
          const token = jwt.sign({ email: user.email }, jwtSecret);
          console.log("Login JWT Token :",token)

          // Store the token in local storage
          // localStorage.setItem('token', token);

          // Here, you can generate a token (e.g., JWT) and send it back to the client for future authentication.
          res.json({ success: true, message: "Authentication successful", token });

        } catch (err) {
          console.log(err);
          res.status(500).json({ success: false, message: "Internal Server Error" });
        }
      });
  
 
      module.exports = loginRoutes