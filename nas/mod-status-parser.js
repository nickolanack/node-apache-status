module.exports = {
		parse: parse
}


function parse(page){

var modeTable={"_":"waiting", "S":"starting", "R":"reading",
		"W":"writing", "K":"keep-alive", "D":"dns-lookup",
		"C":"closing", "L":"logging", "G":"gracefully-finishing",
		"I":"idle-cleanup", ".":"open"};

var ips=[];
var modes=[];
var hosts=[];

var active=[];	
var unique=[];

var tables=page.split('<table'); tables.shift();

var rows=tables[0].split('<tr>'); rows.shift(); //discard first

rows.forEach(function(r, i){
	if(i==0)return; //skip header
	var row=r.split('</tr>')[0];
	var tdatas=row.split('<td'); tdatas.shift();
	
	//console.log(r.split('</tr>')[0]);
	
	if(i==1){
		
		tdatas.forEach(function(t,i){
			console.log(i+': '+t);
		});
		
	}
		
		
			
	
	
	var ip=tdatas[10]; 
	ip=ip.split('</td>')[0].substring(ip.indexOf('>')+1);
	ips.push(ip);
	
	if(unique.indexOf(ip)==-1){
		unique.push(ip);
	}
	
	var mode=tdatas[3];

	mode=mode.split('</td>')[0].substring(mode.indexOf('>')+1).replace(/^\s+|\s+$/g,'');
	mode=mode.split('</b>')[0];
	mode=mode.split('<b>').pop();
	modes.push(modeTable[mode]);
	
	
	var host=tdatas[11].split('</td>')[0].split('nowrap>').pop();
	hosts.push(host);
	//console.log(mode+' '+modeTable[mode]);	
			
		
		
	//}
	
});



var uniqueActiveIps=[];
modes.forEach(function(m,i){
	
	
	
	if((['reading', 'writing']).indexOf(m)==-1)return;
	active.push(i);
	var ip=ips[i];
	if(uniqueActiveIps.indexOf(ip)==-1)uniqueActiveIps.push(ip);
	
});
//console.log('Active Ips: '+JSON.stringify(uniqueActiveIps));
uniqueActiveIps.forEach(function(ip){
	
	var is=[];
	var last=0;
	
	while((last=ips.indexOf(ip, last))>=0){
		
		is.push(last);
		last++;
	}
	var h=[];
	var activeSlots=0;
	is.forEach(function(i){
		var host=hosts[i];
		if((['reading', 'writing']).indexOf(modes[i])>=0){
			activeSlots++;
		}
		if(h.indexOf(host)==-1)h.push(host);
	})
	var object={ip:ip, numSlots:is.length, numActive:activeSlots, hosts:h, slots:is};
	
	console.log(JSON.stringify(object));
	
});


//console.log('Active Slots: '+JSON.stringify(active));
//console.log('Unique Addrs: '+JSON.stringify(unique)+"\n");

};