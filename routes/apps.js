var express = require('express');
var Apps = express.Router();
var pool = require('./common/mysqlpool');

var datobj = {
csrfToken:'',
title:'Luzi的小站',
message: 'Luzi的小站',
dat:[]
}
/* GET users listing. */
Apps.get('/', function(req, res, next) {
	pool.getConnection(function (err, conn) {
		if (err){
		 res.send('{msg:"err",info:"'+err+'"}');
		 throw err;
		};
		conn.query("SELECT * FROM `web_scan` WHERE `mark`>0 ORDER BY `tm` DESC", function(err,rows,fields){
			if(err)	{res.send('{msg:"err",info:"'+err+'"}')}
			else{
				datobj.dat=[];
				for (var idx in rows){
					datobj.dat.push({"title":rows[idx].title,"ref":rows[idx].ref,"thunder":rows[idx].thunder});
				}
				res.render('apps',datobj);	
			}
		});
		conn.release();
	});	
  	
});

module.exports = Apps;
