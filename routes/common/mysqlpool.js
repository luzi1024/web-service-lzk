var mysql = require('mysql');

var pool = mysql.createPool({
//	connectionLimit : 100,
	host     : '127.0.0.1',      
	user     : '', 
	password : '',
	port: '3306',
	database:'testDB'
}); 

module.exports = pool;
