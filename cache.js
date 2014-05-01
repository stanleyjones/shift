var request = require('request'),
	fs = require('fs'),
	api_base = 'https://www.googleapis.com/fusiontables/v1/query?sql=SELECT * FROM ',
	api_query = " WHERE visible LIKE 'true'",
	api_key = '&key=AIzaSyAxIxiJR_hGp8eoCsadSvloPYwbEaaGYDo',
	intl_doc_id = '11LbrREUUc9xrYjsuU0_nFiVMmiQdKUi6TRqL5aXJ',
	ntnl_doci_id = '{{NTNL_TABLE_ID}}',
	data_dir = 'app/data/';

console.log('Downloading international subsidies...');
request(api_base + intl_doc_id + api_query + api_key)
	.pipe(fs.createWriteStream(data_dir + 'intl.json'));

/*
console.log('Downloading national subsidies...');
request(api_base + intl_doc_id + api_key)
	.pipe(fs.createWriteStream(data_dir + 'ntnl.json'));
*/