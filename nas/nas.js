

var modStatusUrl=''
var modStatusUName='';
var modStatusPwd='';
	


//start by getting a list of all active hosts on the server.
require('child_process').exec('httpd -t -D DUMP_VHOSTS', function (error, stdout, stderr) {
    //console.log('stdout: ' + stdout);
    //console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }else{
    	
    	
    	
    	var defaultServer;
    	var allNames=[], allNameDetails=[];
    	var allAliases=[], allAliasDetails=[];
    	
    	
    	
    	
    	
    	
    }
});




		


//process.stdin.resume();
//process.stdin.setEncoding('utf8');
var config={};
var dialog=null;
var wait=false;
var current;


var listener=function (data) {
	var text=data.toString();
	var value=text.substring(0,text.length-1);
	console.log(current[0]+'=>'+current.length+': '+(typeof current[2]));
	if(current.length==3&&(typeof current[2])=='function'){
		//use function to parse response, it can also insert additional dialog steps
		config[current[0]]=current[2](value);
	}else{
		//use response as value
		config[current[0]]=value;
		
	}
	console.log('set ['+current[0]+']='+config[current[0]]);
	next();
}

var next=function(){
	
	if((!wait)&&dialog.length){
		current=dialog.shift();
		if((typeof current)=='function'){
			current();
		}else{
			process.stdin.once('data', listener);
			process.stdout.write(current[1]);
		}
		
	}
}

var last=function(){
	dialog=([current]).concat(dialog);
	next();
}


var modStatusResult=null;
var modStatusDialog=[['modStatusUrl', 'Url for mod-status? ', function(url){
	
	wait=true;
	require('http').get(url, function(res) {
		modStatusResult=res;
		if(res.statusCode==401){
			//needs user-name and password
			console.log('url requires authentication');
			//inject username and password dialogs
			dialog=([['modStatusUser', 'username for '+config.modStatusUrl+'? '],['modStatusPass', 'password for '+config.modStatusUrl+'? ',function(password){
				
				
				wait=true;
				
				var urlOpt=require('url').parse(config.modStatusUrl);
				urlOpt.auth=config.modStatusUser+":"+password;
				
				require('http').get(urlOpt, function(res){
					modStatusResult=res;
					if(res.statusCode==200){
						config.modStatusUrl=urlOpt;
					}

					wait=false; next();
				
				}).on('error', function(e){
				  console.log("Got error: " + e.message);
				});
				
				return password;
				
			}]]).concat(dialog);
			
		}
		wait=false; next();
	
	}).on('error', function(e) {
	  console.log("Got error: " + e.message);
	});
	
	return url
	
}], function(){
	
	var page='';
	modStatusResult.setEncoding('utf8');
	modStatusResult.on('data', function (chunk) {
		page+=chunk;
	});
	modStatusResult.on('end', function (chunk) {
		page+=chunk;
		if(page.indexOf('Apache Server Status')>=0){
			console.log('Started Mod-Status Scrapper');
			
			
			
		
			
			var parsePage=function(page){
				
				var modeTable={"_":"waiting", "S":"starting", "R":"reading",
						"W":"sending", "K":"keep-alive", "D":"dns-lookup",
						"C":"closing", "L":"logging", "G":"gracefully-finishing",
						"I":"idle-cleanup", ".":"open"};
				
				var ips=[];
				var modes=[];
				
				var tables=page.split('<table'); tables.shift();
				
				var rows=tables[0].split('<tr>'); rows.shift(); //discard first
				
				rows.forEach(function(r, i){
					if(i==0)return; //skip header
					var row=r.split('</tr>')[0];
					var tdatas=row.split('<td'); tdatas.shift();
					
					//console.log(r.split('</tr>')[0]);
					
					//if(i==1){
						
						tdatas.forEach(function(t,i){
							
							var tdata=t.split('</td>')[0];
							var ip=tdata[10];
							ip=ip.substring(ip.indexOf('>')+1);
							ips.push(ip);
							
							var mode=tdata[3];
							mode=mode.substring(mode.indexOf('>')+1);
							modes.push(modeTable[mode]);
							
							
							
						});
						
					//}
					
				});
				
				modes.forEach(function(m,i){
					
					console.log(JSON.stringify({mode:m, ip:ips[i]}));
					
				})
				
			};
			
			parsePage(page);
			setInterval(function(){
				
				
				require('http').get(config.modStatusUrl, function(res){
				
					if(res.statusCode==200){
						
						var page='';
						res.on('data', function (chunk) {
							page+=chunk;
						});
						res.on('end', function (chunk) {
							parsePage(page);
						});
					}

				}).on('error', function(e){
				  console.log("Got error: " + e.message);
				});
				
				
								
			}, 2000);
			
			next();	
		}
		
	});
	
}]

var dialogUseModeStatus=[['useModStatus', 'Use mod-status? (y/n) ', function(use){
	
	if(use=="y"){
		//insert modStatus options dialog
		dialog=(modStatusDialog).concat(dialog);
		return true;
	}
	return false;
	
}]]

dialog=dialogUseModeStatus;



next();

