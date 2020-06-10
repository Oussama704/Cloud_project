const express = require('express');
const bcrypt=require('bcrypt');
const router = express.Router();
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
var mysql=require('mysql');
const upload=require('../model/upload');
const uploaddata=require('../model/uploaddata');
const jwt = require('jsonwebtoken');

var con =mysql.createConnection( {
    host:'db.cznzbhud3xml.us-east-1.rds.amazonaws.com',
    user:'admin',
    password:'rootroot',
    port:3306,
    database:'db'

})


var taille_glob=0;
var sess;



con.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + con.threadId);
});

router.get('/',(req,res)=>{
    if(req.session.email!==undefined)
        res.render('acceuil01',{nom:sess.nom,prenom:sess.prenom});
    else res.render('acceuil');
})
router.get('/login',(req,res)=>{
    if(req.session.email!==undefined) {
        res.redirect('/profile');
    }
    else {
        res.render('Login',{msgemail:null,msgpwd:null});
    }
})
router.get('/inscrire',(req,res)=>{
    if(req.session.email!==undefined) {
        res.redirect('/profile');
        console.log("iscri kayna");
    }
    else {
        res.render('Inscrire');
        console.log("iscri vide");
    }
})
router.get('/destroy_session',(req,res)=>{
    req.session.destroy();
    res.redirect('/login');
})




router.get('/profile',(req,res)=>{

    if(req.session.email===undefined) {
        res.redirect('/login');
    }
    else {
        var dataimage;
        let nbdata=0;

        sqldata='SELECT SUM(taille) AS taille_glob FROM images WHERE id_user='+sess.idp;
        sqlw='SELECT * FROM images WHERE id_user='+sess.idp;
        sqlc='SELECT COUNT(*) FROM images WHERE id_user='+sess.idp;
        con.query(sqldata,(err,result,fields)=>{
            if(err) throw err;
            console.log(result[0].taille_glob);
            taille_glob=result[0].taille_glob;

        })
        con.query(sqlw,(err,result,fields)=>{
            if(err) throw err;
            console.log(result.donnes);
            dataimage=result;
            console.log('___________-----------__________');
        })
        con.query(sqlc,(err,result,fields)=>{
            if(err) throw err;

            nbdata=result[0]['COUNT(*)'];
            console.log(dataimage);
            console.log('___________---__________');
            res.render('Profile',{email:sess.email,nom:sess.nom,prenom:sess.prenom,id:sess.idp,image:sess.image,nbrow:nbdata,dataimg:dataimage,espace_restant:sess.espace-taille_glob});

        });


    }
});



router.get('/modifier',(req,res)=>{
    if(req.session.email===undefined) {
        res.redirect('/login');
    }
    else {
        res.render('modifier',{nom:sess.nom,prenom:sess.prenom,image:sess.image});
    }
})
// Post
router.post('/inscrire',(req,res)=> {

    const {nom,prenom,email,password}=req.body;
    const info=[nom,prenom,email,bcrypt.hashSync(password,10)];
    if(req.body.password!==req.body.passwordv || req.body.password.length<8){

        res.redirect('/inscrire');

    }
   else{

            sqlr="INSERT INTO utilisateurs (nom,prenom,email,password) VALUES (?,?,?,?)";
            con.query(sqlr,info, function (err, result, fields) {
                if (err) throw err;
                console.log(result);
                res.redirect('/login');
            });

    }

});

router.post('/login',(req,res)=>{
    const {email,password}=req.body;
    const pass=password;
        sqlr="SELECT * FROM utilisateurs where email=?";
        con.query(sqlr,email, function (err, result, fields) {
            if (err) throw err;
            if(result.length===0){
                console.log("Error !! ");
                res.render('Login',{msgemail:'Email déjà utilisé',msgpwd:null});
            }
            else {

                var {id,nom, prenom, email, password,img_pro,espace_restant} = result[0];
                if(bcrypt.compareSync(pass,password)){

                    console.log(result);
                    sess=req.session;
                    sess.email=email;
                    sess.prenom=prenom;
                    sess.nom=nom;
                    sess.idp=id;
                    sess.image=img_pro;
                    sess.pwd=password;
                    sess.espace=espace_restant;
                    res.redirect('/profile');
                }
                else res.render('Login',{msgemail:null,msgpwd:'mot de passe inccorect'});;

            }
        });


});
router.post('/infoprofile',(req,res)=>{
    const {nom,prenom,email,password0,password}=req.body;
    console.log(password);
    const info=[nom,prenom,email,bcrypt.hashSync(password,10)];
    if(!bcrypt.compareSync(password0,sess.pwd)|| password.length<8){
        console.log('shiit');
        res.redirect('/modifier');
    }
    else{

        sess.email=email;
        sess.prenom=prenom;
        sess.nom=nom;
        sess.pwd=info[3];

        sqlr="UPDATE utilisateurs SET nom=?,prenom=?,email=?,password=? WHERE id="+sess.idp;
        con.query(sqlr,info, function (err, result, fields) {
            if (err) throw err;
            console.log(result);

        });
        res.redirect('/profile');
    }



});

router.post('/image',upload.single('imgpro'),(req,res)=>{
    sqlre='UPDATE utilisateurs SET img_pro =? WHERE id='+sess.idp;
    const filen=req.file.filename;
    con.query(sqlre,filen,(err,result,fields)=>{
        if(err) throw err;

    });
    sess.image=filen;
    console.log(filen);
    res.redirect('/profile');
});

router.post('/upload',uploaddata.single('data'),(req,res)=>{
        console.log(req.file);

        const datan = req.file.filename;
        const taille = req.file.size;
        const mtype = req.file.mimetype;
        const id_user = sess.idp;
        const datas = [id_user, datan, mtype, taille];
        if(10000000-taille_glob>=taille) {
            sql = 'INSERT INTO images (id_user,donnes,mtype,taille) VALUES (?,?,?,?) ';
            con.query(sql, datas, (err, result, fields) => {
                if (err) throw err;
                console.log(result[0]);

            });
        }



        res.redirect('/profile');

});

router.get('/delete',(req,res)=>{
    const donn=req.query.donnes;
    console.log(donn);
    sql='DELETE FROM images WHERE donnes='+donn.toString();
    con.query(sql,(err,result,fields)=>{
        if(err) throw err;

    })
    res.redirect('/profile')

});



module.exports=router;