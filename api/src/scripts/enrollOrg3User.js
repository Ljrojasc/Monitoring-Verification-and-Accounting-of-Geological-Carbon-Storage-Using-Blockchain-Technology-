const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function enrollOrg4Admin() {
  try {
    const ccpPath = path.resolve(__dirname, '../../connection-profiles/connection-org4.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    const caInfo = ccp.certificateAuthorities['ca.org4.example.com'];
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false });

    const walletPath = path.join(__dirname, '../wallet/org4');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const identityLabel = 'user';
    const adminExists = await wallet.get(identityLabel);
    if (adminExists) {
      console.log(`Admin identity '${identityLabel}' already exists in the wallet.`);
      return;
    }

    const enrollment = await ca.enroll({
      enrollmentID: 'admin4@gmail.com',
      enrollmentSecret: 'Admin@123',  // Make sure this matches your CA admin credentials
    });

    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: 'Org4MSP',
      type: 'X.509',
    };

    await wallet.put(identityLabel, x509Identity);
    console.log(`Successfully enrolled Org4 admin and imported into wallet/org3 as '${identityLabel}'`);
  } catch (error) {
    console.error('Failed to enroll Org4 admin:', error);
  }
}

enrollOrg4Admin();
