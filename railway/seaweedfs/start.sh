#!/bin/sh
init() {
	buckets="fluxer fluxer-uploads fluxer-reports fluxer-harvests"
	for attempt in $(seq 1 120); do
		sleep 3
		nc -z 127.0.0.1 9333 2>/dev/null || continue
		listed=$(echo "s3.bucket.list" | timeout 10 weed shell -master=127.0.0.1:9333 2>&1)
		missing=""
		for b in $buckets; do
			echo "$listed" | grep -q "^[[:space:]]*$b[[:space:]]" || missing="$missing $b"
		done
		if [ -z "$missing" ]; then
			echo "s3.configure -user=fluxer -access_key=$FLUXER_S3_ACCESS_KEY -secret_key=$FLUXER_S3_SECRET_KEY -actions=Admin,Read,Write,List,Tagging -apply" \
				| timeout 10 weed shell -master=127.0.0.1:9333 >/dev/null 2>&1 && { echo "buckets ready"; return; }
			continue
		fi
		for b in $missing; do
			echo "s3.bucket.create -name $b" | timeout 10 weed shell -master=127.0.0.1:9333 >/dev/null 2>&1
		done
	done
	echo "seaweedfs init failed" >&2
}
init &
exec weed server -s3 -dir=/data -master.telemetry=false -ip.bind=0.0.0.0 -ip=seaweedfs
