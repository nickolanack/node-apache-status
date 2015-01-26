module.exports={
	geocode:geocode
};
function geocode(ip, callback){




	require('https').get('https://freegeoip.net/json/'+ip, function(res){


		var page='';
		res.on('data', function (chunk) {
			page+=chunk;
		});
	
		res.on('end', function (chunk) {
			try{
				var obj=JSON.parse(page);
				callback(obj);
			}catch(e){
				//console.log(ip+': geocoder - too busy')
				setTimeout(function(){
					geocode(ip, callback);
				},500);
			}
		});
	});
}

