#------ createCertificatesForOrg1 ------ 

createcertificatesForOrg1() { 
  echo
  #1. Enrolment of the CA admin
  echo "Enroll the CA admin"
  echo
  mkdir -p ../crypto-config/peerOrganizations/org1.example.com/

  #Enrolling the CA admin
  export FABRIC_CA_CLIENT_HOME=${PWD}/../crypto-config/peerOrganizations/org1.example.com/

  #In the line below we are using the fabirc-ca-client binary 
  #We are providing the https, the username, the tls certificate 
  #The tls certificate communicates with the CA, so we have provide this which is the file tls-cert.pem that was created previously 

  fabric-ca-client enroll -u https://admin:adminpw@localhost:7054 --caname ca.org1.example.com --tls.certfiles ${PWD}/fabric-ca/org1/tls-cert.pem
   
  #For segreagation of the identities in HLF Node Organization Units 
  #NodeOUs grous and differentiating members within an organization
  #We have 4 NodeOUs client, admin, peer, orderer 
  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-org1-example-com.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-org1-example-com.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-org1-example-com.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-org1-example-com.pem
    OrganizationalUnitIdentifier: orderer' >${PWD}/../crypto-config/peerOrganizations/org1.example.com/msp/config.yaml

  echo
  #Registration of the peers
  echo "Register peer0"
  echo
  fabric-ca-client register --caname ca.org1.example.com --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles ${PWD}/fabric-ca/org1/tls-cert.pem

  echo
  #Registration for normal user
  echo "Register user"
  echo
  fabric-ca-client register --caname ca.org1.example.com --id.name user1 --id.secret user1pw --id.type client --id.attrs 'department=Capture Operator:ecert' --tls.certfiles ${PWD}/fabric-ca/org1/tls-cert.pem

  echo
  #Registration for admin user even though we already have it to put it inside a folder
  echo "Register the org admin"
  echo
  fabric-ca-client register --caname ca.org1.example.com --id.name org1admin --id.secret org1adminpw --id.type admin --tls.certfiles ${PWD}/fabric-ca/org1/tls-cert.pem

  mkdir -p ../crypto-config/peerOrganizations/org1.example.com/peers

  # -----------------------------------------------------------------------------------
  #  Peer 0

  #Create the msp certificate, to enrroll the identity and the TLS certificate. This is for the peer 
  mkdir -p ../crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com

  echo
  echo "## Generate the peer0 msp"
  echo
  # 1. Enrollment of the msp certificate 
  #We provide the data in the line below 
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:7054 --caname ca.org1.example.com -M ${PWD}/../crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp --csr.hosts peer0.org1.example.com --tls.certfiles ${PWD}/fabric-ca/org1/tls-cert.pem

  cp ${PWD}/../crypto-config/peerOrganizations/org1.example.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp/config.yaml

  echo
  echo "## Generate the peer0-tls certificates"
  echo
  #2. TLS certificate/ This is for the TLS certificate the only difference is in the profile 
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:7054 --caname ca.org1.example.com -M ${PWD}/../crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls --enrollment.profile tls --csr.hosts peer0.org1.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/org1/tls-cert.pem

  #We are copying files and putting them in an organized folder 
  cp ${PWD}/../crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
  cp ${PWD}/../crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/signcerts/* ${PWD}/../crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.crt
  cp ${PWD}/../crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/keystore/* ${PWD}/../crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.key

  mkdir ${PWD}/../crypto-config/peerOrganizations/org1.example.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/org1.example.com/msp/tlscacerts/ca.crt

  mkdir ${PWD}/../crypto-config/peerOrganizations/org1.example.com/tlsca
  cp ${PWD}/../crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem

  mkdir ${PWD}/../crypto-config/peerOrganizations/org1.example.com/ca
  cp ${PWD}/../crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp/cacerts/* ${PWD}/../crypto-config/peerOrganizations/org1.example.com/ca/ca.org1.example.com-cert.pem

  # --------------------------------------------------------------------------------------------------

  #Creation of the msp for the user

  mkdir -p ../crypto-config/peerOrganizations/org1.example.com/users
  mkdir -p ../crypto-config/peerOrganizations/org1.example.com/users/User1@org1.example.com

  echo
  echo "## Generate the user msp"
  echo
  fabric-ca-client enroll -u https://user1:user1pw@localhost:7054 --caname ca.org1.example.com -M ${PWD}/../crypto-config/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp --tls.certfiles ${PWD}/fabric-ca/org1/tls-cert.pem 
  cp ${PWD}/../crypto-config/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/* ${PWD}/../crypto-config/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/priv_sk
  mkdir -p ../crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com

  echo
  echo "## Generate the org admin msp"
  echo
  fabric-ca-client enroll -u https://org1admin:org1adminpw@localhost:7054 --caname ca.org1.example.com -M ${PWD}/../crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp --tls.certfiles ${PWD}/fabric-ca/org1/tls-cert.pem 
  cp ${PWD}/../crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/* ${PWD}/../crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/priv_sk
  cp ${PWD}/../crypto-config/peerOrganizations/org1.example.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/config.yaml

}

#------ createCertificatesForOrg2 ------ 

createCertificatesForOrg2() {
  echo
  echo "Enroll the CA admin"
  echo
  mkdir -p /../crypto-config/peerOrganizations/org2.example.com/

  export FABRIC_CA_CLIENT_HOME=${PWD}/../crypto-config/peerOrganizations/org2.example.com/

   
  fabric-ca-client enroll -u https://admin:adminpw@localhost:8054 --caname ca.org2.example.com --tls.certfiles ${PWD}/fabric-ca/org2/tls-cert.pem
   

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-org2-example-com.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-org2-example-com.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-org2-example-com.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-org2-example-com.pem
    OrganizationalUnitIdentifier: orderer' >${PWD}/../crypto-config/peerOrganizations/org2.example.com/msp/config.yaml

  echo
  echo "Register peer0"
  echo
   
  fabric-ca-client register --caname ca.org2.example.com --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles ${PWD}/fabric-ca/org2/tls-cert.pem
   

  echo
  echo "Register user"
  echo
   
  fabric-ca-client register --caname ca.org2.example.com --id.name user2 --id.secret user2pw --id.type client --id.attrs "department=Transport Operator:ecert" --tls.certfiles ${PWD}/fabric-ca/org2/tls-cert.pem
   

  echo
  echo "Register the org admin"
  echo
   
  fabric-ca-client register --caname ca.org2.example.com --id.name org2admin --id.secret org2adminpw --id.type admin --tls.certfiles ${PWD}/fabric-ca/org2/tls-cert.pem
   

  mkdir -p ../crypto-config/peerOrganizations/org2.example.com/peers
  mkdir -p ../crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com

  # --------------------------------------------------------------
  # Peer 0
  echo
  echo "## Generate the peer0 msp"
  echo
   
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:8054 --caname ca.org2.example.com -M ${PWD}/../crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/msp --csr.hosts peer0.org2.example.com --tls.certfiles ${PWD}/fabric-ca/org2/tls-cert.pem
   

  cp ${PWD}/../crypto-config/peerOrganizations/org2.example.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/msp/config.yaml

  echo
  echo "## Generate the peer0-tls certificates"
  echo
   
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:8054 --caname ca.org2.example.com -M ${PWD}/../crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls --enrollment.profile tls --csr.hosts peer0.org2.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/org2/tls-cert.pem
   

  cp ${PWD}/../crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
  cp ${PWD}/../crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/signcerts/* ${PWD}/../crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/server.crt
  cp ${PWD}/../crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/keystore/* ${PWD}/../crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/server.key

  mkdir ${PWD}/../crypto-config/peerOrganizations/org2.example.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/org2.example.com/msp/tlscacerts/ca.crt

  mkdir ${PWD}/../crypto-config/peerOrganizations/org2.example.com/tlsca
  cp ${PWD}/../crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/org2.example.com/tlsca/tlsca.org2.example.com-cert.pem

  mkdir ${PWD}/../crypto-config/peerOrganizations/org2.example.com/ca
  cp ${PWD}/../crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/msp/cacerts/* ${PWD}/../crypto-config/peerOrganizations/org2.example.com/ca/ca.org2.example.com-cert.pem

  # --------------------------------------------------------------------------------
 
  mkdir -p ../crypto-config/peerOrganizations/org2.example.com/users
  mkdir -p ../crypto-config/peerOrganizations/org2.example.com/users/User2@org2.example.com

  echo
  echo "## Generate the user msp"
  echo
   
  fabric-ca-client enroll -u https://user2:user2pw@localhost:8054 --caname ca.org2.example.com -M ${PWD}/../crypto-config/peerOrganizations/org2.example.com/users/User2@org2.example.com/msp --tls.certfiles ${PWD}/fabric-ca/org2/tls-cert.pem 
  cp ${PWD}/../crypto-config/peerOrganizations/org2.example.com/users/User2@org2.example.com/msp/keystore/* ${PWD}/../crypto-config/peerOrganizations/org2.example.com/users/User2@org2.example.com/msp/keystore/priv_sk

  mkdir -p ../crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com

  echo
  echo "## Generate the org admin msp"
  echo
   
  fabric-ca-client enroll -u https://org2admin:org2adminpw@localhost:8054 --caname ca.org2.example.com -M ${PWD}/../crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp --tls.certfiles ${PWD}/fabric-ca/org2/tls-cert.pem 
  cp ${PWD}/../crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp/keystore/* ${PWD}/../crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp/keystore/priv_sk

  cp ${PWD}/../crypto-config/peerOrganizations/org2.example.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp/config.yaml

}

#------ createCertificatesForOrg3 ------ 

createCertificatesForOrg3() {
  echo
  #1. Enrolment of the CA admin
  echo "Enroll the CA admin"
  echo
  mkdir -p ../crypto-config/peerOrganizations/org3.example.com/

  #Enrolling the CA admin
  export FABRIC_CA_CLIENT_HOME=${PWD}/../crypto-config/peerOrganizations/org3.example.com/

  #In the line below we are using the fabric-ca-client binary 
  #We are providing the https, the username, the tls certificate 
  #The tls certificate communicates with the CA, so we have provide this which is the file tls-cert.pem that was created previously 

  fabric-ca-client enroll -u https://admin:adminpw@localhost:10054 --caname ca.org3.example.com --tls.certfiles ${PWD}/fabric-ca/org3/tls-cert.pem
   
  #For segregation of the identities in HLF Node Organization Units 
  #NodeOUs group and differentiating members within an organization
  #We have 4 NodeOUs client, admin, peer, orderer 
  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-10054-ca-org3-example-com.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-10054-ca-org3-example-com.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-10054-ca-org3-example-com.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-10054-ca-org3-example-com.pem
    OrganizationalUnitIdentifier: orderer' >${PWD}/../crypto-config/peerOrganizations/org3.example.com/msp/config.yaml

  echo
  #Registration of the peers
  echo "Register peer0"
  echo
  fabric-ca-client register --caname ca.org3.example.com --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles ${PWD}/fabric-ca/org3/tls-cert.pem

  echo
  #Registration for normal user
  echo "Register user"
  echo
  fabric-ca-client register --caname ca.org3.example.com --id.name user3 --id.secret user3pw --id.type client --id.attrs "department=Storage Operator:ecert" --tls.certfiles ${PWD}/fabric-ca/org3/tls-cert.pem

  echo
  #Registration for admin user even though we already have it to put it inside a folder
  echo "Register the org admin"
  echo
  fabric-ca-client register --caname ca.org3.example.com --id.name org3admin --id.secret org3adminpw --id.type admin --tls.certfiles ${PWD}/fabric-ca/org3/tls-cert.pem

  mkdir -p ../crypto-config/peerOrganizations/org3.example.com/peers

  # -----------------------------------------------------------------------------------
  #  Peer 0

  #Create the msp certificate, to enrroll the identity and the TLS certificate. This is for the peer 
  mkdir -p ../crypto-config/peerOrganizations/org3.example.com/peers/peer0.org3.example.com

  echo
  echo "## Generate the peer0 msp"
  echo
  # 1. Enrollment of the msp certificate 
  #We provide the data in the line below 
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:10054 --caname ca.org3.example.com -M ${PWD}/../crypto-config/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/msp --csr.hosts peer0.org3.example.com --tls.certfiles ${PWD}/fabric-ca/org3/tls-cert.pem

  cp ${PWD}/../crypto-config/peerOrganizations/org3.example.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/msp/config.yaml

  echo
  echo "## Generate the peer0-tls certificates"
  echo
  #2. TLS certificate/ This is for the TLS certificate the only difference is in the profile 
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:10054 --caname ca.org3.example.com -M ${PWD}/../crypto-config/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls --enrollment.profile tls --csr.hosts peer0.org3.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/org3/tls-cert.pem

  #We are copying files and putting them in an organized folder 
  cp ${PWD}/../crypto-config/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt
  cp ${PWD}/../crypto-config/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/signcerts/* ${PWD}/../crypto-config/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/server.crt
  cp ${PWD}/../crypto-config/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/keystore/* ${PWD}/../crypto-config/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/server.key

  mkdir ${PWD}/../crypto-config/peerOrganizations/org3.example.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/org3.example.com/msp/tlscacerts/ca.crt

  mkdir ${PWD}/../crypto-config/peerOrganizations/org3.example.com/tlsca
  cp ${PWD}/../crypto-config/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/org3.example.com/tlsca/tlsca.org3.example.com-cert.pem

  mkdir ${PWD}/../crypto-config/peerOrganizations/org3.example.com/ca
  cp ${PWD}/../crypto-config/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/msp/cacerts/* ${PWD}/../crypto-config/peerOrganizations/org3.example.com/ca/ca.org3.example.com-cert.pem

  # --------------------------------------------------------------------------------------------------

  #Creation of the msp for the user

  mkdir -p ../crypto-config/peerOrganizations/org3.example.com/users
  mkdir -p ../crypto-config/peerOrganizations/org3.example.com/users/User3@org3.example.com

  echo
  echo "## Generate the user msp"
  echo
  fabric-ca-client enroll -u https://user3:user3pw@localhost:10054 --caname ca.org3.example.com -M ${PWD}/../crypto-config/peerOrganizations/org3.example.com/users/User3@org3.example.com/msp --tls.certfiles ${PWD}/fabric-ca/org3/tls-cert.pem 
  cp ${PWD}/../crypto-config/peerOrganizations/org3.example.com/users/User3@org3.example.com/msp/keystore/* ${PWD}/../crypto-config/peerOrganizations/org3.example.com/users/User3@org3.example.com/msp/keystore/priv_sk
  
  mkdir -p ../crypto-config/peerOrganizations/org3.example.com/users/Admin@org3.example.com

  echo
  echo "## Generate the org admin msp"
  echo
  fabric-ca-client enroll -u https://org3admin:org3adminpw@localhost:10054 --caname ca.org3.example.com -M ${PWD}/../crypto-config/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp --tls.certfiles ${PWD}/fabric-ca/org3/tls-cert.pem
  cp ${PWD}/../crypto-config/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp/keystore/* ${PWD}/../crypto-config/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp/keystore/priv_sk
  cp ${PWD}/../crypto-config/peerOrganizations/org3.example.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp/config.yaml

}

#------ createCertificatesForOrg4 ------ 

createCertificatesForOrg4() {
  echo
  #1. Enrolment of the CA admin
  echo "Enroll the CA admin"
  echo
  mkdir -p ../crypto-config/peerOrganizations/org4.example.com/

  #Enrolling the CA admin
  export FABRIC_CA_CLIENT_HOME=${PWD}/../crypto-config/peerOrganizations/org4.example.com/

  #In the line below we are using the fabric-ca-client binary 
  #We are providing the https, the username, the tls certificate 
  #The tls certificate communicates with the CA, so we have provide this which is the file tls-cert.pem that was created previously 

  fabric-ca-client enroll -u https://admin:adminpw@localhost:11054 --caname ca.org4.example.com --tls.certfiles ${PWD}/fabric-ca/org4/tls-cert.pem
   
  #For segregation of the identities in HLF Node Organization Units 
  #NodeOUs group and differentiating members within an organization
  #We have 4 NodeOUs client, admin, peer, orderer 
  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-org4-example-com.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-org4-example-com.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-org4-example-com.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-11054-ca-org4-example-com.pem
    OrganizationalUnitIdentifier: orderer' >${PWD}/../crypto-config/peerOrganizations/org4.example.com/msp/config.yaml

  echo
  #Registration of the peers
  echo "Register peer0"
  echo
  fabric-ca-client register --caname ca.org4.example.com --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles ${PWD}/fabric-ca/org4/tls-cert.pem

  echo
  #Registration for normal user
  echo "Register user"
  echo
  fabric-ca-client register --caname ca.org4.example.com --id.name user4 --id.secret user4pw --id.type client --id.attrs "department=Project Developer:ecert" --tls.certfiles ${PWD}/fabric-ca/org4/tls-cert.pem

  echo
  #Registration for admin user even though we already have it to put it inside a folder
  echo "Register the org admin"
  echo
  fabric-ca-client register --caname ca.org4.example.com --id.name org4admin --id.secret org4adminpw --id.type admin --tls.certfiles ${PWD}/fabric-ca/org4/tls-cert.pem

  mkdir -p ../crypto-config/peerOrganizations/org4.example.com/peers

  # -----------------------------------------------------------------------------------
  #  Peer 0

  #Create the msp certificate, to enrroll the identity and the TLS certificate. This is for the peer 
  mkdir -p ../crypto-config/peerOrganizations/org4.example.com/peers/peer0.org4.example.com

  echo
  echo "## Generate the peer0 msp"
  echo
  # 1. Enrollment of the msp certificate 
  #We provide the data in the line below 
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:11054 --caname ca.org4.example.com -M ${PWD}/../crypto-config/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/msp --csr.hosts peer0.org4.example.com --tls.certfiles ${PWD}/fabric-ca/org4/tls-cert.pem

  cp ${PWD}/../crypto-config/peerOrganizations/org4.example.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/msp/config.yaml

  echo
  echo "## Generate the peer0-tls certificates"
  echo
  #2. TLS certificate/ This is for the TLS certificate the only difference is in the profile 
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:11054 --caname ca.org4.example.com -M ${PWD}/../crypto-config/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/tls --enrollment.profile tls --csr.hosts peer0.org4.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/org4/tls-cert.pem

  #We are copying files and putting them in an organized folder 
  cp ${PWD}/../crypto-config/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/tls/ca.crt
  cp ${PWD}/../crypto-config/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/tls/signcerts/* ${PWD}/../crypto-config/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/tls/server.crt
  cp ${PWD}/../crypto-config/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/tls/keystore/* ${PWD}/../crypto-config/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/tls/server.key

  mkdir ${PWD}/../crypto-config/peerOrganizations/org4.example.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/org4.example.com/msp/tlscacerts/ca.crt

  mkdir ${PWD}/../crypto-config/peerOrganizations/org4.example.com/tlsca
  cp ${PWD}/../crypto-config/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/org4.example.com/tlsca/tlsca.org4.example.com-cert.pem

  mkdir ${PWD}/../crypto-config/peerOrganizations/org4.example.com/ca
  cp ${PWD}/../crypto-config/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/msp/cacerts/* ${PWD}/../crypto-config/peerOrganizations/org4.example.com/ca/ca.org4.example.com-cert.pem

  # --------------------------------------------------------------------------------------------------

  #Creation of the msp for the user

  mkdir -p ../crypto-config/peerOrganizations/org4.example.com/users
  mkdir -p ../crypto-config/peerOrganizations/org4.example.com/users/User4@org4.example.com

  echo
  echo "## Generate the user msp"
  echo
  fabric-ca-client enroll -u https://user4:user4pw@localhost:11054 --caname ca.org4.example.com -M ${PWD}/../crypto-config/peerOrganizations/org4.example.com/users/User4@org4.example.com/msp --tls.certfiles ${PWD}/fabric-ca/org4/tls-cert.pem
  cp ${PWD}/../crypto-config/peerOrganizations/org4.example.com/users/User4@org4.example.com/msp/keystore/* ${PWD}/../crypto-config/peerOrganizations/org4.example.com/users/User4@org4.example.com/msp/keystore/priv_sk
  
  mkdir -p ../crypto-config/peerOrganizations/org4.example.com/users/Admin@org4.example.com

  echo
  echo "## Generate the org admin msp"
  echo
  fabric-ca-client enroll -u https://org4admin:org4adminpw@localhost:11054 --caname ca.org4.example.com -M ${PWD}/../crypto-config/peerOrganizations/org4.example.com/users/Admin@org4.example.com/msp --tls.certfiles ${PWD}/fabric-ca/org4/tls-cert.pem
  cp ${PWD}/../crypto-config/peerOrganizations/org4.example.com/users/Admin@org4.example.com/msp/keystore/* ${PWD}/../crypto-config/peerOrganizations/org4.example.com/users/Admin@org4.example.com/msp/keystore/priv_sk
  cp ${PWD}/../crypto-config/peerOrganizations/org4.example.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/org4.example.com/users/Admin@org4.example.com/msp/config.yaml

}

#------ createCertificatesForOrg5 ------ 

createCertificatesForOrg5() {
  echo
  #1. Enrolment of the CA admin
  echo "Enroll the CA admin"
  echo
  mkdir -p ../crypto-config/peerOrganizations/org5.example.com/

  #Enrolling the CA admin
  export FABRIC_CA_CLIENT_HOME=${PWD}/../crypto-config/peerOrganizations/org5.example.com/

  #In the line below we are using the fabric-ca-client binary 
  #We are providing the https, the username, the tls certificate 
  #The tls certificate communicates with the CA, so we have provide this which is the file tls-cert.pem that was created previously 

  fabric-ca-client enroll -u https://admin:adminpw@localhost:12054 --caname ca.org5.example.com --tls.certfiles ${PWD}/fabric-ca/org5/tls-cert.pem
   
  #For segregation of the identities in HLF Node Organization Units 
  #NodeOUs group and differentiating members within an organization
  #We have 4 NodeOUs client, admin, peer, orderer 
  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-12054-ca-org5-example-com.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-12054-ca-org5-example-com.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-12054-ca-org5-example-com.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-12054-ca-org5-example-com.pem
    OrganizationalUnitIdentifier: orderer' >${PWD}/../crypto-config/peerOrganizations/org5.example.com/msp/config.yaml

  echo
  #Registration of the peers
  echo "Register peer0"
  echo
  fabric-ca-client register --caname ca.org5.example.com --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles ${PWD}/fabric-ca/org5/tls-cert.pem

  echo
  #Registration for normal user
  echo "Register user"
  echo
  fabric-ca-client register --caname ca.org5.example.com --id.name user5 --id.secret user5pw --id.type client --id.attrs "department=Regulator:ecert" --tls.certfiles ${PWD}/fabric-ca/org5/tls-cert.pem

  echo
  #Registration for admin user even though we already have it to put it inside a folder
  echo "Register the org admin"
  echo
  fabric-ca-client register --caname ca.org5.example.com --id.name org5admin --id.secret org5adminpw --id.type admin --tls.certfiles ${PWD}/fabric-ca/org5/tls-cert.pem

  mkdir -p ../crypto-config/peerOrganizations/org5.example.com/peers

  # -----------------------------------------------------------------------------------
  #  Peer 0

  #Create the msp certificate, to enrroll the identity and the TLS certificate. This is for the peer 
  mkdir -p ../crypto-config/peerOrganizations/org5.example.com/peers/peer0.org5.example.com

  echo
  echo "## Generate the peer0 msp"
  echo
  # 1. Enrollment of the msp certificate 
  #We provide the data in the line below 
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:12054 --caname ca.org5.example.com -M ${PWD}/../crypto-config/peerOrganizations/org5.example.com/peers/peer0.org5.example.com/msp --csr.hosts peer0.org5.example.com --tls.certfiles ${PWD}/fabric-ca/org5/tls-cert.pem

  cp ${PWD}/../crypto-config/peerOrganizations/org5.example.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/org5.example.com/peers/peer0.org5.example.com/msp/config.yaml

  echo
  echo "## Generate the peer0-tls certificates"
  echo
  #2. TLS certificate/ This is for the TLS certificate the only difference is in the profile 
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:12054 --caname ca.org5.example.com -M ${PWD}/../crypto-config/peerOrganizations/org5.example.com/peers/peer0.org5.example.com/tls --enrollment.profile tls --csr.hosts peer0.org5.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/org5/tls-cert.pem

  #We are copying files and putting them in an organized folder 
  cp ${PWD}/../crypto-config/peerOrganizations/org5.example.com/peers/peer0.org5.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/org5.example.com/peers/peer0.org5.example.com/tls/ca.crt
  cp ${PWD}/../crypto-config/peerOrganizations/org5.example.com/peers/peer0.org5.example.com/tls/signcerts/* ${PWD}/../crypto-config/peerOrganizations/org5.example.com/peers/peer0.org5.example.com/tls/server.crt
  cp ${PWD}/../crypto-config/peerOrganizations/org5.example.com/peers/peer0.org5.example.com/tls/keystore/* ${PWD}/../crypto-config/peerOrganizations/org5.example.com/peers/peer0.org5.example.com/tls/server.key

  mkdir ${PWD}/../crypto-config/peerOrganizations/org5.example.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/peerOrganizations/org5.example.com/peers/peer0.org5.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/org5.example.com/msp/tlscacerts/ca.crt

  mkdir ${PWD}/../crypto-config/peerOrganizations/org5.example.com/tlsca
  cp ${PWD}/../crypto-config/peerOrganizations/org5.example.com/peers/peer0.org5.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/org5.example.com/tlsca/tlsca.org5.example.com-cert.pem

  mkdir ${PWD}/../crypto-config/peerOrganizations/org5.example.com/ca
  cp ${PWD}/../crypto-config/peerOrganizations/org5.example.com/peers/peer0.org5.example.com/msp/cacerts/* ${PWD}/../crypto-config/peerOrganizations/org5.example.com/ca/ca.org5.example.com-cert.pem

  # --------------------------------------------------------------------------------------------------

  #Creation of the msp for the user

  mkdir -p ../crypto-config/peerOrganizations/org5.example.com/users
  mkdir -p ../crypto-config/peerOrganizations/org5.example.com/users/User5@org5.example.com

  echo
  echo "## Generate the user msp"
  echo
  fabric-ca-client enroll -u https://user5:user5pw@localhost:12054 --caname ca.org5.example.com -M ${PWD}/../crypto-config/peerOrganizations/org5.example.com/users/User5@org5.example.com/msp --tls.certfiles ${PWD}/fabric-ca/org5/tls-cert.pem 
  cp ${PWD}/../crypto-config/peerOrganizations/org5.example.com/users/User5@org5.example.com/msp/keystore/* ${PWD}/../crypto-config/peerOrganizations/org5.example.com/users/User5@org5.example.com/msp/keystore/priv_sk
  
  mkdir -p ../crypto-config/peerOrganizations/org5.example.com/users/Admin@org5.example.com

  echo
  echo "## Generate the org admin msp"
  echo
  fabric-ca-client enroll -u https://org5admin:org5adminpw@localhost:12054 --caname ca.org5.example.com -M ${PWD}/../crypto-config/peerOrganizations/org5.example.com/users/Admin@org5.example.com/msp --tls.certfiles ${PWD}/fabric-ca/org5/tls-cert.pem
  cp ${PWD}/../crypto-config/peerOrganizations/org5.example.com/users/Admin@org5.example.com/msp/keystore/* ${PWD}/../crypto-config/peerOrganizations/org5.example.com/users/Admin@org5.example.com/msp/keystore/priv_sk
  cp ${PWD}/../crypto-config/peerOrganizations/org5.example.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/org5.example.com/users/Admin@org5.example.com/msp/config.yaml

}

#------ createCertificatesForOrg6 ------ 

createCertificatesForOrg6() {
  echo
  #1. Enrolment of the CA admin
  echo "Enroll the CA admin"
  echo
  mkdir -p ../crypto-config/peerOrganizations/org6.example.com/

  #Enrolling the CA admin
  export FABRIC_CA_CLIENT_HOME=${PWD}/../crypto-config/peerOrganizations/org6.example.com/

  #In the line below we are using the fabric-ca-client binary 
  #We are providing the https, the username, the tls certificate 
  #The tls certificate communicates with the CA, so we have provide this which is the file tls-cert.pem that was created previously 

  fabric-ca-client enroll -u https://admin:adminpw@localhost:13054 --caname ca.org6.example.com --tls.certfiles ${PWD}/fabric-ca/org6/tls-cert.pem
   
  #For segregation of the identities in HLF Node Organization Units 
  #NodeOUs group and differentiating members within an organization
  #We have 4 NodeOUs client, admin, peer, orderer 
  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-13054-ca-org6-example-com.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-13054-ca-org6-example-com.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-13054-ca-org6-example-com.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-13054-ca-org6-example-com.pem
    OrganizationalUnitIdentifier: orderer' >${PWD}/../crypto-config/peerOrganizations/org6.example.com/msp/config.yaml

  echo
  #Registration of the peers
  echo "Register peer0"
  echo
  fabric-ca-client register --caname ca.org6.example.com --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles ${PWD}/fabric-ca/org6/tls-cert.pem

  echo
  #Registration for normal user
  echo "Register user"
  echo
  fabric-ca-client register --caname ca.org6.example.com --id.name user6 --id.secret user6pw --id.type client --id.attrs "department=Auditor:ecert" --tls.certfiles ${PWD}/fabric-ca/org6/tls-cert.pem

  echo
  #Registration for admin user even though we already have it to put it inside a folder
  echo "Register the org admin"
  echo
  fabric-ca-client register --caname ca.org6.example.com --id.name org6admin --id.secret org6adminpw --id.type admin --tls.certfiles ${PWD}/fabric-ca/org6/tls-cert.pem

  mkdir -p ../crypto-config/peerOrganizations/org6.example.com/peers

  # -----------------------------------------------------------------------------------
  #  Peer 0

  #Create the msp certificate, to enrroll the identity and the TLS certificate. This is for the peer 
  mkdir -p ../crypto-config/peerOrganizations/org6.example.com/peers/peer0.org6.example.com

  echo
  echo "## Generate the peer0 msp"
  echo
  # 1. Enrollment of the msp certificate 
  #We provide the data in the line below 
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:13054 --caname ca.org6.example.com -M ${PWD}/../crypto-config/peerOrganizations/org6.example.com/peers/peer0.org6.example.com/msp --csr.hosts peer0.org6.example.com --tls.certfiles ${PWD}/fabric-ca/org6/tls-cert.pem

  cp ${PWD}/../crypto-config/peerOrganizations/org6.example.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/org6.example.com/peers/peer0.org6.example.com/msp/config.yaml

  echo
  echo "## Generate the peer0-tls certificates"
  echo
  #2. TLS certificate/ This is for the TLS certificate the only difference is in the profile 
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:13054 --caname ca.org6.example.com -M ${PWD}/../crypto-config/peerOrganizations/org6.example.com/peers/peer0.org6.example.com/tls --enrollment.profile tls --csr.hosts peer0.org6.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/org6/tls-cert.pem

  #We are copying files and putting them in an organized folder 
  cp ${PWD}/../crypto-config/peerOrganizations/org6.example.com/peers/peer0.org6.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/org6.example.com/peers/peer0.org6.example.com/tls/ca.crt
  cp ${PWD}/../crypto-config/peerOrganizations/org6.example.com/peers/peer0.org6.example.com/tls/signcerts/* ${PWD}/../crypto-config/peerOrganizations/org6.example.com/peers/peer0.org6.example.com/tls/server.crt
  cp ${PWD}/../crypto-config/peerOrganizations/org6.example.com/peers/peer0.org6.example.com/tls/keystore/* ${PWD}/../crypto-config/peerOrganizations/org6.example.com/peers/peer0.org6.example.com/tls/server.key

  mkdir ${PWD}/../crypto-config/peerOrganizations/org6.example.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/peerOrganizations/org6.example.com/peers/peer0.org6.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/org6.example.com/msp/tlscacerts/ca.crt

  mkdir ${PWD}/../crypto-config/peerOrganizations/org6.example.com/tlsca
  cp ${PWD}/../crypto-config/peerOrganizations/org6.example.com/peers/peer0.org6.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/org6.example.com/tlsca/tlsca.org6.example.com-cert.pem

  mkdir ${PWD}/../crypto-config/peerOrganizations/org6.example.com/ca
  cp ${PWD}/../crypto-config/peerOrganizations/org6.example.com/peers/peer0.org6.example.com/msp/cacerts/* ${PWD}/../crypto-config/peerOrganizations/org6.example.com/ca/ca.org6.example.com-cert.pem

  # --------------------------------------------------------------------------------------------------

  #Creation of the msp for the user

  mkdir -p ../crypto-config/peerOrganizations/org6.example.com/users
  mkdir -p ../crypto-config/peerOrganizations/org6.example.com/users/User6@org6.example.com

  echo
  echo "## Generate the user msp"
  echo
  fabric-ca-client enroll -u https://user6:user6pw@localhost:13054 --caname ca.org6.example.com -M ${PWD}/../crypto-config/peerOrganizations/org6.example.com/users/User6@org6.example.com/msp --tls.certfiles ${PWD}/fabric-ca/org6/tls-cert.pem 
  cp ${PWD}/../crypto-config/peerOrganizations/org6.example.com/users/User6@org6.example.com/msp/keystore/* ${PWD}/../crypto-config/peerOrganizations/org6.example.com/users/User6@org6.example.com/msp/keystore/priv_sk
  
  mkdir -p ../crypto-config/peerOrganizations/org6.example.com/users/Admin@org6.example.com

  echo
  echo "## Generate the org admin msp"
  echo
  fabric-ca-client enroll -u https://org6admin:org6adminpw@localhost:13054 --caname ca.org6.example.com -M ${PWD}/../crypto-config/peerOrganizations/org6.example.com/users/Admin@org6.example.com/msp --tls.certfiles ${PWD}/fabric-ca/org6/tls-cert.pem
  cp ${PWD}/../crypto-config/peerOrganizations/org6.example.com/users/Admin@org6.example.com/msp/keystore/* ${PWD}/../crypto-config/peerOrganizations/org6.example.com/users/Admin@org6.example.com/msp/keystore/priv_sk
  cp ${PWD}/../crypto-config/peerOrganizations/org6.example.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/org6.example.com/users/Admin@org6.example.com/msp/config.yaml

}


#------ createCretificatesForOrderers ------ 

createCretificatesForOrderer() {
  echo
  echo "Enroll the CA admin"
  echo
  mkdir -p ../crypto-config/ordererOrganizations/example.com

  export FABRIC_CA_CLIENT_HOME=${PWD}/../crypto-config/ordererOrganizations/example.com

   
  fabric-ca-client enroll -u https://admin:adminpw@localhost:9054 --caname ca-orderer --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: orderer' >${PWD}/../crypto-config/ordererOrganizations/example.com/msp/config.yaml

  echo
  echo "Register orderer"
  echo
   
  fabric-ca-client register --caname ca-orderer --id.name orderer --id.secret ordererpw --id.type orderer --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  echo
  echo "Register orderer2"
  echo
   
  fabric-ca-client register --caname ca-orderer --id.name orderer2 --id.secret ordererpw --id.type orderer --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  echo
  echo "Register orderer3"
  echo
   
  fabric-ca-client register --caname ca-orderer --id.name orderer3 --id.secret ordererpw --id.type orderer --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem

  
  echo
  echo "Register orderer4"
  echo
   
  fabric-ca-client register --caname ca-orderer --id.name orderer4 --id.secret ordererpw --id.type orderer --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem


  echo
  echo "Register orderer5"
  echo
   
  fabric-ca-client register --caname ca-orderer --id.name orderer5 --id.secret ordererpw --id.type orderer --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem


  echo
  echo "Register orderer6"
  echo
   
  fabric-ca-client register --caname ca-orderer --id.name orderer6 --id.secret ordererpw --id.type orderer --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  echo
  echo "Register the orderer admin"
  echo
   
  fabric-ca-client register --caname ca-orderer --id.name ordererAdmin --id.secret ordererAdminpw --id.type admin --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  mkdir -p ../crypto-config/ordererOrganizations/example.com/orderers
  # mkdir -p ../crypto-config/ordererOrganizations/example.com/orderers/example.com

  # ---------------------------------------------------------------------------
  #  Orderer for Org1

  mkdir -p ../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com

  echo
  echo "## Generate the orderer msp"
  echo
   
  fabric-ca-client enroll -u https://orderer:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp --csr.hosts orderer.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/config.yaml ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/config.yaml

  echo
  echo "## Generate the orderer-tls certificates"
  echo
   
  fabric-ca-client enroll -u https://orderer:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls --enrollment.profile tls --csr.hosts orderer.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/signcerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/keystore/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.key

  mkdir ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

  mkdir ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/tlscacerts/tlsca.example.com-cert.pem

  # -----------------------------------------------------------------------
  #  Orderer for Org 2

  mkdir -p ../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com

  echo
  echo "## Generate the orderer msp"
  echo
   
  fabric-ca-client enroll -u https://orderer2:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/msp --csr.hosts orderer2.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/config.yaml ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/msp/config.yaml

  echo
  echo "## Generate the orderer-tls certificates"
  echo
   
  fabric-ca-client enroll -u https://orderer2:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls --enrollment.profile tls --csr.hosts orderer2.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/ca.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/signcerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/server.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/keystore/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/server.key

  mkdir ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

  # mkdir ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/tlscacerts
  # cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/tlscacerts/tlsca.example.com-cert.pem

  # ---------------------------------------------------------------------------
  #  Orderer for Org 3
  
  mkdir -p ../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com

  echo
  echo "## Generate the orderer msp"
  echo
   
  fabric-ca-client enroll -u https://orderer3:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/msp --csr.hosts orderer3.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/config.yaml ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/msp/config.yaml

  echo
  echo "## Generate the orderer-tls certificates"
  echo
   
  fabric-ca-client enroll -u https://orderer3:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/tls --enrollment.profile tls --csr.hosts orderer3.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/ca.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/signcerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/server.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/keystore/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/server.key

  mkdir ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

  # mkdir ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/tlscacerts
  # cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/tlscacerts/tlsca.example.com-cert.pem


  # ---------------------------------------------------------------------------
  #  Orderer for Org 4
  
  mkdir -p ../crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com

  echo
  echo "## Generate the orderer msp"
  echo
   
  fabric-ca-client enroll -u https://orderer4:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/msp --csr.hosts orderer4.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/config.yaml ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/msp/config.yaml

  echo
  echo "## Generate the orderer-tls certificates"
  echo
   
  fabric-ca-client enroll -u https://orderer4:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/tls --enrollment.profile tls --csr.hosts orderer4.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/tls/ca.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/tls/signcerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/tls/server.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/tls/keystore/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/tls/server.key

  mkdir ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

  # ---------------------------------------------------------------------------
  #  Orderer for Org 5
  
  mkdir -p ../crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com

  echo
  echo "## Generate the orderer msp"
  echo
   
  fabric-ca-client enroll -u https://orderer5:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com/msp --csr.hosts orderer5.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/config.yaml ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com/msp/config.yaml

  echo
  echo "## Generate the orderer-tls certificates"
  echo
   
  fabric-ca-client enroll -u https://orderer5:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com/tls --enrollment.profile tls --csr.hosts orderer5.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com/tls/ca.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com/tls/signcerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com/tls/server.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com/tls/keystore/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com/tls/server.key

  mkdir ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer5.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

  # ---------------------------------------------------------------------------
  #  Orderer for Org 6
  
  mkdir -p ../crypto-config/ordererOrganizations/example.com/orderers/orderer6.example.com

  echo
  echo "## Generate the orderer msp"
  echo
   
  fabric-ca-client enroll -u https://orderer6:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer6.example.com/msp --csr.hosts orderer5.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/config.yaml ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer6.example.com/msp/config.yaml

  echo
  echo "## Generate the orderer-tls certificates"
  echo
   
  fabric-ca-client enroll -u https://orderer6:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer6.example.com/tls --enrollment.profile tls --csr.hosts orderer6.example.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer6.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer6.example.com/tls/ca.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer6.example.com/tls/signcerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer6.example.com/tls/server.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer6.example.com/tls/keystore/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer6.example.com/tls/server.key

  mkdir ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer6.example.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer6.example.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer6.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

  # ---------------------------------------------------------------------------

  mkdir -p ../crypto-config/ordererOrganizations/example.com/users
  mkdir -p ../crypto-config/ordererOrganizations/example.com/users/Admin@example.com

  echo
  echo "## Generate the admin msp"
  echo
   
  fabric-ca-client enroll -u https://ordererAdmin:ordererAdminpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/example.com/users/Admin@example.com/msp --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/../crypto-config/ordererOrganizations/example.com/msp/config.yaml ${PWD}/../crypto-config/ordererOrganizations/example.com/users/Admin@example.com/msp/config.yaml

}


removeOldCredentials() {
  sudo rm -rf ../../../../api-2.x/wallets/*
  sudo rm -rf ../crypto-config/*

}

createConnectionProfile() {
  cd ../../../../api/connection-profiles && ./generate-ccp.sh

}

removeOldCredentials
createcertificatesForOrg1
createCertificatesForOrg2
createCertificatesForOrg3
createCertificatesForOrg4
createCertificatesForOrg5
createCertificatesForOrg6


createCretificatesForOrderer

createConnectionProfile


