# Run this script to start the Blockchain Network, create channel, and deploy chaincode. Uncomment parts.

#------------------------- 1. Create Certificate authorities for all organizations --------------

#docker-compose -f ../artifacts/channel/create-certificate-with-ca/docker-compose.yaml up -d

# Note: We are considering, we already created all participants certificates. If not (when it's the first time creating the network, I have to run the ./create-certificate-with-ca.sh script)

#------------------------- 2. Create Artifacts --------------------------------------------------

#cd ../artifacts/channel/ && ./create-artifacts.sh
#cd ..

#------------------------- 3. Run all the services: Peer, Orderer, CouchDB ----------------------

#docker-compose -f ../artifacts/docker-compose.yaml up -d
#cd ../scripts

#------------------------- 4. Create the Channel ------------------------------------------------

./createChannel.sh

#------------------------- 5. Deploy the chaincode ----------------------------------------------

./deployChaincode.sh