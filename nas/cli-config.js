
/**
 * Command Line Configuration;
 * 
 * cli-config, will process a queue of command line configuration operations, and then return 
 * (via a callback) the resulting config object.
 * 
 * config queue:: an array of configuration operations.
 * configuration operation:: an array [string:variable name, string:prompt, [function:optional input parser]], if 
 * 		set the function parser should return the formatted value to be put into the config object
 * 		the function parser is passed 3 arguments, the input string, the config object, and the cli object which 
 * 		is a container for a number of simple functions that can be used to alter the flow of the proccessor.
 * 
 * cli object:: is passed as the third argument to each parser function, is not necessary to use this unless the flow must be stopped via cli.wait()
 * 		and resumed via cli.next() or cli.last() (to handle async operations) or to inject conditional operations via cli.insert([operation, ...]) 
 * 		inserted operations are proccesed imediately after the current operation.
 * 
 * the configuration queue can also contain (at any position) a function, these are executed like: fn(config, cli); and must call cli.next() to continue
 * 
 * 
 * @example: simple usage.
 * 
 * 	require('./cli-config').configure(
 * 		
 * 		//config queue
 * 		[['username', 'enter username: '], ['password', 'enter password: ']],
 * 		function(config){
 * 			//run something with config...
 * 			console.log(JSON.stringify(config)); //should print: {username:'...', password:'...'};
 * 		}
 *	);
 *
 *	//console:
 *	>enter username: bob
 *  >enter password: loblaw
 *  >
 *  
 * @example: simple usage with parser function.
 * 
 * 	require('./cli-config').configure(
 * 		
 * 		//config queue
 * 		[
 * 			[
 * 				//1: email prompt
 * 				'email', 'enter username or email: ', function(input, config, cli){
 * 					if(input.indexOf('@gmail.com')!=-1)return input;
 * 					return input+'@gmail.com'; 
 * 				}
 * 			], 
 * 			[
 * 				//2: password prompt
 * 				'password', 'enter password: '
 * 			], 
 * 
 * 			...
 *		],
 * 		function(config){
 * 			//run something with config...
 * 			console.log(JSON.stringify(config)); //should print: {email:'...', password:'...'};
 * 		}
 *	);
 *
 *	//console:
 *	>enter username or email: bob
 *  >enter password: loblaw
 *  >  
 * 
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





function configure(config, steps, fn){
	config=config;
	wait=false;
	dialog=steps;
	callback=fn;
	next();
	
}

module.exports = {
		configure: configure
}