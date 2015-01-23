
/**
 * cli, will process a queue of config operations, finally calling the callback function with the config object.
 * a config queue is an array of config operations.
 * a config operation is an array with entries, [0] a variable name, [1] a string prompt, and optionally [3] a function parser which should return the formatted value 
 */



var config={};
var dialog=null;
var wait;
var current;
var callback;


var listener=function (data) {
	var text=data.toString();
	var value=text.substring(0,text.length-1);
	console.log(current[0]+'=>'+current.length+': '+(typeof current[2]));
	if(current.length==3&&(typeof current[2])=='function'){
		//use function to parse response, it can also insert additional dialog steps
		config[current[0]]=current[2](value, config, cli);
	}else{
		//use response as value
		config[current[0]]=value;
		
	}
	console.log('set ['+current[0]+']='+config[current[0]]);
	if(!wait)next();
};

var next=function(){
	wait=false;
	if(dialog.length){
		current=dialog.shift();
		if((typeof current)=='function'){
			current(config, cli);
		}else{
			process.stdin.once('data', listener);
			process.stdout.write(current[1]);
		}
				
	}else{
		if(callback)callback(config);
	}
};

var last=function(){
	dialog=([current]).concat(dialog);
	next();
}

var wait=function(){
	wait=true;
};

var insert=function(array){
	dialog=array.slice(0).concat(dialog);
};

var cli={
		next:next,
		last:last,
		//if a function calls wait(), then it must eventually call next()
		wait:wait,
		insert:insert
}





function configure(steps, fn){
	config={};
	wait=false;
	dialog=steps;
	callback=fn;
	next();
	
}

module.exports = {
		configure: configure;
}