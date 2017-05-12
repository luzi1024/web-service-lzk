var express = require('express');
var router = express.Router();
var pool = require('./common/mysqlpool');

/*
 普通页面
*/
var datobj = {
title:'Hey',
message: 'Hello there2',
confdata: {
	labels: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"],
	datasets: [{
		label: "My First dataset",
		backgroundColor: 'rgb(255, 99, 132)',
		borderColor: 'rgb(255, 99, 132)',
		data: [0,0,0,0,0,0,0],
		fill: false,
	}, 
	{
		label: "My Second dataset",
		backgroundColor: 'rgb(54, 162, 235)',
		borderColor: 'rgb(54, 162, 235)',
		data: [1,1,1,1,1,1,1],
		fill: false,
	}],
	opt:{
		responsive: true,
		title:{
			display:true,
			text:'Chart.js Line Chart'
		},
		tooltips: {
			mode: 'index',
			intersect: false,
		},
		hover: {
			mode: 'nearest',
			intersect: true
		},
		scales: {
			xAxes: [{
				display: true,
				scaleLabel: {
					display: true,
					labelString: '时间'
				}
			}],
			yAxes: [{
				display: true,
				scaleLabel: {
					display: true,
					labelString: '温度'
				}
			}]
		},
		elements:{
			line:{
				tension:0.4
			}
		}
	}
}
}


/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(JSON.stringify(req.headers,null,4))
  //res.send('Hello World')
  

  	pool.getConnection(function (err, conn) {
		if (err) throw err;	
		conn.query("SELECT *,DATE_FORMAT(tm,'%Y-%m-%d')as D,HOUR(TIME(tm))as H FROM `dev_1002` WHERE DATE(tm)>DATE_SUB(CURDATE(),INTERVAL 2 DAY) ORDER BY tm DESC", function(err,rows,fields){
			if(err)	{res.send('{msg:"err",info:"'+err+'"}')}
			else
			{
				if(rows.length>0)
				{
					var senddata = [];
					var dictDT={}
					var dcount=0;
					for (var idx in rows)
					{
						if(!dictDT[rows[idx].D])
							dictDT[rows[idx].D]={0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[],9:[],10:[],11:[],12:[],13:[],14:[],15:[],16:[],17:[],18:[],19:[],20:[],21:[],22:[],23:[]};
						dictDT[rows[idx].D][Number(rows[idx].H)].push(rows[idx].temperature)
					}
					for (var iDay in dictDT)
					{
						for(var iHour in dictDT[iDay])
						{
							if(dictDT[iDay][iHour])
							{
								senddata.push(dictDT[iDay][iHour][0]) // 一个时间多个数值 暂取第一个 应该取平均值
							}
							else
							{
								senddata.push("")
							}
						}
						datobj.confdata.datasets[dcount].data = senddata
						datobj.confdata.datasets[dcount].label = iDay
						dcount++
						senddata=[]
					}
					console.log(dictDT);
					
					res.render('index',datobj)
					//res.send('hehe');
				}
				else
				{
					datobj.message="No Data!"
					res.render('index',datobj)
				}
			}
		})
		conn.release()
	})
	console.log("dddone")
});

module.exports = router;
