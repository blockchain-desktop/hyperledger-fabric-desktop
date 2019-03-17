FROM hyperledger/fabric-orderer:1.3.0
RUN apt-get update && apt-get install -y netcat jq && apt-get install -y curl && rm -rf /var/cache/apt
RUN curl -o /tmp/fabric-ca-client.tar.gz https://nexus.hyperledger.org/content/repositories/releases/org/hyperledger/fabric-ca/hyperledger-fabric-ca/linux-amd64-1.3.0/hyperledger-fabric-ca-linux-amd64-1.3.0.tar.gz && tar -xzvf /tmp/fabric-ca-client.tar.gz -C /tmp && cp /tmp/bin/fabric-ca-client /usr/local/bin
RUN chmod +x /usr/local/bin/fabric-ca-client
ARG FABRIC_CA_DYNAMIC_LINK=false
RUN if [ "\$FABRIC_CA_DYNAMIC_LINK" = "true" ]; then apt-get install -y libltdl-dev; fi
