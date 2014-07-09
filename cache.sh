#! /bin/bash

# CONSTANTS

URL="https://www.googleapis.com/fusiontables/v1/query"
INTL_ID="1pDDzy5h4foOxCrS7VoUGELh0EPaS9VyaGTKfgd-e"
NTNL_ID="1k52U4eIocmwCSqKWLih2cpZMcpk4Q0x4ifAeCOD8"
KEY="AIzaSyAxIxiJR_hGp8eoCsadSvloPYwbEaaGYDo"

DIR="app/data"

CHUNK=300
CHUNKS=10

KEEP=7

BOLD="\033[1m"
NORMAL="\033[0m"

# GET INTL DATA

echo -en "${BOLD}UPDATE${NORMAL} international JSON"
while [ $CHUNKS -gt 0 ]; do
	let CHUNKS-=1
	let OFFSET=$CHUNKS*$CHUNK
	QUERY="SELECT * FROM $INTL_ID WHERE visible LIKE 'true' OFFSET $OFFSET LIMIT $CHUNK"
	FILE="$DIR/intl$CHUNKS.json"
	curl -sS -G --data-urlencode "sql=$QUERY" --data-urlencode "key=$KEY" $URL -o $FILE
	echo -ne "."
done
echo -e "${BOLD} ✔︎${NORMAL}"

# GET NTNL DATA

echo -en "${BOLD}UPDATE${NORMAL} national JSON"
	QUERY="SELECT * FROM $NTNL_ID"
	FILE="$DIR/ntnl.json"
	curl -sS -G --data-urlencode "sql=$QUERY" --data-urlencode "key=$KEY" $URL -o $FILE
echo -e "${BOLD} ✔︎${NORMAL}"

# BACKUP / ROTATE ARCHIVES

function rotate {
	FILE=$1
	QUERY=$2

	I=$KEEP
	until [ $I -lt 0 ]; do
		I_FILE="$FILE.$I"
		if [ $I -eq $KEEP ] && [ -f $I_FILE ]; then
			# echo -e "${BOLD} RM${NORMAL} $I_FILE"
			rm $I_FILE
		fi
		if [ -f $I_FILE ]; then
			let J=$I+1
			J_FILE="$FILE.$J"
			# echo -e "${BOLD} MV${NORMAL} $I_FILE $J_FILE"
			mv $I_FILE $J_FILE
		fi
		if [ $I -eq 0 ] && [ -f $FILE ]; then
			# echo -e "${BOLD} MV${NORMAL} $FILE $I_FILE"
			mv $FILE $I_FILE
		fi
		let I-=1
	done
	curl -sS -G --data-urlencode "sql=$QUERY" --data-urlencode "key=$KEY" --data-urlencode "alt=csv" $URL -o $FILE
}

echo -en "${BOLD}ROTATE${NORMAL} international CSV"
	QUERY="SELECT * FROM $INTL_ID"
	FILE="$DIR/backups/intl.csv"
	rotate $FILE $QUERY
echo -e "${BOLD} ✔︎${NORMAL}"

echo -en "${BOLD}ROTATE${NORMAL} national CSV"
	QUERY="SELECT * FROM $NTNL_ID"
	FILE="$DIR/backups/ntnl.csv"
	rotate $FILE $QUERY
echo -e "${BOLD} ✔︎${NORMAL}"

exit