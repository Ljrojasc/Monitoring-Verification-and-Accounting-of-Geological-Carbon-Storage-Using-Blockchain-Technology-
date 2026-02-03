#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

# This is a collection of bash functions used by different scripts

# imports
. utils.sh


export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${PWD}/../artifacts/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
export PEER0_ORG1_CA=${PWD}/../artifacts/channel/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export PEER0_ORG2_CA=${PWD}/../artifacts/channel/crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export PEER0_ORG3_CA=${PWD}/../artifacts/channel/crypto-config/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt #Add this
export PEER0_ORG4_CA=${PWD}/../artifacts/channel/crypto-config/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/tls/ca.crt #Add this
export PEER0_ORG5_CA=${PWD}/../artifacts/channel/crypto-config/peerOrganizations/org5.example.com/peers/peer0.org5.example.com/tls/ca.crt #Add this
export PEER0_ORG6_CA=${PWD}/../artifacts/channel/crypto-config/peerOrganizations/org6.example.com/peers/peer0.org6.example.com/tls/ca.crt #Add this


export FABRIC_CFG_PATH=${PWD}/../artifacts/channel/config/


export ORDERER_ADMIN_TLS_SIGN_CERT=${PWD}/../artifacts/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.crt
export ORDERER_ADMIN_TLS_PRIVATE_KEY=${PWD}/../artifacts/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.key

export ORDERER2_ADMIN_TLS_SIGN_CERT=${PWD}/../artifacts/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/server.crt
export ORDERER2_ADMIN_TLS_PRIVATE_KEY=${PWD}/../artifacts/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/server.key

export ORDERER3_ADMIN_TLS_SIGN_CERT=${PWD}/../artifacts/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/server.crt
export ORDERER3_ADMIN_TLS_PRIVATE_KEY=${PWD}/../artifacts/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/server.key

export ORDERER4_ADMIN_TLS_SIGN_CERT=${PWD}/../artifacts/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/tls/server.crt
export ORDERER4_ADMIN_TLS_PRIVATE_KEY=${PWD}/../artifacts/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/tls/server.key

export ORDERER5_ADMIN_TLS_SIGN_CERT=${PWD}/../artifacts/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com/tls/server.crt
export ORDERER5_ADMIN_TLS_PRIVATE_KEY=${PWD}/../artifacts/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com/tls/server.key

export ORDERER6_ADMIN_TLS_SIGN_CERT=${PWD}/../artifacts/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer6.example.com/tls/server.crt
export ORDERER6_ADMIN_TLS_PRIVATE_KEY=${PWD}/../artifacts/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer6.example.com/tls/server.key

# Set environment variables for the peer org
setGlobals() {
  local USING_ORG=""
  if [ -z "$OVERRIDE_ORG" ]; then
    USING_ORG=$1
  else
    USING_ORG="${OVERRIDE_ORG}"
  fi
  infoln "Using organization ${USING_ORG}"
  if [ $USING_ORG -eq 1 ]; then
    export CORE_PEER_LOCALMSPID="Org1MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG1_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/../artifacts/channel/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
  elif [ $USING_ORG -eq 2 ]; then
    export CORE_PEER_LOCALMSPID="Org2MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG2_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/../artifacts/channel/crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
    export CORE_PEER_ADDRESS=localhost:9051

  #Added new orgs
  elif [ $USING_ORG -eq 3 ]; then
    export CORE_PEER_LOCALMSPID="Org3MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG3_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/../artifacts/channel/crypto-config/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp
    export CORE_PEER_ADDRESS=localhost:11051
  
  elif [ $USING_ORG -eq 4 ]; then
    export CORE_PEER_LOCALMSPID="Org4MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG4_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/../artifacts/channel/crypto-config/peerOrganizations/org4.example.com/users/Admin@org4.example.com/msp
    export CORE_PEER_ADDRESS=localhost:13051

  elif [ $USING_ORG -eq 5 ]; then
    export CORE_PEER_LOCALMSPID="Org5MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG5_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/../artifacts/channel/crypto-config/peerOrganizations/org5.example.com/users/Admin@org5.example.com/msp
    export CORE_PEER_ADDRESS=localhost:15051
  
  elif [ $USING_ORG -eq 6 ]; then
    export CORE_PEER_LOCALMSPID="Org6MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG6_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/../artifacts/channel/crypto-config/peerOrganizations/org6.example.com/users/Admin@org6.example.com/msp
    export CORE_PEER_ADDRESS=localhost:17051


  else
    errorln "ORG Unknown"
  fi

  if [ "$VERBOSE" == "true" ]; then
    env | grep CORE
  fi
}

# Set environment variables for use in the CLI container
setGlobalsCLI() {
  setGlobals $1

  local USING_ORG=""
  if [ -z "$OVERRIDE_ORG" ]; then
    USING_ORG=$1
  else
    USING_ORG="${OVERRIDE_ORG}"
  fi
  if [ $USING_ORG -eq 1 ]; then
    export CORE_PEER_ADDRESS=peer0.org1.example.com:7051
  elif [ $USING_ORG -eq 2 ]; then
    export CORE_PEER_ADDRESS=peer0.org2.example.com:9051
  elif [ $USING_ORG -eq 3 ]; then
    export CORE_PEER_ADDRESS=peer0.org3.example.com:11051 #Added line
  elif [ $USING_ORG -eq 4 ]; then
    export CORE_PEER_ADDRESS=peer0.org4.example.com:13051 #Added line
  elif [ $USING_ORG -eq 5 ]; then
    export CORE_PEER_ADDRESS=peer0.org5.example.com:15051 #Added line
  elif [ $USING_ORG -eq 6 ]; then
    export CORE_PEER_ADDRESS=peer0.org6.example.com:17051 #Added line
  else
    errorln "ORG Unknown"
  fi
}

# parsePeerConnectionParameters $@
# Helper function that sets the peer connection parameters for a chaincode
# operation
parsePeerConnectionParameters() {
  PEER_CONN_PARMS=()
  PEERS=""
  while [ "$#" -gt 0 ]; do
    setGlobals $1
    PEER="peer0.org$1"
    ## Set peer addresses
    if [ -z "$PEERS" ]
    then
	PEERS="$PEER"
    else
	PEERS="$PEERS $PEER"
    fi
    PEER_CONN_PARMS=("${PEER_CONN_PARMS[@]}" --peerAddresses $CORE_PEER_ADDRESS)
    ## Set path to TLS certificate
    CA=PEER0_ORG$1_CA
    TLSINFO=(--tlsRootCertFiles "${!CA}")
    PEER_CONN_PARMS=("${PEER_CONN_PARMS[@]}" "${TLSINFO[@]}")
    # shift by one to get to the next organization
    shift
  done
}

verifyResult() {
  if [ $1 -ne 0 ]; then
    fatalln "$2"
  fi
}
