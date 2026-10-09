# SeaweedFS (S3) that creates Fluxer's buckets and S3 identity on start.
FROM chrislusf/seaweedfs:4.47
COPY railway/seaweedfs/start.sh /start.sh
ENTRYPOINT ["/bin/sh", "/start.sh"]
