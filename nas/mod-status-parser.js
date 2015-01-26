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

var methods=[];
var urls=[];
var protocols=[];

var active=[];	
var unique=[];

var tables=page.split('<table'); tables.shift();

var rows=tables[0].split('<tr>'); rows.shift(); //discard first

rows.forEach(function(r, i){
	if(i==0)return; //skip header
	var row=r.split('</tr>')[0];
	var tdatas=row.split('<td'); tdatas.shift();
	
//console.log(r.split('</tr>')[0]);
	
	//set this to true to print the first array of entry sections
	var tdPrintExit=false;
	if(tdPrintExit&&i==1){
		
		tdatas.forEach(function(t,i){
			console.log(i+': '+t);
		});
		process.exit(0);	
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
	
	var request=tdatas[12].split('</td>')[0].split('nowrap>').pop().split(' ');
	var method=request[0];
	var url=request[1];
	var protocol=request[2];

	methods.push(method);
	urls.push(url);
	protocols.push(protocol);
	
	//console.log(mode+' '+modeTable[mode]);	
			
		
		
	//}
	
});



var uniqueActiveIps=[];
var uniqueIps=[];
modes.forEach(function(m,i){
	
	var ip=ips[i];
	if(uniqueIps.indexOf(ip)==-1)uniqueIps.push(ip);

	if((['reading', 'writing']).indexOf(m)==-1)return;
	active.push(i);
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
	var activeSlots=[];
	var activeHosts=[];
	is.forEach(function(i){
		var host=hosts[i];
		if((['reading', 'writing']).indexOf(modes[i])>=0){
			activeSlots.push(i);
			activeHosts.push(host);
		}
		if(h.indexOf(host)==-1)h.push(host);
	})
	var object={ip:ip, active_slot_indexes:activeSlots, active_slot_hosts:activeHosts,unique_host_names:h, total_slots_count:is.length};
	
	//console.log(JSON.stringify(object));
	
});

return {
	slot_addresses:ips, 
	slot_host_names:hosts,
	slot_methods:methods,
	slot_urls:urls,
	slot_protocols:protocols,
	slot_modes:modes,
	active_slot_indexes:active, 
	unique_active_ips:uniqueActiveIps,
	unique_ips:uniqueIps
	
	
	
}

//console.log('Active Slots: '+JSON.stringify(active));
//console.log('Unique Addrs: '+JSON.stringify(unique)+"\n");

};
