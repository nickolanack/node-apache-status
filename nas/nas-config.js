







function configure(config, callback){
	
	
	
	
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

	
	fs.exists('./nas-config.json', function(exists){
		if(exists){
			var o=require('./nas-config.json');
			Object.keys(o).forEach(function(k){
				config[k]=o[k];
			});
			callback(config);
		}else{
			
			require('./cli-config.js').configure(config, [['useModStatus', 'Use mod-status? (y/n) ', function(use, config, cli){
				
				if(use=="y"){
					//insert modStatus options dialog
					cli.insert(modStatusDialog);
					return true;
				}
				return false;
				
			}]], function(config){
				
				callback(config);
				fs.writeFile('./nas-config.json', JSON.stringify(config), function (err) {
					  if (err) throw err;
				});
			});
			
		}
		
	});

	
	
}

module.exports = {
		configure: configure;
}