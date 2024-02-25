const express = require('express');
const app  = express();
const db = require('./db');
require('dotenv').config();

// require('dotenv').config();
const bodyPasrer = require('body-parser');
app.use(bodyPasrer.json()); //req.body

// const jwtAuthMiddleware = require('./jwt');

const userRoutes = require('./Routes/userRoutes');
const candidateRoutes = require('./Routes/candidateRoutes');

app.use('/user',userRoutes);
app.use('/candidate',candidateRoutes);


const PORT = process.env.PORT||3000;

app.listen(PORT,()=>{
    console.log("Listen ing PORT : ",PORT);
})
