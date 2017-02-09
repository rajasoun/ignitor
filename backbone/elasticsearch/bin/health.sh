#!/bin/ash
loge() {
    printf "[ERR] health.sh: %s\n" "$@"
}
logw() {
    printf "[WARN] health.sh: %s\n" "$@"
}

set -o pipefail

ES_STATUS=$(curl --connect-timeout 1 --fail -LsS  "http://$(hostname -i):9200/_cat/health" 2>&1 | awk '{print $4}')

#ES_STATUS=$(curl --connect-timeout 1 --fail -LsS  "http://$(hostname -i):9200/_cluster/health?wait_for_status=yellow&timeout=5s" 2>&1|jq -cre '.status')

#printf "$ES_STATUS\n"

case "$ES_STATUS" in
	green  ) exit 0;;
	yellow ) exit 0;;
	red | *) exit 1;;
esac



#CURLEXIT=$(curl --connect-timeout 1 --fail -LsS -o /dev/null "http://$(hostname -i):9200" 2>&1 |awk '{print $8}')

#if [ $? -eq 0 ]; then
#	exit 0
#elif [ "$CURLEXIT" = '503' ]; then
#	logw 'Warning'
#	exit 0
#else
#	loge 'Critical'
#	exit 1
#fi

