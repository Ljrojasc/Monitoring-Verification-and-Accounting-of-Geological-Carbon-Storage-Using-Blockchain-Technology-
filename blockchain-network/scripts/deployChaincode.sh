. envVar.sh
. utils.sh

#------------------------------- 1. presetup ------------------------------------------------------------

# Presetup to install all the necessary dependencies to run the code 

presetup() {
    echo Installing npm packages ...
    pushd ../artifacts/chaincode/javascript
    npm install
    popd
    echo Finished installing npm dependencies
}

presetup

#------------------------------- 2. Package the chaincode  -----------------------------------------------

CHANNEL_NAME="laurachannel"
CC_RUNTIME_LANGUAGE="node"
VERSION="1"
SEQUENCE=1
CC_SRC_PATH="../artifacts/chaincode/javascript"
CC_NAME="ccschaincode"
CC_POLICY="OR('Org1MSP.peer','Org2MSP.peer','Org3MSP.peer','Org4MSP.peer','Org5MSP.peer','Org6MSP.peer')"

packageChaincode() {
    rm -rf ${CC_NAME}.tar.gz
    setGlobals 1
    peer lifecycle chaincode package ${CC_NAME}.tar.gz \
        --path ${CC_SRC_PATH} --lang ${CC_RUNTIME_LANGUAGE} \
        --label ${CC_NAME}_${VERSION}
    echo "===================== Chaincode is packaged ===================== "
}

packageChaincode

#------------------------------- 3. Install chaincode on peers  -------------------------------------------

# Install the chaincode on the peers 

installChaincode() {
    setGlobals 1
    peer lifecycle chaincode install ${CC_NAME}.tar.gz
    echo "===================== Chaincode is installed on peer0.org1 ===================== "

    setGlobals 2
    peer lifecycle chaincode install ${CC_NAME}.tar.gz
    echo "===================== Chaincode is installed on peer0.org2 ===================== "

    #Install the chaincode on the Org3
    setGlobals 3
    peer lifecycle chaincode install ${CC_NAME}.tar.gz
    echo "===================== Chaincode is installed on peer0.org3 ===================== "

    #Install the chaincode on the Org4
    setGlobals 4
    peer lifecycle chaincode install ${CC_NAME}.tar.gz
    echo "===================== Chaincode is installed on peer0.org4 ===================== "

    #Install the chaincode on the Org5
    setGlobals 5
    peer lifecycle chaincode install ${CC_NAME}.tar.gz
    echo "===================== Chaincode is installed on peer0.org5 ===================== "

    #Install the chaincode on the Org6
    setGlobals 6
    peer lifecycle chaincode install ${CC_NAME}.tar.gz
    echo "===================== Chaincode is installed on peer0.org6 ===================== "
}

installChaincode

#------------------------------- 4. QueryInstalled ---------------------------------------------------------

# QueryInstalled to validate wheather the chaincode is installed correctly or not it will query all installed chaincode on peers 
# The PackageID that outputs from this function is required to approve the chaincode  

queryInstalled() {
    setGlobals 1
    peer lifecycle chaincode queryinstalled >&log.txt
    cat log.txt
    PACKAGE_ID=$(sed -n "/${CC_NAME}_${VERSION}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
    echo PackageID is ${PACKAGE_ID}
    echo "===================== Query installed successful on peer0.org1 on channel ===================== "
}

queryInstalled

#------------------------------- 5. Approve Chaincode Org 1 ------------------------------------------------

# Chaincode Approval on Org1. We are using the peer binary, since we need the package ID we need the queryInstalled

approveForMyOrg1() {
    setGlobals 1
    set -x
    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com --tls \
        --signature-policy ${CC_POLICY} \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${VERSION} \
        --package-id ${PACKAGE_ID} \
        --sequence ${SEQUENCE}
    set +x

    echo "===================== chaincode approved from organization 1 ===================== "

}

queryInstalled
approveForMyOrg1

#------------------------------- 6. Check Chaincode's commit readiness Org 1 ------------------------------

# Check if the chaincode is ready to be committed on Organization 1 

checkCommitReadiness() {
    setGlobals 1
    peer lifecycle chaincode checkcommitreadiness \
        --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${VERSION} \
        --signature-policy ${CC_POLICY} \
        --sequence ${SEQUENCE} --output json
    echo "===================== checking commit readiness from organization 1 ===================== "
}

checkCommitReadiness

#------------------------------- 7. Approve Chaincode Org 2 ----------------------------------------------

# Chaincode Approval from Organization2. We are using the peer binary, since we need the package ID we need the queryInstalled

approveForMyOrg2() {
    setGlobals 2

    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com --tls $CORE_PEER_TLS_ENABLED \
        --signature-policy ${CC_POLICY} \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} \
        --version ${VERSION} --package-id ${PACKAGE_ID} \
        --sequence ${SEQUENCE}

    echo "===================== chaincode has been approved from organization 2 ===================== "
}

