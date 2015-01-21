

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



require('http').get("http://media.geolive.ca/server-status", function(res) {

	//console.log(res);
	
	
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});
		


process.stdin.resume();
process.stdin.setEncoding('utf8');
var config={};
var dialog=[['useModStatus', 'Use mod-status? (y/n)', function(response){
	
	if(response=="y\n"){
		dialog.splice(0,0,[['modStatusUrl', 'Url for mod-status?'],['modStatusUser', 'username for mod-status?'],['modStatusPass', 'password for mod-status?']]);
		return true;
	}
	return false;
	
}]]


var current;
var next=function(){
	if(dialog.length){
		current=dialog.shift();
		process.stdout.write(current[1]);
	}
}
process.stdin.on('data', function (text) {
	console.log(current[0]+'=>'+current.length+': '+(typeof current[2]));
	if(current.length==3&&(typeof current[2])=='function'){
		//use function to parse response, it can also insert additional dialog steps
		config[current[0]]=current[2](text);
	}else{
		//use response as value
		config[current[0]]=text;
		
	}
	console.log('set ['+current[0]+']='+config[current[0]]);
	next();
});

next();

