const config = require('../config/config');
const Organization = require('../models/organization.model');
const User = require('../models/user.model');
const { ORG_DEPARTMENT, USER_STATUS, USER_TYPE } = require('./Constants');
const { registerUser } = require('./blockchainUtils');

const ingestBootstrapData = async () => {
  const staticOrgData = [
    { name: 'Org1', id: 1, parentId: 1 },
    { name: 'Org2', id: 2, parentId: 2 },
    { name: 'Org3', id: 3, parentId: 3 }, //new
    { name: 'Org4', id: 4, parentId: 4 }, //new
    { name: 'Org5', id: 5, parentId: 5 }, //new
    { name: 'Org6', id: 6, parentId: 6 }, //new
  ];
  const staticUser = [
    {
      name: 'Admin1',
      email: 'captureop@gmail.com',
      orgId: 1,
      password: config.commonPassword, 
      department: ORG_DEPARTMENT.CAPTUREOPERATOR,
    },
    {
      name: 'Admin2',
      email: 'transportop@gmail.com',
      orgId: 2,
      password: config.commonPassword, 
      department: ORG_DEPARTMENT.TRANSPORTOPERATOR,
    },
    {
      name: 'Admin3',//new
      email: 'storageop@gmail.com',
      orgId: 3,
      password: config.commonPassword, 
      department: ORG_DEPARTMENT.STORAGEOPERATOR,
    },
    {
      name: 'Admin4',//new
      email: 'projectdev@gmail.com',
      orgId: 4,
      password: config.commonPassword, 
      department: ORG_DEPARTMENT.PROJECTDEVELOPER,
    },
    {
      name: 'Admin5',//new
      email: 'admin5@gmail.com',
      orgId: 5,
      password: config.commonPassword, 
      department: ORG_DEPARTMENT.REGULATORYENTITY,
    },
    {
      name: 'Admin6',//new
      email: 'third-party@gmail.com',
      orgId: 6,
      password: config.commonPassword, 
      department: ORG_DEPARTMENT.THIRDPARTY,
    },
    {
      name: 'TestUser',
      email: 'testuser2@gmail.com',
      orgId: 4,
      password: config.commonPassword, 
      department: ORG_DEPARTMENT.STORAGEOPERATOR,
    },
  ];

  //org data ingestion
  for (let org of staticOrgData) {
    let orgData = await Organization.findOne({ id: org.id });
    if (!orgData) {
      let o = new Organization({
        id: org.id,
        name: org.name,
        parentId: org.parentId,
      });
      await o.save();
      console.log('Ingesting static org data', org.name);
    } else {
      console.log('organization already exist', org.name);
    }
  }

  // --- User Data Ingestion (MODIFIED to update existing users) ---
  for (let user of staticUser) {
    let userData = await User.findOne({ email: user.email });

    if (!userData) {
      // If User does NOT exist, create new
      let newUser = new User({
        name: user.name,
        email: user.email,
        orgId: user.orgId,
        password: user.password,
        status: USER_STATUS.ACTIVE,
        type: USER_TYPE.ADMIN, // Assuming all static users are admins for now
        department: user.department,
      });
      try {
        // Blockchain Registration and Enrollment call for NEW user
        let secret = await registerUser(`org${user.orgId}`, user.email, user.department);
        newUser.secret = secret;
        newUser.isVerified = true;
        console.log(`Blockchain registration successful for new user: ${user.email}`);
      } catch (error) {
        console.error(`Blockchain registration failed for new user ${user.email}:`, error.message);
      }
      await newUser.save();
      console.log('----Ingested static user data for new user--', user.email);
    } else {
      // User DOES exist, check if department needs updating and re-enroll if so
      console.log(`User ${user.email} already exists. Checking for updates...`);

      let needsUpdate = false;
      if (userData.department !== user.department) {
        userData.department = user.department; // Update department in the database object
        needsUpdate = true;
        console.log(`  - Department updated to: ${user.department}`);
      }
      // You can add more checks here if other fields might change (e.g., orgId, name)
      if (userData.orgId !== user.orgId) {
        userData.orgId = user.orgId;
        needsUpdate = true;
        console.log(`  - OrgId updated to: ${user.orgId}`);
      }

      if (needsUpdate) {
        try {
          // Re-enroll the user on the blockchain to update their certificate with the new department
          // This call is crucial to get the new department into the user's wallet certificate
          let secret = await registerUser(`org${user.orgId}`, user.email, user.department);
          userData.secret = secret; // Update secret (though usually it doesn't change on re-enroll)
          userData.isVerified = true; // Ensure they are verified
          console.log(`Updated existing user ${user.email} and re-enrolled on blockchain.`);
        } catch (error) {
          console.error(`Blockchain re-enrollment failed for existing user ${user.email}:`, error.message);
        }
        await userData.save(); // Save the updated user data to the database
      } else {
        console.log(`User ${user.email} already has the correct data. No update needed.`);
      }
    }
  }
};

module.exports = { ingestBootstrapData };
