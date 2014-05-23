var request = require('request'),
	fs = require('fs'),
	api_base = 'https://www.googleapis.com/fusiontables/v1/query?sql=SELECT * FROM ',
	api_query = " WHERE visible LIKE 'true'",
	api_key = '&key=AIzaSyAxIxiJR_hGp8eoCsadSvloPYwbEaaGYDo',
	intl_doc_id = '1j5id7wwoBPUV8timpBggyxCNaY2wNdyP8V9EZ91j',
	ntnl_doc_id = '1k52U4eIocmwCSqKWLih2cpZMcpk4Q0x4ifAeCOD8',
	data_dir = 'app/data/';

console.log('Downloading international subsidies...');
request(api_base + intl_doc_id + api_query + api_key, status)
	.pipe(fs.createWriteStream(data_dir + 'intl.json'));


console.log('Downloading national subsidies...');
request(api_base + ntnl_doc_id + api_key, status)
	.pipe(fs.createWriteStream(data_dir + 'ntnl.json'));

function status (err, msg, res) {
	if (!err) { console.log('Done.'); }
	else { console.log(err.msg); }
}