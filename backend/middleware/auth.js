const jwt = require('jsonwebtoken');
const jwtSecret = 'my-secret-key';


function authenticateToken(req, res, next) {

    let token = req.header('Authorization').replace("Bearer ", "")
      
    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
  
      req.user = user;
      next();
    });
  }


  module.exports = authenticateToken
  