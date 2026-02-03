#!/bin/bash

# Import of needed files 
. envVar.sh
. utils.sh

CHANNEL_NAME='laurachannel'

#Osnadmin is the binary used to join the channels for the oderers 
#Provide the path of the genesis block we created 
#The code is joining the oderers 


#osnadmin channel join → join orderers to the channel
createChannel(){
    setGlobals 1
    osnadmin channel join --channelID $CHANNEL_NAME \
    --config-block ../channel-artifacts/${CHANNEL_NAME}.block -o localhost:7053 \
    --ca-file $ORDERER_CA \
    --client-cert $ORDERER_ADMIN_TLS_SIGN_CERT \
    --client-key $ORDERER_ADMIN_TLS_PRIVATE_KEY 

    setGlobals 1
    osnadmin channel join --channelID $CHANNEL_NAME \
    --config-block ../channel-artifacts/${CHANNEL_NAME}.block -o localhost:8053 \
    --ca-file $ORDERER_CA \
    --client-cert $ORDERER2_ADMIN_TLS_SIGN_CERT \
    --client-key $ORDERER2_ADMIN_TLS_PRIVATE_KEY 

    setGlobals 1
    osnadmin channel join --channelID $CHANNEL_NAME \
    --config-block ../channel-artifacts/${CHANNEL_NAME}.block -o localhost:9053 \
    --ca-file $ORDERER_CA \
    --client-cert $ORDERER3_ADMIN_TLS_SIGN_CERT \
    --client-key $ORDERER3_ADMIN_TLS_PRIVATE_KEY 

    setGlobals 1
    osnadmin channel join --channelID $CHANNEL_NAME \
    --config-block ../channel-artifacts/${CHANNEL_NAME}.block -o localhost:11053 \
    --ca-file $ORDERER_CA \
    --client-cert $ORDERER4_ADMIN_TLS_SIGN_CERT \
    --client-key $ORDERER4_ADMIN_TLS_PRIVATE_KEY 

    setGlobals 1
    osnadmin channel join --channelID $CHANNEL_NAME \
    --config-block ../channel-artifacts/${CHANNEL_NAME}.block -o localhost:12053 \
    --ca-file $ORDERER_CA \
    --client-cert $ORDERER5_ADMIN_TLS_SIGN_CERT \
    --client-key $ORDERER5_ADMIN_TLS_PRIVATE_KEY 

    setGlobals 1
    osnadmin channel join --channelID $CHANNEL_NAME \
    --config-block ../channel-artifacts/${CHANNEL_NAME}.block -o localhost:13053 \
    --ca-file $ORDERER_CA \
    --client-cert $ORDERER6_ADMIN_TLS_SIGN_CERT \
    --client-key $ORDERER6_ADMIN_TLS_PRIVATE_KEY 

}

createChannel

sleep 3

#peer channel join → join peers (orgs) to the channel

joinChannel(){
    sleep 2
    FABRIC_CFG_PATH=$PWD/../artifacts/channel/config
    
    setGlobals 1
    peer channel join -b ../channel-artifacts/${CHANNEL_NAME}.block

    sleep 2
    
    setGlobals 2
    peer channel join -b ../channel-artifacts/${CHANNEL_NAME}.block

    setGlobals 3
    peer channel join -b ../channel-artifacts/${CHANNEL_NAME}.block #added this

    setGlobals 4
    peer channel join -b ../channel-artifacts/${CHANNEL_NAME}.block #added this

    setGlobals 5
    peer channel join -b ../channel-artifacts/${CHANNEL_NAME}.block #added this

    setGlobals 6
    peer channel join -b ../channel-artifacts/${CHANNEL_NAME}.block #added this
    
}

joinChannel


# createChannel
# joinChannel
# setAnchorPeer