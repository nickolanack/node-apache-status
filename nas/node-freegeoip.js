module.exports={
	geocode:geocode
};



var cache={};

function geocode(ip, callback){


	if(cache[ip]1!==undefined){
		callback(cache[ip]);
		return;
	}

	require('https').get('https://freegeoip.net/json/'+ip, function(res){


		var page='';
		res.on('data', function (chunk) {
			page+=chunk;
		});
	
		res.on('end', function (chunk) {
			try{
				var obj=JSON.parse(page);
				cache[ip]=obj;
				callback(obj);
			}catch(e){
				//console.log(ip+': geocoder - too busy')
				setTimeout(function(){
					geocode(ip, callback);
				},500);
			}
		});
	}).on('error', function(e) {
		  console.error(e);
	});
}

