'use strict';

var request = require('request'),
	fs = require('fs'),

	APIBase = 'https://www.googleapis.com/fusiontables/v1/query?sql=SELECT * FROM ',
	APIQuery = ' WHERE visible LIKE \'true\'',
	APIChunkSize = 300, // Should be at least 10% of total Intl subsidies
	APIKey = '&key=AIzaSyAxIxiJR_hGp8eoCsadSvloPYwbEaaGYDo',

	IntlDocID = '1pDDzy5h4foOxCrS7VoUGELh0EPaS9VyaGTKfgd-e',
	NtnlDocID = '1k52U4eIocmwCSqKWLih2cpZMcpk4Q0x4ifAeCOD8',

	DataDir = 'app/data/';

function status (err) {
	if (!err) { console.log('Done.'); }
	else { console.log(err.msg); }
}

console.log('Downloading international subsidies...');
for (var i = 0; i < 10; i++) { // Slice into 10 files
	var APIChunk = ' OFFSET ' + (i * APIChunkSize) + ' LIMIT ' + APIChunkSize;
	request(APIBase + IntlDocID + APIQuery + APIChunk + APIKey, status)
		.pipe(fs.createWriteStream(DataDir + 'intl' + i + '.json'));
}

console.log('Downloading national subsidies...');
request(APIBase + NtnlDocID + APIKey, status)
	.pipe(fs.createWriteStream(DataDir + 'ntnl.json'));