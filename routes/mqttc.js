var express = require('express');
var mqttc = express.Router();
var pool = require('./common/mysqlpool');

var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://lzk1024.com', {username:'', password:''});
require('date-utils');
var lastDate = new Date(); // 时间控制 每隔一小时记录一次

client.on('connect', function () {
  console.log('connetced mqtt service!'); 
  client.subscribe('/home/esp-link/#');
  client.publish('/home/esp-link/test', 'Hello Im web!');
})
 
client.on('message', function (topic, message) {
  // message is Buffer 
  if(topic=="/home/esp-link/1002"){	
	var jsdata = JSON.parse(message.toString());
	if(jsdata["msg"]=="data"){
		//console.log("data:"+message.toString());
		var curDate = new Date();
		if(Date.compare(curDate,lastDate) == 1){
			lastDate.addHours(1); //延后一小时 再次记录
		}
		else{
		//	console.log("lastDate: "+lastDate.toLocaleString());
			return;
		}
		// 写入数据库操作
		pool.getConnection(function (err, conn) {
			if (err) throw err;	
			conn.query('select * from dev_idx WHERE DEVICE_ID=1002 AND API_KEY=\'c417fa285141595c7ea0e505530fde90\'', function(err,rows,fields){
				if(err)	res.send(err);
				else if(rows.length==0)res.send('{msg:"err",info:"Deny"}');
				else{
					var count=0;
					for(var key in jsdata)
					{
						//console.log(key+req.body[key]);
						count++;
					}
					if(count<1) return res.send('{msg:"err",info:"body count 0"}');
					// 认证成功
					var field='';
					var value='';
					// POINT1 必须为tm
					if(rows[0]['POINT1']){field+=('`'+rows[0]['POINT1']+'`,');value+=('FROM_UNIXTIME(\''+jsdata[rows[0]['POINT1']]+'\'),');};
					if(rows[0]['POINT2']){field+=('`'+rows[0]['POINT2']+'`,');value+=('\''+jsdata[rows[0]['POINT2']]+'\',');};
					if(rows[0]['POINT3']){field+=('`'+rows[0]['POINT3']+'`,');value+=('\''+jsdata[rows[0]['POINT3']]+'\',');};
					if(rows[0]['POINT4']){field+=('`'+rows[0]['POINT4']+'`,');value+=('\''+jsdata[rows[0]['POINT4']]+'\',');};
					if(rows[0]['POINT5']){field+=('`'+rows[0]['POINT5']+'`,');value+=('\''+jsdata[rows[0]['POINT5']]+'\',');};
					if(rows[0]['POINT6']){field+=('`'+rows[0]['POINT6']+'`,');value+=('\''+jsdata[rows[0]['POINT6']]+'\',');};
					if(rows[0]['POINT7']){field+=('`'+rows[0]['POINT7']+'`,');value+=('\''+jsdata[rows[0]['POINT7']]+'\',');};
					// 此处使用replace还是insert有待思考
					var sqls ='INSERT INTO `dev_1002` ('+field+'`DATA`) VALUES ('+value+'\''+JSON.stringify(jsdata)+'\')';

					console.log(sqls);
					conn.query(sqls, function(err,rows,fields){
						if(err) {console.log('{msg:"err",info:"'+err+'"}');}
						else{console.log('{msg:"ok"}');}
					});	
				}
				conn.release();
			})
		});
		
	}
	else if(jsdata["msg"]=="beat"){
	//	console.log("beat: tm:"+jsdata["tm"]);
	}
	else{
		console.log(jsdata);
	}
  }
  else{
  	console.log(topic+message.toString());
  }
  
  //client.end()
})

module.exports = mqttc;
