var PDF_QUALITY = 100;
var WAIT_MSEC_COMPLETE_HTTP_GET = 200;


urltopdf = function (url, file, onSuccess, onFail, onComplete) {
	var page = require('webpage').create();
	page.paperSize = { format: 'A4', orientation: 'portrait', margin: '2cm' };

	var callback = function (callable, arg) {
		if (typeof callable !== 'function') {
			return;
		}

		callable(arg);
	}
	
	page.open(url, function (status) {
		if (status === 'success') {
			window.setTimeout(function () {
				page.render(file, { quality: PDF_QUALITY });
				callback(onSuccess, url);
				callback(onComplete);
			}, WAIT_MSEC_COMPLETE_HTTP_GET);

		} else {
			callback(onFail, 'does not open ' + url);
		  callback(onComplete);
		}
	});
}

writeLog = function (title, message) {

	var colors = {
		'none': '\u001b[37m',
    'success': '\u001b[36m',
		'fail': '\u001b[31m',
		'abort': '\u001b[35m',
		'reset': '\u001b[0m'
	};

	console.log(
		(colors[title] ? colors[title] : colors['none']) + 
		title + 
		colors['reset'] + 
		' ' + 
		(message ? message : '')
	);
}

var system = require('system');
var arg = system.args[1];

paths = arg ? arg.split(' ') : [];

var i;
var urls = [];
var files = [];

for (i = 0; i < paths.length; i++) {
	if (i % 2 == 0) {
		urls.push(paths[i]);
	} else {
		files.push(paths[i]);
	}
}

if (!urls.length || urls.length != files.length) {
	writeLog('abort', 'Usage: urltopdf.js "http://url1 path/to/output1.pdf http://url2 path/to/output2.pdf ..."');
	phantom.exit(1);
}

var done = 0;

for (i = 0; i < urls.length; i++) {
	urltopdf(
		urls[i], 
		files[i],
		function (url) {
			writeLog('success', url);
		},
		function (error) {
			writeLog('fail', error);
			phantom.exit(1);
		},
		function () {
			done++;
			if (done >= urls.length) {
				phantom.exit(0);
			}
		}
	);
}

