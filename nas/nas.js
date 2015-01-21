

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
var next=function(){
	
	if((!wait)&&dialog.length){
		current=dialog.shift();
		if((typeof current)=='function'){
			current();
		}else{
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
				
				var urlOpt=require('url').parse(url);
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
	
	console.log(modStatusResult);
	next();	
	
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




process.stdin.on('data', function (data) {
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
});

next();

