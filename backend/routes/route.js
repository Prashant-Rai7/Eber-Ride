const express = require("express");
const Routes = express.Router() 
const signup_data = require("../models/model");
const authenticateToken = require("../middleware/auth");




// To show API is Working.
Routes.get('/', async (req, res) => {
  res.json({Message: 'Hello, API is Working', Switch:`http:localhost:4000/logindata`})
  // res.send("API is working")
})





//to fetch data from database of registered user.
Routes.get('/logindata', authenticateToken, async (req, res) => {
  try {
    const data = await signup_data.find({});
    res.json({ token: req.user, data });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
})



module.exports = Routes