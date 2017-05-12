var express = require('express');
var api = express.Router();
var pool = require('./common/mysqlpool');


/* GET users listing. */
api.get('/', function(req, res, next) {
    console.log(JSON.stringify(req.headers,null,4));
	console.log(req.ip);
    console.log(req.get('api-key'));
    console.log(req.query);
//
	pool.getConnection(function (err, conn) {
			if (err) throw err;			
			conn.query('select * from dev_idx WHERE DEVICE_ID='+req.query.deviceid +' AND API_KEY=\''+req.get('api-key')+'\'', function(err,rows,fields){
				if(err)	{return res.send('{msg:"err",info:"'+err+'"}')}
				else
				{
					if(rows.length>0)
					{
						var field = '';
						for (var key in req.query)
						{
							if(key.toUpperCase() == 'DEVICEID')
								continue;
							else if(key.toUpperCase() == 'TM') // 时间字段需特殊处理
							{
								field+=('DATE('+key.toUpperCase()+')=');
								field+=('\''+req.query[key].toUpperCase()+'\' AND ');
							}
							else
							{
								field+=(key.toUpperCase()+'=');
								field+=('\''+req.query[key].toUpperCase()+'\' AND ');
							}

						}
						field+='1';
						console.log(field);
						
						if(field !== '1')
						{
							var tbName = 'dev_'+req.query.deviceid;
							conn.query('select * from '+tbName+' WHERE '+field, function (err,rowsd,fields){	
								if(err)	{res.send('{msg:"err",info:"'+err+'"}');}
								else
								{
									
									if(rowsd.length>0){
										console.log(rowsd);
										var senddata='';
										for (var idx in rowsd)
										{
											senddata += (JSON.stringify(rowsd[idx],null,4)+"\r\n");
										}
										res.send(senddata);
									}
									else{
										res.send('none');
									}
								
								}

							});
						}
						else{
							res.send('none');
						}
					}
					else
					{
						res.send('{msg:"err",info:"Deny"}');
					}
				
				}
			});
		conn.release();
		//pool.end();
		});
  //console.log(req);
});


api.post('/', function (req, res) {

	console.log(JSON.stringify(req.body,null,4));

    console.log(req.get('api-key'));
    console.log(req.query);
	
	pool.getConnection(function (err, conn) {
		if (err) throw err;	
		conn.query('select * from dev_idx WHERE DEVICE_ID='+req.query.deviceid +' AND API_KEY=\''+req.get('api-key')+'\'', function(err,rows,fields){
			if(err)	{res.send(err)}
			else if(rows.length==0){res.send('{msg:"err",info:"Deny"}');}
			else
			{
				var count=0;
				for(var key in req.body)
				{
					//console.log(key+req.body[key]);
					count++;
				}
				if(count<1)
					return res.send('{msg:"err",info:"body count 0"}');
				// 认证成功
				var field='';
				var value='';
				if(rows[0]['POINT1']){field+=('`'+rows[0]['POINT1']+'`,');value+=('\''+req.body[rows[0]['POINT1']]+'\',');};
				if(rows[0]['POINT2']){field+=('`'+rows[0]['POINT2']+'`,');value+=('\''+req.body[rows[0]['POINT2']]+'\',');};
				if(rows[0]['POINT3']){field+=('`'+rows[0]['POINT3']+'`,');value+=('\''+req.body[rows[0]['POINT3']]+'\',');};
				if(rows[0]['POINT4']){field+=('`'+rows[0]['POINT4']+'`,');value+=('\''+req.body[rows[0]['POINT4']]+'\',');};
				if(rows[0]['POINT5']){field+=('`'+rows[0]['POINT5']+'`,');value+=('\''+req.body[rows[0]['POINT5']]+'\',');};
				if(rows[0]['POINT6']){field+=('`'+rows[0]['POINT6']+'`,');value+=('\''+req.body[rows[0]['POINT6']]+'\',');};
				if(rows[0]['POINT7']){field+=('`'+rows[0]['POINT7']+'`,');value+=('\''+req.body[rows[0]['POINT7']]+'\',');};
				// 此处使用replace还是insert有待思考
				var sqls ='INSERT INTO `dev_'+req.query.deviceid+'` ('+field+'`DATA`) VALUES ('+value+'\''+JSON.stringify(req.body)+'\')';

				console.log(sqls);
				conn.query(sqls, function(err,rows,fields){
					if(err) {res.send('{msg:"err",info:"'+err+'"}');}
					else{res.send('{msg:"ok"}');}
				
				});
				
			}
			conn.release();
		});
	});
});

module.exports = api;
