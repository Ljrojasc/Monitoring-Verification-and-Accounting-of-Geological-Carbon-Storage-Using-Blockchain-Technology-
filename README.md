# Blockchain for Carbon Monitoring Verifying and Accounting in CCS

# FIRST: Steps to bring up the Network and deploy the chaincode 

1. Make sure you have the requirements to run Hyper Ledger Fabric. Install fabric-samples folder from Hyperledger Fabric
2. Paste the blockchain-network, and api folders in the fabric-samples folder
3. Go to the folder/blockchain/scripts folder and type: ./Stop.sh
4. Go to the bin folder located in /fabric-samples/bin and export the paths: PATH=$PATH:/xxxx/xxxx/fabric-samples/bin

To check if the fabric-ca-client is installed, type in terminal: which fabric-ca-client 

5. Go to the /blockchain/scripts folder and type: ./Start.sh to start the network.

To run the script ./Start.sh you have to uncomment each step and the run the script one by one. 
Note: Don't run the deploy chaincode part of the script becasue it ussually does not work. 

6. Run the ./Start.sh until step 4 create channel,  then go to the deployChaincode.sh script and run it from the ./start.sh script comment and uncomment each step by step.

Note: If it's the first time bringing up brining the network up you have to first create the certificate authorities by running docker compose up -d in the create-certificate-with-ca folder, then run the ./create-certificate-with-ca.sh script

# SECOND: Steps to bring up the REST server
 
 1. Go to the path: /xxxxx/uxxxx/fabric-samples/MVA_for_CCS_BLockchain/api. Update the MONGODB_URL, you get it online from the Atlas Network Access left side pannel In the terminal
 2. Type: npm i to install the dependencies of the project which are listed on the package.json file
 3. Bring un the REST server, type: nodemon app

Note: If the app is not running and the console says [nodemon] app crashed. The solution is to kill the port with the command: npx kill-port 3000. 

Make sure that the ClusterCCSHLF (name of your MOngoDB Cluster) is running. The nodemon will connect to the MongoBD, to validate that the app is running go to the MongoBD in the Database > click on my database > Collections. There you will see organizations, tokens, users. The 2 Orgs and 2 admins for the two organizations. 

To test the api and see if it works open postman and send test API. Key: The private and public IP address will change depending on where I am, so you need to change the private IP address on postman and the public IP address on the env file In the postman > Environments you have to change the ip address both the initial and current value To edit the admin's password, edit the bootstrap.js file in: /xxxx/xxxxr/fabric-samples/MVA_for_CCS_BLockchain/api/src/utils the passwod is: Admin@123 located at the bottom of the .env file 

# THIRD: UI React Go to the ui folder 

1. run: npm i -f to install the depdencies
2. Type: npm start and type Y

# ISSUES ENCOUNTERED

- Error while installing the chaincode: Error: chaincode install failed with status: 500 - failed to invoke backing implementation of 'InstallChaincode': could not build chaincode: docker build failed: docker image inspection failed: Get "http://unix.sock/images/dev-peer0.org1.example.com-ccschaincode_1-96ee7a9a4415beed2fdc72edc144c6bdbbf3b6d65dfa5351e82a91ed67d191ec-8ff9cc32e5e6cdcad76673e8567f02d23d84e220330e41cae8d7e9d3b895016e/json": dial unix /host/var/run/docker.sock: connect: no such file or directory.  To fix this error you go to the Docker Desktop settings and for the Choose file sharing implementation for your containers setting choose osxfs (Legacy), this solved the communication issue between Hyperledger Fabric and Docker on Mac, another solution is to install an old version of docker. 

- Sometimes there are issues with the certificates: To solve it manually remove the folders crypto-config and fabric-ca then in the create-certificate-with-ca folder run first docker-compose up and then ./create-certificate-with-ca.sh



