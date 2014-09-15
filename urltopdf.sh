#!/bin/sh

command_exists()
{
	if [ ! `\command -v $1` ]; then
		echo "Abort. $1 is required."
		return 1
	fi

	return 0
}

readable()
{
	if [ ! -r $1 ]; then
		echo "Abort. $1 is not readable or not exists."
		return 1
	fi

	return 0
}

rtrim()
{
	echo `echo $1 | sed -e 's/ $//'`
}

command_exists phantomjs

if [ $? -ne 0 ]; then
	exit
fi

command_exists pdftk

if [ $? -ne 0 ]; then
	exit
fi

readable urltopdf.js

if [ $? -ne 0 ]; then
	exit
fi

if [ $# -eq 0 ]; then
	echo "Usage: urltopdf.sh http://url1 http://url2 path/to/output.pdf"
	exit
fi

cd `dirname $0`

URLS=""
PDFS=""
OUTPUT=`eval echo '$'$#`
DIR=`dirname ${OUTPUT}`
no=0
max=`expr $# - 1`

for arg in $@
do
	if [ ${no} -ne ${max} ]; then
		URLS="${URLS}${arg} ${DIR}/${no}.pdf "
		PDFS="${PDFS}${DIR}/${no}.pdf "
	fi

	no=`expr ${no} + 1`
done

URLS=`rtrim "${URLS}"`
PDFS=`rtrim "${PDFS}"`

echo "Converting HTML to PDF ..."

/usr/bin/env phantomjs urltopdf.js "${URLS}"

if [ $? -ne 0 ]; then
	exit
fi

echo "Merging each PDF ..."

/usr/bin/env pdftk ${PDFS} cat output ${OUTPUT} 

echo "Deleting each PDF ..."

rm ${PDFS} 

CYAN="\033[0;36m"
RESET="\033[0;39m"
echo -e "${CYAN}${OUTPUT}${RESET} has been created." 


