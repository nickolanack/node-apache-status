//the following blocks lists all hosts
//require('child_process').exec('httpd -t -D DUMP_VHOSTS', function (error, stdout, stderr) {
//    //console.log('stdout: ' + stdout);
//    //console.log('stderr: ' + stderr);
//    if (error !== null) {
//      console.log('exec error: ' + error);
//    }else{
//    	
//    	var defaultServer;
//    	var allNames=[], allNameDetails=[];
//    	var allAliases=[], allAliasDetails=[];
//
//    }
//});
var events=require('events');
function ApacheMonitor(){
   var me=this;
   events.EventEmitter.call(me);
   me._stop=monitor(me._processStatus.bind(me));
};

ApacheMonitor.prototype.__proto__=events.EventEmitter.prototype;

ApacheMonitor.prototype._processStatus=function(data){
	var me=this;
	//create an instance counter
	if(me._count===undefined)me._count=0;

	//console.log(JSON.stringify(skimObject(data), null, "\t"));

	me._last=me._current;
	me._last=me._last===undefined?emptyObject(data):me._last;
	me._current=data;
	
	me._compare(me._current, me._last);
	me._count++; 
	
	//if(me._count>=1)me._stop(); //for debug purposes.
};

ApacheMonitor.prototype._slotMap=function(cmp, arr){

	var me=this;
	var slots=[];
	arr.forEach(function(_ip, i){
		if(_ip===ip)slots.push(i);
	});
	return slots;
};

ApacheMonitor.prototype.slotsWithIp=function(ip){
	var me=this;
	return me._slotMap(ip, me._current.ips);

};


ApacheMonitor.prototype._compare=function(a, b){
	
	var me=this;
	a.unique_ips.forEach(function(ip){
		if(b.unique_ips.indexOf(ip)==-1){
			me.emit('ip.add', ip);	
		}
	})

	b.unique_ips.forEach(function(ip){
		if(a.unique_ips.indexOf(ip)==-1){
			me.emit('ip.remove', ip);
		}
	});

	a.unique_active_ips.forEach(function(ip){
		if(b.unique_active_ips.indexOf(ip)==-1){
			me.emit('ip.activate', ip);	
		}
	})

	b.unique_active_ips.forEach(function(ip){
		if(a.unique_active_ips.indexOf(ip)==-1){
			me.emit('ip.deactivate', ip);
		}
	});

	//console.log(JSON.stringify(b, null, "\t"));

};

var a=new ApacheMonitor();

// monitor function executes a callback (on an interval) passing mod-status data
// and returns a function that stops the monitor when executed.
function monitor(callback){
	var intrvl=null;
	require('./nas-config.js').configure({}, function(config){

		intrvl=setInterval(function(){
			
			
			require('http').get(config.modStatusUrl, function(res){
			
				if(res.statusCode==200){
					
					var page='';
					res.on('data', function (chunk) {
						page+=chunk;
					});
					res.on('end', function (chunk) {
						callback(require('./mod-status-parser.js').parse(page));
					});
				}
		
			}).on('error', function(e){
			  console.log("Got error: " + e.message);
			});
			
			
						
		}, 500);
	});

	return function(){
		if(intrvl!==null)clearInterval(intrvl);
	};

};

a.on('ip.activate', function(ip){

	require('./node-freegeoip.js').geocode(ip, function(obj){


		console.log((new Date().toISOString())+' | '+
			obj.ip+': '+obj.city+', '+
			obj.region_name+', '+obj.country_name);
	
	});
});

//just returns the same object with all its 
//contents stripped out
emptyObject=function(data){

	var empty={};
	Object.keys(data).forEach(function(k){
		if(data[k] instanceof Array){
			empty[k]=[];
		}

		//console.log(typeof data[k]);

	});
	//process.exit(0);
	return empty;
}

//returns the object, but with each array item, shortened. 
//this will produce printable object with less content to give an idea of the 
//objects structure
function skimObject(o){

	var obj={};
	Object.keys(o).forEach(function(k){

		obj[k]=o[k].slice(0, Math.min(o[k].length, 3));

	});

	return obj;
}
