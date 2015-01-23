

//var modStatusUrl=''
//var modStatusUName='';
//var modStatusPwd='';
//	
//
//
////start by getting a list of all active hosts on the server.
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

require('nas-config.js').config(function(config)){

	setInterval(function(){
		
		
		require('http').get(config.modStatusUrl, function(res){
		
			if(res.statusCode==200){
				
				var page='';
				res.on('data', function (chunk) {
					page+=chunk;
				});
				res.on('end', function (chunk) {
					require('./mod-status-parser.js').parse(page);
				});
			}
	
		}).on('error', function(e){
		  console.log("Got error: " + e.message);
		});
		
		
						
	}, 2000);
		
}




