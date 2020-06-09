var mysql=require('mysql');
var con =mysql.createConnection( {
    host:'127.0.0.1',
    user:'root',
    password:'root',
    port:3307,
    database:'base1'

})
con.connect(function(err) {
    if (err) throw err;
    con.query("SELECT * FROM utilisateurs", function (err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
});