queryInstalled
approveForMyOrg2

#------------------------------- 8. Check Chaincode's commit readiness Org 2 -------------------------------

# Check if the chaincode is ready to be committed on Organization 2

checkCommitReadiness() {

    setGlobals 2
    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_ORG2_CA \
        --signature-policy ${CC_POLICY} \
        --name ${CC_NAME} --version ${VERSION} --sequence ${SEQUENCE} --output json
    echo "===================== checking commit readiness from organization 2 ===================== "
}

checkCommitReadiness

#------------------------------- 9. Approve Chaincode Org 3 New ----------------------------------------------

# Chaincode Approval from Organization3. We are using the peer binary, since we need the package ID we need the queryInstalled
#Keep the same port 7050 
approveForMyOrg3() {
    setGlobals 3

    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com --tls $CORE_PEER_TLS_ENABLED \
        --signature-policy ${CC_POLICY} \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} \
        --version ${VERSION} --package-id ${PACKAGE_ID} \
        --sequence ${SEQUENCE}

    echo "===================== chaincode has been approved from organization 3 ===================== "
}

queryInstalled
approveForMyOrg3

#------------------------------- 10. Check Chaincode's commit readiness Org 3 New -------------------------------

# Check if the chaincode is ready to be committed on Organization 3

checkCommitReadiness() {

    setGlobals 3
    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME \
        --peerAddresses localhost:11051 --tlsRootCertFiles $PEER0_ORG3_CA \
        --signature-policy ${CC_POLICY} \
        --name ${CC_NAME} --version ${VERSION} --sequence ${SEQUENCE} --output json
    echo "===================== checking commit readiness from organization 3 ===================== "
}

checkCommitReadiness

#------------------------------- 11. Approve Chaincode Org 4 New ----------------------------------------------

# Chaincode Approval from Organization3. We are using the peer binary, since we need the package ID we need the queryInstalled
#Keep the same port 7050 
approveForMyOrg4() {
    setGlobals 4

    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com --tls $CORE_PEER_TLS_ENABLED \
        --signature-policy ${CC_POLICY} \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} \
        --version ${VERSION} --package-id ${PACKAGE_ID} \
        --sequence ${SEQUENCE}

    echo "===================== chaincode has been approved from organization 4 ===================== "
}

queryInstalled
approveForMyOrg4

#------------------------------- 12. Check Chaincode's commit readiness Org 4 New -------------------------------

# Check if the chaincode is ready to be committed on Organization 4

checkCommitReadiness() {

    setGlobals 4
    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME \
        --peerAddresses localhost:13051 --tlsRootCertFiles $PEER0_ORG4_CA \
        --signature-policy ${CC_POLICY} \
        --name ${CC_NAME} --version ${VERSION} --sequence ${SEQUENCE} --output json
    echo "===================== checking commit readiness from organization 4 ===================== "
}

checkCommitReadiness

#------------------------------- 13. Approve Chaincode Org 5 New ----------------------------------------------

