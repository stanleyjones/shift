#! /bin/bash

# CONSTANTS

URL="https://www.googleapis.com/fusiontables/v1/query"
INTL_ID="1pDDzy5h4foOxCrS7VoUGELh0EPaS9VyaGTKfgd-e"
NTNL_ID="1k52U4eIocmwCSqKWLih2cpZMcpk4Q0x4ifAeCOD8"
KEY="AIzaSyAxIxiJR_hGp8eoCsadSvloPYwbEaaGYDo"

DIR="app/data"

CHUNK=300
CHUNKS=10

# GET INTL DATA

echo "Getting International Data"
while [ $CHUNKS -gt 0 ]; do
	let CHUNKS-=1
	let OFFSET=$CHUNKS*$CHUNK
	QUERY="SELECT * FROM $INTL_ID WHERE visible LIKE 'true' OFFSET $OFFSET LIMIT $CHUNK"
	FILE="$DIR/intl$CHUNKS.json"
	curl -# -G --data-urlencode "sql=$QUERY" --data-urlencode "key=$KEY" $URL -o $FILE
done

# GET NTNL DATA

echo "Getting National Data"
QUERY="SELECT * FROM $NTNL_ID"
FILE="$DIR/ntnl.json"
curl -# -G --data-urlencode "sql=$QUERY" --data-urlencode "key=$KEY" $URL -o $FILE