'use strict';

var request = require('request'),
	fs = require('fs'),
	APIBase = 'https://www.googleapis.com/fusiontables/v1/query?sql=SELECT * FROM ',
	APIQuery = ' WHERE visible LIKE \'true\'',
	APIKey = '&key=AIzaSyAxIxiJR_hGp8eoCsadSvloPYwbEaaGYDo',
	IntlDocID = '1j5id7wwoBPUV8timpBggyxCNaY2wNdyP8V9EZ91j',
	NtnlDocID = '1k52U4eIocmwCSqKWLih2cpZMcpk4Q0x4ifAeCOD8',
	DataDir = 'app/data/';

console.log('Downloading international subsidies...');
request(APIBase + IntlDocID + APIQuery + APIKey, status)
	.pipe(fs.createWriteStream(DataDir + 'intl.json'));

console.log('Downloading national subsidies...');
request(APIBase + NtnlDocID + APIKey, status)
	.pipe(fs.createWriteStream(DataDir + 'ntnl.json'));

function status (err) {
	if (!err) { console.log('Done.'); }
	else { console.log(err.msg); }
}