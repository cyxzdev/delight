#!/usr/bin/env bash
# Runs every service, restarting any that exits.
keep() {
	local name=$1; shift
	while true; do
		env "$@"
		echo "[$name] exited ($?), restarting in 3s" >&2
		sleep 3
	done &
}
port=8090
for svc in snowflakes users gifs messages unfurl; do
	keep "$svc-router" FLUXER_SVC_NAME=$svc FLUXER_SVC_MODE=router FLUXER_SVC_PORT=$port /usr/local/bin/fluxer-$svc
	port=$((port + 1))
	keep "$svc-shard" FLUXER_SVC_NAME=$svc FLUXER_SVC_MODE=shard FLUXER_SVC_SHARD_ID=0 FLUXER_SVC_PORT=$port /usr/local/bin/fluxer-$svc
	port=$((port + 1))
done
keep push /usr/local/bin/fluxer-push
wait
