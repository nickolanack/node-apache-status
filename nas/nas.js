

var child=require('child_process').spawn();
child.exec('httpd -t -D DUMP_VHOSTS', function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
});