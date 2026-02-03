#!/bin/bash

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        ./ccp-template.json
}

function yaml_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        ./ccp-template.yaml | sed -e $'s/\\\\n/\\\n          /g'
}

ORG=1
P0PORT=7051
CAPORT=7054
PEERPEM=/home/srg/Documents/fabric-samples/MVA_for_CCS_Blockchain_new/blockchain-network/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/tlscacerts/tls-localhost-7054-ca-org1-example-com.pem
CAPEM=/home/srg/Documents/fabric-samples/MVA_for_CCS_Blockchain_new/blockchain-network/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/msp/tlscacerts/ca.crt

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM )" > connection-org1.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > /home/srg/Documents/fabric-samples/MVA_for_CCS_Blockchain_new/blockchain-network/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/connection-org1.yaml


ORG=2
P0PORT=9051
CAPORT=8054
PEERPEM=/home/srg/Documents/fabric-samples/MVA_for_CCS_Blockchain_new/blockchain-network/artifacts/channel/crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/tlscacerts/tls-localhost-8054-ca-org2-example-com.pem
CAPEM=/home/srg/Documents/fabric-samples/MVA_for_CCS_Blockchain_new/blockchain-network/artifacts/channel/crypto-config/peerOrganizations/org2.example.com/msp/tlscacerts/ca.crt

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > connection-org2.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > /home/srg/Documents/fabric-samples/MVA_for_CCS_Blockchain_new/blockchain-network/artifacts/channel/crypto-config/peerOrganizations/org2.example.com/connection-org2.yaml


ORG=3
P0PORT=11051
CAPORT=10054
PEERPEM=/home/srg/Documents/fabric-samples/MVA_for_CCS_Blockchain_new/blockchain-network/artifacts/channel/crypto-config/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/tlscacerts/tls-localhost-10054-ca-org3-example-com.pem
CAPEM=/home/srg/Documents/fabric-samples/MVA_for_CCS_Blockchain_new/blockchain-network/artifacts/channel/crypto-config/peerOrganizations/org3.example.com/msp/tlscacerts/ca.crt

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > connection-org3.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > /home/srg/Documents/fabric-samples/MVA_for_CCS_Blockchain_new/blockchain-network/artifacts/channel/crypto-config/peerOrganizations/org3.example.com/connection-org3.yaml


ORG=4
P0PORT=13051
CAPORT=11054
PEERPEM=/home/srg/Documents/fabric-samples/MVA_for_CCS_Blockchain_new/blockchain-network/artifacts/channel/crypto-config/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/tls/tlscacerts/tls-localhost-11054-ca-org4-example-com.pem
CAPEM=/home/srg/Documents/fabric-samples/MVA_for_CCS_Blockchain_new/blockchain-network/artifacts/channel/crypto-config/peerOrganizations/org4.example.com/msp/tlscacerts/ca.crt

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > connection-org4.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > /home/srg/Documents/fabric-samples/MVA_for_CCS_Blockchain_new/blockchain-network/artifacts/channel/crypto-config/peerOrganizations/org4.example.com/connection-org4.yaml


ORG=5
P0PORT=15051
CAPORT=12054
PEERPEM=/home/srg/Documents/fabric-samples/MVA_for_CCS_Blockchain_new/blockchain-network/artifacts/channel/crypto-config/peerOrganizations/org5.example.com/peers/peer0.org5.example.com/tls/tlscacerts/tls-localhost-12054-ca-org5-example-com.pem
CAPEM=/home/srg/Documents/fabric-samples/MVA_for_CCS_Blockchain_new/blockchain-network/artifacts/channel/crypto-config/peerOrganizations/org5.example.com/msp/tlscacerts/ca.crt

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > connection-org5.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > /home/srg/Documents/fabric-samples/MVA_for_CCS_Blockchain_new/blockchain-network/artifacts/channel/crypto-config/peerOrganizations/org5.example.com/connection-org5.yaml


ORG=6
P0PORT=17051
CAPORT=13054
PEERPEM=/home/srg/Documents/fabric-samples/MVA_for_CCS_Blockchain_new/blockchain-network/artifacts/channel/crypto-config/peerOrganizations/org6.example.com/peers/peer0.org6.example.com/tls/tlscacerts/tls-localhost-13054-ca-org6-example-com.pem
CAPEM=/home/srg/Documents/fabric-samples/MVA_for_CCS_Blockchain_new/blockchain-network/artifacts/channel/crypto-config/peerOrganizations/org6.example.com/msp/tlscacerts/ca.crt

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > connection-org6.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > /home/srg/Documents/fabric-samples/MVA_for_CCS_Blockchain_new/blockchain-network/artifacts/channel/crypto-config/peerOrganizations/org6.example.com/connection-org6.yaml