# Chaincode Approval from Organization3. We are using the peer binary, since we need the package ID we need the queryInstalled
#Keep the same port 7050 
approveForMyOrg5() {
    setGlobals 5

    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com --tls $CORE_PEER_TLS_ENABLED \
        --signature-policy ${CC_POLICY} \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} \
        --version ${VERSION} --package-id ${PACKAGE_ID} \
        --sequence ${SEQUENCE}

    echo "===================== chaincode has been approved from organization 5 ===================== "
}

queryInstalled
approveForMyOrg5

#------------------------------- 14. Check Chaincode's commit readiness Org 5 New -------------------------------

# Check if the chaincode is ready to be committed on Organization 5

checkCommitReadiness() {

    setGlobals 5
    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME \
        --peerAddresses localhost:15051 --tlsRootCertFiles $PEER0_ORG5_CA \
        --signature-policy ${CC_POLICY} \
        --name ${CC_NAME} --version ${VERSION} --sequence ${SEQUENCE} --output json
    echo "===================== checking commit readiness from organization 5 ===================== "
}

checkCommitReadiness

#------------------------------- 15. Approve Chaincode Org 5 New ----------------------------------------------

# Chaincode Approval from Organization6. We are using the peer binary, since we need the package ID we need the queryInstalled
#Keep the same port 7050 
approveForMyOrg6() {
    setGlobals 6

    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com --tls $CORE_PEER_TLS_ENABLED \
        --signature-policy ${CC_POLICY} \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} \
        --version ${VERSION} --package-id ${PACKAGE_ID} \
        --sequence ${SEQUENCE}

    echo "===================== chaincode has been approved from organization 6 ===================== "
}

queryInstalled
approveForMyOrg6

#------------------------------- 16. Check Chaincode's commit readiness Org 6 New -------------------------------

# Check if the chaincode is ready to be committed on Organization 6

checkCommitReadiness() {

    setGlobals 6
    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME \
        --peerAddresses localhost:17051 --tlsRootCertFiles $PEER0_ORG6_CA \
        --signature-policy ${CC_POLICY} \
        --name ${CC_NAME} --version ${VERSION} --sequence ${SEQUENCE} --output json
    echo "===================== checking commit readiness from organization 6 ===================== "
}

checkCommitReadiness

#------------------------------- 17. Commit Chincode on Channel ---------------------------------------------

commitChaincodeDefinition() {
    setGlobals 1
    peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
        --signature-policy ${CC_POLICY} \
        --channelID $CHANNEL_NAME --name ${CC_NAME} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_ORG1_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_ORG2_CA \
        --peerAddresses localhost:11051 --tlsRootCertFiles $PEER0_ORG3_CA \
        --peerAddresses localhost:13051 --tlsRootCertFiles $PEER0_ORG4_CA \
        --peerAddresses localhost:15051 --tlsRootCertFiles $PEER0_ORG5_CA \
        --peerAddresses localhost:17051 --tlsRootCertFiles $PEER0_ORG6_CA \
        --version ${VERSION} --sequence ${SEQUENCE} 
}

commitChaincodeDefinition

#------------------------------- 18. Veirfy Chaincode installation on Chanel -------------------------------

#Verify that the chaincode has been installed on the channel

queryCommitted() {
    setGlobals 5
    peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name ${CC_NAME}

}

queryCommitted

#------------------------------- 19. Invoke Chaincode -------------------------------------------------------

chaincodeInvoke() {
    setGlobals 1

    # Create an entry to then be able to query it by invoking the function CreateCaptureContract from ccschaincode
    peer chaincode invoke -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED \
        --cafile $ORDERER_CA \
        -C $CHANNEL_NAME -n ${CC_NAME}  \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_ORG1_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_ORG2_CA   \
        -c '{"function": "CreateCaptureContract","Args":["2", "{\"test\":\"data\"}"]}'

}

#chaincodeInvoke

#------------------------------- 20. Query Chaincode -------------------------------------------------------

chaincodeQuery() {
    setGlobals 1
    #To query the previous entry 
    peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"function": "getAssetByID","Args":["2"]}'
}

#chaincodeQuery

