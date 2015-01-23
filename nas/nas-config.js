







function configure(callback){
	
	var modStatusResult=null;
	var modStatusDialog=[['modStatusUrl', 'Url for mod-status? ', function(url, config, cli){
		
		cli.wait();
		require('http').get(url, function(res) {
			modStatusResult=res;
			if(res.statusCode==401){
				//needs user-name and password
				console.log('url requires authentication');
				//inject username and password dialogs
				cli.insert([['modStatusUser', 'username for '+config.modStatusUrl+'? '],['modStatusPass', 'password for '+config.modStatusUrl+'? ',function(password, config, cli){
					
					
					cli.wait();
					
					var urlOpt=require('url').parse(config.modStatusUrl);
					urlOpt.auth=config.modStatusUser+":"+password;
					
					require('http').get(urlOpt, function(res){
						modStatusResult=res;
						if(res.statusCode==200){
							config.modStatusUrl=urlOpt;
						}

						cli.next();
					
					}).on('error', function(e){
					  console.log("Got error: " + e.message);
					});
					
					return password;
					
				}]]);
				
			}
			cli.next();
		
		}).on('error', function(e) {
		  console.log("Got error: " + e.message);
		});
		
		return url
		
	}], function(config, cli){
		
		var page='';
		modStatusResult.setEncoding('utf8');
		modStatusResult.on('data', function (chunk) {
			page+=chunk;
		});
		modStatusResult.on('end', function (chunk) {
			page+=chunk;
			if(page.indexOf('Apache Server Status')>=0){
				console.log('Started Mod-Status Scrapper');
				
				cli.next();	
			}
			
		});
		
	}]


	require('./cli-config.js').configure([['useModStatus', 'Use mod-status? (y/n) ', function(use, config, cli){
		
		if(use=="y"){
			//insert modStatus options dialog
			cli.insert(modStatusDialog);
			return true;
		}
		return false;
		
	}]], callback);
	
}

module.exports = {
		configure: configure;
}