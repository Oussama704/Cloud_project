const express=require('express');
const session=require('express-session');
const fileUpload = require('express-fileupload');
const path=require('path')

bodyParser=require("body-parser");
const app= express();

const port =process.env.PORT || 80;
app.set('views','./Public/View');
app.set('view engine','ejs');
app.use(session({secret:"OA3"}));
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.urlencoded({extended :false}));
//app.use(express.static(__dirname + '/View'));
app.use(express.static('Public'));
app.use(express.static('Public/View'));
app.use('/',require('./Public/routes/router'));


app.listen(port, console.log('Suceess!!'));
