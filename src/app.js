require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./logger');
const { NODE_ENV, API_TOKEN } = require('./config');
const bookmarkRouter = require('./bookmarks/bookmarkRouter');

const app = express();

const morganSetting = 
  NODE_ENV === "production"
  ? "tiny"
  : "dev"

const validateBearerToken = (req,res,next) => {
  const bearerToken = req.get('Authorization');
  const apiToken = process.env.API_TOKEN || API_TOKEN;

  if(!bearerToken || bearerToken.split(" ")[1] !== apiToken){
    logger.error("Unauthorized request to path " + req.path);
    return res
      .status(401)
      .json({
        error: "Unauthorized Request"
      })
  }
  next();
}

app.use(validateBearerToken);
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(bookmarkRouter);

const errorHandler = (error,req,res,next) => {
  let response;
  if (NODE_ENV === "production") {
    response = { error : { message: "server error" } }
  }else{
    console.error(error);
    response = { message: error.message, error }
  }
  res.status(500).json(response);
}

app.use(errorHandler);

module.exports = app;