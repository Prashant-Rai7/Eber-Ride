const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 3000;

const cors = require('cors')

require('./database/db');
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(cors())

const Routes = require('./routes/route')
const loginRoutes = require('./routes/login')
const registerRoutes = require('./routes/register')

app.use(Routes)
app.use(loginRoutes)
app.use(registerRoutes)

const Model = require('./models/model')

 

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
 