const httpStatus = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const { Gateway, Wallets } = require('fabric-network');
const { getContractObject, getWalletPath, getCCP, getAgreementsWithPagination } = require('../utils/blockchainUtils');
const { getMSPFromOrgId } = require('../utils/fabricHelpers');
const { v4: uuidv4 } = require('uuid');


const {
  NETWORK_ARTIFACTS_DEFAULT,
  BLOCKCHAIN_DOC_TYPE,
  AGREEMENT_STATUS,
  FILTER_TYPE,
} = require('../utils/Constants');
const { getUUID } = require('../utils/uuid');
const { getSignedUrl } = require('../utils/fileUpload');
const THIRTY_DAYS = 2592000000;

// If we are sure that max records are limited, we can use any max number
const DEFAULT_MAX_RECORDS = 100
const utf8Decoder = new TextDecoder();

// Helper function to generate a unique contract ID
const generateUniqueId = () => {
  return 'contract-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
};

// =========================================================================
// ORG1 - Create Capture Contract
// =========================================================================
const createCaptureContract = async (agreementData, fileMetadata, user) => {
  let gateway;
  let client;

  try {
    const dateTime = new Date();
    const orgFolderName = 'org1';
    
    // Explicitly convert the capturedAmount to a number and validate it
    const capturedAmount = Number(agreementData.capturedAmount);
    if (isNaN(capturedAmount) || capturedAmount <= 0) {
        throw new Error('Invalid capturedAmount: Must be a positive number.');
    }

    // Add validation for projectId and include it in the payload
    if (!agreementData.projectId || agreementData.projectId.trim() === '') {
        throw new Error('Invalid projectId: must be a non-empty string.');
    }

    // Build the blockchain transaction payload
    const txPayload = {
      id: agreementData.id || generateUniqueId(),
      docType: BLOCKCHAIN_DOC_TYPE.AGREEMENT,
      projectId: agreementData.projectId, 
      comments: [agreementData.comment],
      csource: agreementData.csource || '',
      capturedAmount: capturedAmount, // Use the converted number
      status: "inprogress",
      orgId: 1,
      document: fileMetadata
        ? {
            ...fileMetadata,
            createdBy: user.email, 
            updatedBy: user.email,
            createdAt: dateTime,
            updatedAt: dateTime,
          }
        : null,
      documentHash: fileMetadata ? fileMetadata.contentHash : null,
    };

    // Get Fabric contract object
    const contract = await getContractObject(
      orgFolderName,
      user.email,
      NETWORK_ARTIFACTS_DEFAULT.CHANNEL_NAME,
      NETWORK_ARTIFACTS_DEFAULT.CHAINCODE_NAME,
      gateway,
      client
    );

    // Submit transaction (only one argument expected: JSON string)
    const resultBuffer = await contract.submitTransaction(
      'CreateCaptureContract',
      JSON.stringify(txPayload)
    );

    //Handling the decoding and parsing
    // DECODE buffer into string
    const resultString = Buffer.from(resultBuffer).toString('utf8');

    // PARSE string as JSON
    let parsed;
    try {
      parsed = JSON.parse(resultString);
      return { transactionId: parsed.transactionId };
    } catch (err) { 
      console.error('Failed to parse transaction result:', resultString);
      return { transactionId: resultString }; 
      }

  } catch (error) {
    console.error('Failed to submit CreateCaptureContract transaction:', error);
    throw error;

  } finally {
    if (gateway) gateway.close();
    if (client) client.close();
  }
};

// =========================================================================
// ORG2 - Create Transport Contract
// =========================================================================
const updateTransportDetails = async (agreementData, fileMetadata, user) => {
  let gateway;
  let client;

  try {
    const dateTime = new Date();
    const orgFolderName = 'org2';

    // Explicitly convert the amounts to numbers
    const vcreceived = Number(agreementData.vcreceived);
    const transportEmissions = Number(agreementData.transportEmissions); // Add this line

    // Build the blockchain transaction payload
    const txPayload = {
      id: agreementData.id,
      docType: BLOCKCHAIN_DOC_TYPE.AGREEMENT,
      projectId: agreementData.projectId, // This line was missing!
      comments: [agreementData.comment],
      vcreceived: vcreceived,
      transportEmissions: transportEmissions,
      status: "inprogress", 
      orgId: 2,
      document: fileMetadata
        ? {
            ...fileMetadata,
            createdBy: user.email,
            updatedBy: user.email,
            createdAt: dateTime,
            updatedAt: dateTime,
          }
        : null,
      documentHash: fileMetadata ? fileMetadata.contentHash : null,
    };
    
    console.log('Submitting updateTransportDetails with payload:', JSON.stringify(txPayload, null, 2));

    // Get Fabric contract object
    const contract = await getContractObject(
      orgFolderName,
      user.email,
      NETWORK_ARTIFACTS_DEFAULT.CHANNEL_NAME,
      NETWORK_ARTIFACTS_DEFAULT.CHAINCODE_NAME,
      gateway,
      client
    );

    // Submit transaction (only one argument expected: JSON string)
    const resultBuffer = await contract.submitTransaction(
      'UpdateTransportDetails',
      JSON.stringify(txPayload)
    );

    //Handling the decoding and parsing
    // DECODE buffer into string
    const resultString = Buffer.from(resultBuffer).toString('utf8');

    // PARSE string as JSON
    let parsed;
    try {
      parsed = JSON.parse(resultString);
      return { transactionId: parsed.transactionId };
    } catch (err) { 
      console.error('Failed to parse transaction result:', resultString);
      return { transactionId: resultString }; 
      }

  } catch (error) {
    console.error('Failed to submit UpdateTransportDetails transaction:', error);
    throw error;

  } finally {
    if (gateway) gateway.close();
    if (client) client.close();
  }
};

// =========================================================================
// ORG3 - Create Storage Contract
// =========================================================================
const updateStorageDetails = async (agreementData, fileMetadata, user) => {
  let gateway;
  let client;

  try {
    const orgFolderName = 'org3';
    const dateTime = new Date();

    // The smart contract expects storageLoss, measurementUnit, and location.
    // Explicitly convert storageLoss to a number to prevent type errors.
    const storageLoss = Number(agreementData.storageLoss);
    //const measurementUnit = storageData.measurementUnit;
    //const location = storageData.location;
    
    // Build the blockchain transaction payload
    const txPayload = {
      id: agreementData.id || generateUniqueId(),
      storageLoss: storageLoss, // This field is required by the chaincode
      injectedAmount: agreementData.injectedAmount || '',
      //measurementUnit: measurementUnit, // This field is likely required
      //location: location, // This field is likely required
      docType: BLOCKCHAIN_DOC_TYPE.AGREEMENT,
      projectId: agreementData.projectId, // This line was missing!
      comment: agreementData.comment || '',
      status: "inprogress", // The status should reflect the storage step
      orgId: 3,
      document: fileMetadata
        ? {
            ...fileMetadata,
            createdBy: user.email,
            updatedBy: user.email,
            createdAt: dateTime,
            updatedAt: dateTime,
          }
        : null,
      documentHash: fileMetadata ? fileMetadata.contentHash : null,  
    };

    console.log('Submitting updateStorageDetails with payload:', JSON.stringify(txPayload, null, 2));

    const contract = await getContractObject(
      orgFolderName,
      user.email,
      NETWORK_ARTIFACTS_DEFAULT.CHANNEL_NAME,
      NETWORK_ARTIFACTS_DEFAULT.CHAINCODE_NAME,
      gateway,
      client
    );

    const resultBuffer = await contract.submitTransaction(
      'UpdateStorageDetails',
      JSON.stringify(txPayload)
    );

    const resultString = Buffer.from(resultBuffer).toString('utf8');

    let parsed;
    try {
      parsed = JSON.parse(resultString);
      return { transactionId: parsed.transactionId };
    } catch (err) {
      console.error('Failed to parse transaction result:', resultString);
      return { transactionId: resultString };
    }

  } catch (error) {
    console.error('Failed to submit UpdateStorageDetails transaction:', error);
    throw error;
  } finally {
    if (gateway) gateway.close();
    if (client) client.close();
  }
};



// =========================================================================
// ORG4 - Project Developer: Create Project Data
// =========================================================================
const addProjectDetails = async (projectData, fileMetadata, user) => {
  let gateway;
  let client;

  try {
    const orgFolderName = 'org4';
    const dateTime = new Date();

  const txPayload = {
    docType: BLOCKCHAIN_DOC_TYPE.AGREEMENT,
    projectName: projectData.projectName || '',
    description: projectData.description || '',
    developerOrg: "Org4 - Project Developer",
    location: { siteName: projectData.siteName || '',
      coordinates: projectData.coordinates || '',
      region: projectData.region || '',
    },
    technicalDetails: { captureSource: projectData.captureSource || '',
    intendedStorageCapacity: projectData.intendedStorageCapacity || '',
    storageType: projectData.storageType || '',
  },
  regulatory: {permitReference: projectData.permitReference || '',
    regulatoryAgency: projectData.regulatoryAgency || '',
  },
    status: "inprogress",
    orgId: 4,
    document: fileMetadata
      ? {
        ...fileMetadata,
        createdBy: user.email,
        updatedBy: user.email,
        createdAt: dateTime,
        updatedAt: dateTime,
      }
    : null,
    documentHash: fileMetadata ? fileMetadata.contentHash : null,
    createdAt: dateTime,
    updatedAt: dateTime,
  };
    const contract = await getContractObject(
      orgFolderName,
      user.email,
      NETWORK_ARTIFACTS_DEFAULT.CHANNEL_NAME,
      NETWORK_ARTIFACTS_DEFAULT.CHAINCODE_NAME,
      gateway,
      client
    );

    const resultBuffer = await contract.submitTransaction(
      'AddProjectDetails',
      JSON.stringify(txPayload)
    );

    const resultString = Buffer.from(resultBuffer).toString('utf8');
    let parsed;
    try {
      parsed = JSON.parse(resultString);
      return { transactionId: parsed.transactionId };
    } catch (err) {
      console.error('Failed to parse transaction result:', resultString);
      return { transactionId: resultString };
    }

  } catch (error) {
    console.error('Failed to submit CreateProject transaction:', error);
    throw error;
  } finally {
    if (gateway) gateway.close();
    if (client) client.close();
  }
};

// =========================================================================
// ORG5 - Regulator: Add Regulatory Data
// =========================================================================
const addRegulatoryDecision = async (regulatorData, fileMetadata, user) => {
  let gateway;
  let client;

  try {
    const orgFolderName = 'org5';
    const dateTime = new Date();

    const txPayload = {
      docType: BLOCKCHAIN_DOC_TYPE.AGREEMENT,
      regulationType: regulatorData.regulationType || '',
      complianceNotes: regulatorData.complianceNotes || '',
      status: "inprogress",
      orgId: 5,
      document: fileMetadata
        ? {
            ...fileMetadata,
            createdBy: user.email,
            updatedBy: user.email,
            createdAt: dateTime,
            updatedAt: dateTime,
          }
        : null,
      documentHash: fileMetadata ? fileMetadata.contentHash : null,
    };

    const contract = await getContractObject(
      orgFolderName,
      user.email,
      NETWORK_ARTIFACTS_DEFAULT.CHANNEL_NAME,
      NETWORK_ARTIFACTS_DEFAULT.CHAINCODE_NAME,
      gateway,
      client
    );

    const resultBuffer = await contract.submitTransaction(
      'AddRegulatoryDecision',
      JSON.stringify(txPayload)
    );

    const resultString = Buffer.from(resultBuffer).toString('utf8');
    let parsed;
    try {
      parsed = JSON.parse(resultString);
      return { transactionId: parsed.transactionId };
    } catch (err) {
      console.error('Failed to parse transaction result:', resultString);
      return { transactionId: resultString };
    }

  } catch (error) {
    console.error('Failed to submit CreateRegulator transaction:', error);
    throw error;
  } finally {
    if (gateway) gateway.close();
    if (client) client.close();
  }
};

// =========================================================================
// ORG6 - Auditor / Third Party: Add Audit / Verification Data
// =========================================================================
const addAuditRecord = async (auditData, fileMetadata, user) => {
  let gateway;
  let client;

  try {
    const orgFolderName = 'org6';
    const dateTime = new Date();

    const txPayload = {
      docType: BLOCKCHAIN_DOC_TYPE.AGREEMENT,
      auditComments: auditData.auditType || '',
      status: "inprogress",
      orgId: 6,
      document: fileMetadata
        ? {
            ...fileMetadata,
            createdBy: user.email,
            updatedBy: user.email,
            createdAt: dateTime,
            updatedAt: dateTime,
          }
        : null,
      documentHash: fileMetadata ? fileMetadata.contentHash : null,
    };

    const contract = await getContractObject(
      orgFolderName,
      user.email,
      NETWORK_ARTIFACTS_DEFAULT.CHANNEL_NAME,
      NETWORK_ARTIFACTS_DEFAULT.CHAINCODE_NAME,
      gateway,
      client
    );

    const resultBuffer = await contract.submitTransaction(
      'AddAuditRecord',
      JSON.stringify(txPayload)
    );

    const resultString = Buffer.from(resultBuffer).toString('utf8');
    let parsed;
    try {
      parsed = JSON.parse(resultString);
      return { transactionId: parsed.transactionId };
    } catch (err) {
      console.error('Failed to parse transaction result:', resultString);
      return { transactionId: resultString };
    }

  } catch (error) {
    console.error('Failed to submit CreateAudit transaction:', error);
    throw error;
  } finally {
    if (gateway) gateway.close();
    if (client) client.close();
  }
};

// =========================================================================
// NEW: Carbon Accounting Calculation
// =========================================================================

const getTransactionById = async (txId, user) => {
  let gateway;
  let client;
  try {
    const orgFolderName = `org${user.orgId}`;
    const { contract, gateway: newGateway, client: newClient } = await getContractObject(
      orgFolderName,
      user.email,
      NETWORK_ARTIFACTS_DEFAULT.CHANNEL_NAME,
      NETWORK_ARTIFACTS_DEFAULT.CHAINCODE_NAME
    );
    gateway = newGateway;
    client = newClient;
    const resultBuffer = await contract.evaluateTransaction('ReadAsset', txId);
    const result = JSON.parse(utf8Decoder.decode(resultBuffer));
    return result;
  } catch (error) {
    console.error(`Failed to fetch transaction with ID ${txId}:`, error);
    throw error;
  } finally {
    if (gateway) gateway.close();
    if (client) client.close();
  }
};

// =========================================================================
// Calculate daily net CO₂ stored (read-only)
// =========================================================================
const calculateCarbonStored = async (projectId, date, user) => {
  let gateway;
  let client;

  try {
    const orgFolderName = 'org6'; // Or whichever org should be allowed

    const contract = await getContractObject(
      orgFolderName,
      user.email,
      NETWORK_ARTIFACTS_DEFAULT.CHANNEL_NAME,
      NETWORK_ARTIFACTS_DEFAULT.CHAINCODE_NAME,
      gateway,
      client
    );

    const resultBuffer = await contract.evaluateTransaction(
      'calculateCarbonStored',
      projectId,
      date
    );

    // This will convert the CSV of numbers into proper JSON string
    const resultString = Buffer.from(JSON.parse("[" + resultBuffer.toString() + "]")).toString("utf8");
    console.log("Decoded resultString:", resultString);

    let resultJson;
    try {
      resultJson = JSON.parse(resultString);
    } catch (e) {
      console.error("Still not valid JSON:", e);
      resultJson = resultString;
    }
    
    return resultJson;
    
  } catch (error) {
    console.error('Failed to evaluate calculateCarbonStored transaction:', error);
    throw error;
  } finally {
    if (gateway) gateway.close();
    if (client) client.close();
  }
};

// =========================================================================
// Finalize monthly CO₂ stored (only Org6 Auditors)
// =========================================================================
const monthlyCO2Stored = async (projectId, year, month, user) => {
  let gateway;
  let client;

  try {
    const orgFolderName = 'org6'; // Only auditors

    const contract = await getContractObject(
      orgFolderName,
      user.email,
      NETWORK_ARTIFACTS_DEFAULT.CHANNEL_NAME,
      NETWORK_ARTIFACTS_DEFAULT.CHAINCODE_NAME,
      gateway,
      client
    );

    // Convert all arguments to strings before submitting
    const resultBuffer = await contract.submitTransaction(
      'monthlyCO2Stored',
      String(projectId),
      String(year),
      String(month).padStart(2, '0') // "09" instead of 9
    );

    const resultString = Buffer.from(
      JSON.parse("[" + resultBuffer.toString() + "]")
    ).toString("utf8");

    let resultJson;
    try {
      resultJson = JSON.parse(resultString);
    } catch (e) {
      console.error("Still not valid JSON:", e);
      resultJson = resultString;
    }

    return resultJson;

  } catch (error) {
    console.error('Failed to submit monthlyCO2Stored transaction:', error);
    throw error;
  } finally {
    if (gateway) gateway.close();
    if (client) client.close();
  }
};


// =========================================================================
// Finalize annual CO₂ stored (only Org6 Auditors)
// =========================================================================
const annualCO2Stored = async (projectId, year, user) => {
  let gateway;
  let client;

  try {
    const orgFolderName = 'org6'; // Only auditors

    const contract = await getContractObject(
      orgFolderName,
      user.email,
      NETWORK_ARTIFACTS_DEFAULT.CHANNEL_NAME,
      NETWORK_ARTIFACTS_DEFAULT.CHAINCODE_NAME,
      gateway,
      client
    );

    const resultBuffer = await contract.submitTransaction(
      'annualCO2Stored',
      projectId,
      year
    );

    const resultString = Buffer.from(JSON.parse("[" + resultBuffer.toString() + "]")).toString("utf8");
    console.log("Decoded resultString:", resultString);

    let resultJson;
    try {
      resultJson = JSON.parse(resultString);
    } catch (e) {
      console.error("Still not valid JSON:", e);
      resultJson = resultString;
    }

    return resultJson;

  } catch (error) {
    console.error('Failed to submit annualCO2Stored transaction:', error);
    throw error;
  } finally {
    if (gateway) gateway.close();
    if (client) client.close();
  }
};



// =========================================================================
// ORG4 - Project Developer: Approve / Disapprove Transaction
// =========================================================================
const approveDevTx = async (approvalData, agreementId, user) => {
  let gateway;
  let client;

  try {
    const orgFolderName = 'org4';

    // Use email from user OR fallback from approvalData
    const approverEmail = user?.email || approvalData.approverEmail;

    if (!approverEmail) {
      throw new Error("Approver email is required for Project Developer approval.");
    }

    // Get Fabric contract object for Org4
    const contract = await getContractObject(
      orgFolderName,
      approverEmail,
      NETWORK_ARTIFACTS_DEFAULT.CHANNEL_NAME,
      NETWORK_ARTIFACTS_DEFAULT.CHAINCODE_NAME,
      gateway,
      client
    );

    // Call chaincode function
    const resultBuffer = await contract.submitTransaction(
      'ApproveOrDisapproveContractByProject',
      agreementId,
      String(approvalData.isApproved),  // chaincode expects "true"/"false"
      approvalData.comment || ''
    );

    // Decode response
    const resultString = Buffer.from(resultBuffer).toString('utf8');
    let parsed;
    try {
      parsed = JSON.parse(resultString);
      return parsed;
    } catch (err) {
      console.error('Failed to parse ApproveOrDisapproveContractByProject result:', resultString);
      return { raw: resultString };
    }

  } catch (error) {
    console.error('Failed to submit ApproveOrDisapproveContractByProject transaction:', error);
    throw error;
  } finally {
    if (gateway) gateway.close();
    if (client) client.close();
  }
};

/**
 * Query agreements from CouchDB via Fabric chaincode
 * @param {Object} filter - Filter options
 * @param {string[]} [filter.docType] - Array of docTypes to filter
 * @param {string} [filter.filterType] - 'inprogress' | 'expiring_soon'
 * @param {string} [filter.orgName] - Organization name
 * @param {number} [filter.pageSize] - Results per page
 * @param {string} [filter.bookmark] - Pagination bookmark
 * @returns {Promise<QueryResult>}
 */
const queryAgreements = async (filter) => {
  try {
    let query;
    console.log("==========================filter type", filter);

    if (filter?.filterType) {
      switch (filter.filterType) {
        case FILTER_TYPE.ALL:
          query = `{
            "selector":{
              "docType": "${BLOCKCHAIN_DOC_TYPE.AGREEMENT}"
            },
            "sort":[{"updatedAt":"desc"}],
            "use_index":["_design/indexAssetTypeOrgIdTime", "orgId_docType_time_index"]
          }`;
          break;

        case FILTER_TYPE.ACTIVE:
          query = `{
            "selector":{
              "orgId": ${filter.orgId},
              "status":"${filter.filterType}",
              "docType": "${BLOCKCHAIN_DOC_TYPE.AGREEMENT}"
            },
            "sort":[{"updatedAt":"desc"}],
            "use_index":["_design/indexAssetTypeOrgIdTime", "orgId_docType_time_index"]
          }`;
          break;

        case FILTER_TYPE.EXPIRING_SOON:
          query = `{
            "selector":{
              "orgId": ${filter.orgId},
              "endDate":{"$lt":${(+new Date()) + THIRTY_DAYS}},
              "docType": "${BLOCKCHAIN_DOC_TYPE.AGREEMENT}"
            },
            "sort":[{"updatedAt":"desc"}],
            "use_index":["_design/indexAssetTypeOrgIdTime", "orgId_docType_time_index"]
          }`;
          break;

        case FILTER_TYPE.INPROGRESS:
          // simplified to match the status_doc_type_index
          query = `{
            "selector":{
              "status":"${filter.filterType}",
              "docType": "${BLOCKCHAIN_DOC_TYPE.AGREEMENT}"
            },
            "use_index":["_design/status_doc_type_index", "status_doc_type_index"]
          }`;
          break;

        default:
          query = `{
            "selector":{
              "orgId": ${filter.orgId},
              "docType": "${BLOCKCHAIN_DOC_TYPE.AGREEMENT}"
            },
            "sort":[{"updatedAt":"desc"}],
            "use_index":["_design/indexAssetTypeOrgIdTime", "orgId_docType_time_index"]
          }`;
          break;
      }
    } else {
      query = `{
        "selector":{
          "orgId": ${filter.orgId},
          "docType": "${BLOCKCHAIN_DOC_TYPE.AGREEMENT}"
        },
        "sort":[{"updatedAt":"desc"}],
        "use_index":["_design/indexAssetTypeOrgIdTime", "orgId_docType_time_index"]
      }`;
    }

    console.log('filters--------------', filter, query);

    let data = await getAgreementsWithPagination(
      query,
      filter.pageSize,
      filter.bookmark,
      filter.orgName,
      filter.email,
      NETWORK_ARTIFACTS_DEFAULT.CHANNEL_NAME,
      NETWORK_ARTIFACTS_DEFAULT.CHAINCODE_NAME
    );

    let tempData = [];
    for (let agreement of data?.data) {
      if (agreement?.Record?.document?.id) {
        let signedUrl = await getSignedUrl(agreement.Record.document.id, `org${agreement.Record.orgId}`);
        agreement.Record.document.url = signedUrl;
      }
      tempData.push(agreement);
    }

    data.data = tempData;
    return data;
  } catch (error) {
    console.log('error--------------', error);
  }
};



/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryApprovalsByAgreementId = async (filter) => {
  console.log(filter);
  let query = `{\"selector\":{\"_id\":\"${filter.agreementId}\", \"docType\": \"${BLOCKCHAIN_DOC_TYPE.AGREEMENT}\"},  \"use_index\":[\"_design/indexDocTypeAgreementId\", \"docType_agreementId_index\"]}`;
  let data = await getAgreementsWithPagination(
    query,
    filter.pageSize,
    filter.bookmark,
    filter.orgName,
    filter.email,
    NETWORK_ARTIFACTS_DEFAULT.CHANNEL_NAME,
    NETWORK_ARTIFACTS_DEFAULT.CHAINCODE_NAME
  );
  return data;
};

const validateApprovals = async (agreementId, user) => {
  let orgName = user.orgName;
  let filters = {
    pageSize:DEFAULT_MAX_RECORDS,
    bookmark: '',
    orgName: orgName,
    email: user.email,
    agreementId
  }

  let approvals = await queryApprovalsByAgreementId(filters)
  if(approvals?.data?.length){
    let orgDepartmentApproval = approvals.data.filter(elm => elm?.Record?.department == user.department && elm?.Record?.orgId == user.orgName)
    if(orgDepartmentApproval?.length){
      throw new ApiError(httpStatus.FORBIDDEN, `Your department with name: ${user.department} has already approved this agreement`);
    }else if(approvals.data.length >= 3){
      return true
    }
  }
  return false
}

const queryHistoryById = async (id, user) => {
  let gateway;
  let client
  try {
    let orgName = user.orgName;
    const contract = await getContractObject(
      orgName,
      user.email,
      NETWORK_ARTIFACTS_DEFAULT.CHANNEL_NAME,
      NETWORK_ARTIFACTS_DEFAULT.CHAINCODE_NAME,
      gateway,
      client
    );
    let result = await contract.submitTransaction('getAssetHistory', id);
    // result = JSON.parse(result.toString());
    result = JSON.parse(utf8Decoder.decode(result));
    if(result){
      result = result?.map(elm => {
        return {txId: elm?.txId, IsDelete: elm.IsDelete, ...elm.Value, timeStamp: elm?.Timestamp?.seconds?.low*1000}
      })
    }
    return result;
  } catch (error) {
    console.log(error);
  } finally {
    if (gateway) {
      gateway.close();
    }
    if(client){
      client.close()
    }
  }
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const queryAgreementById = async (id, user) => {
  let gateway;
  let client;
  try {
    let orgName = user.orgName;

    const contract = await getContractObject(
      orgName,
      user.email,
      NETWORK_ARTIFACTS_DEFAULT.CHANNEL_NAME,
      NETWORK_ARTIFACTS_DEFAULT.CHAINCODE_NAME,
      gateway,
      client
    );

    let result = await contract.submitTransaction('getAssetByID', id);
    //console.timeEnd('Test');
    result = JSON.parse(utf8Decoder.decode(result));
    console.log("Transaction payload:", result);


    if (result) {
      result.document.url = await getSignedUrl(result?.document?.id, orgName);
    }

    let filter = {
      pageSize: DEFAULT_MAX_RECORDS,
      bookmark: '',
      orgName,
      email: user.email,
      agreementId: id
    }

    let approvals = await queryApprovalsByAgreementId(filter)
    result.approvals = approvals?.data?.map(elm => elm.Record) || []
    return result;

  } catch (error) {
    console.log(error);
  } finally {
    if (gateway)  {gateway.close();}
    if(client)  {client.close()
    }
  }
};

const getDocSignedURL = async (docId, user) => {
  let orgName = user.orgName;
  return getSignedUrl(docId, orgName);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

/**
 * Fetch all transactions from the ledger (all orgs, all doc types)
 */
const getAllTransactions = (async (req, res) => {
  const { pageSize, bookmark } = req.query;

  // Build filter for in-progress transactions
  const filter = {
    orgName: req.user.orgName,     // Keep orgName for optional filtering
    filterType: FILTER_TYPE.INPROGRESS, // Use INPROGRESS filter
    pageSize: pageSize || 100,
    bookmark: bookmark || '',
  };

  // Call the updated queryAgreements function
  let page = await agreementService.queryAgreements(filter);

  // Normalize records for response
  const records = Array.isArray(page?.data) ? page.data.map(e => e.Record || e) : [];

  // Send response
  return res.status(httpStatus.OK).send(getSuccessResponse(
    httpStatus.OK,
    'In-progress transactions fetched successfully',
    {
      data: records,
      metadata: page?.metadata || { RecordsCount: records.length, Bookmark: 'nil' },
    }
  ));
});

// =========================================================================
// ORG4 - Project Developer: Approve / Disapprove Transaction
// =========================================================================
const approveProject = async (agreementId, isApproved, comment, user) => {
  let gateway;
  let client;

  try {
    const orgFolderName = 'org4';

    if (!user || !user.email) {
      throw new Error('User information is missing in service');
    }

    // Get Fabric contract object for Org4
    const contract = await getContractObject(
      orgFolderName,
      user.email,
      NETWORK_ARTIFACTS_DEFAULT.CHANNEL_NAME,
      NETWORK_ARTIFACTS_DEFAULT.CHAINCODE_NAME,
      gateway,
      client
    );

    // Call chaincode function
    const resultBuffer = await contract.submitTransaction(
      'ApproveOrDisapproveContractByProject',
      agreementId,
      String(isApproved),  // chaincode expects string "true"/"false"
      comment || ''
    );

    // Decode response
    const resultString = Buffer.from(resultBuffer).toString('utf8');
    try {
      return JSON.parse(resultString);
    } catch (err) {
      console.error('Failed to parse ApproveOrDisapproveContractByProject result:', resultString);
      return { raw: resultString };
    }

  } catch (error) {
    console.error('Failed to submit ApproveOrDisapproveContractByProject transaction:', error);
    throw error;
  } finally {
    if (gateway) gateway.close();
    if (client) client.close();
  }
};

// =========================================================================
// ORG5 - Regulator: Approve / Disapprove Transaction
// =========================================================================
const approveRegulator = async (approvalData, agreementId, user) => {
  let gateway;
  let client;

  try {
    const orgFolderName = 'org5'; // Org5-specific folder for certs

    // Get Fabric contract object for Org5
    const contract = await getContractObject(
      orgFolderName,
      user.email,
      NETWORK_ARTIFACTS_DEFAULT.CHANNEL_NAME,
      NETWORK_ARTIFACTS_DEFAULT.CHAINCODE_NAME,
      gateway,
      client
    );

    // Call Org5 chaincode function
    const resultBuffer = await contract.submitTransaction(
      'ApproveOrDisapproveContractByRegulator',
      agreementId,
      String(approvalData.isApproved),  // chaincode expects string "true"/"false"
      approvalData.comment || ''
    );

    // Decode response
    const resultString = Buffer.from(resultBuffer).toString('utf8');
    let parsed;
    try {
      parsed = JSON.parse(resultString);
      return parsed;
    } catch (err) {
      console.error('Failed to parse ApproveOrDisapproveContractByRegulator result:', resultString);
      return { raw: resultString };
    }

  } catch (error) {
    console.error('Failed to submit ApproveOrDisapproveContractByRegulator transaction:', error);
    throw error;
  } finally {
    if (gateway) gateway.close();
    if (client) client.close();
  }
};


// =========================================================================
// ORG6 - Auditor: Approve / Disapprove Transaction
// =========================================================================
const approveAuditor = async (approvalData, agreementId, user) => {
  let gateway;
  let client;

  try {
    const orgFolderName = 'org6';

    // Get Fabric contract object for Org6
    const contract = await getContractObject(
      orgFolderName,
      user.email,
      NETWORK_ARTIFACTS_DEFAULT.CHANNEL_NAME,
      NETWORK_ARTIFACTS_DEFAULT.CHAINCODE_NAME,
      gateway,
      client
    );

    // Call chaincode function
    const resultBuffer = await contract.submitTransaction(
      'ApproveOrDisapproveContractByAuditor',
      agreementId,
      String(approvalData.isApproved),  // chaincode expects string "true"/"false"
      approvalData.comment || ''
    );

    // Decode response
    const resultString = Buffer.from(resultBuffer).toString('utf8');
    let parsed;
    try {
      parsed = JSON.parse(resultString);
      return parsed;
    } catch (err) {
      console.error('Failed to parse ApproveOrDisapproveContractByAuditor result:', resultString);
      return { raw: resultString };
    }

  } catch (error) {
    console.error('Failed to submit ApproveOrDisapproveContractByAuditor transaction:', error);
    throw error;
  } finally {
    if (gateway) gateway.close();
    if (client) client.close();
  }
};

// =========================================================================
// ORG6 - Auditor / Third Party: Get Project History
// =========================================================================
const getProjectHistory = async (projectId, user) => {
  let gateway;
  let client;
  try {
    console.log('User object received in service:', user);

    // Defensive check to ensure we have a valid orgId
    if (!user || !user.orgId || !user.email) {
      throw new Error("User organization or email is missing, cannot establish network connection.");
    }
    
    // Dynamically get the organization folder name based on the user's orgId
    const orgFolderName = `org${user.orgId}`;
    console.log(`Attempting to get contract object for organization: ${orgFolderName}`);

    const contract = await getContractObject(
      orgFolderName,
      user.email,
      NETWORK_ARTIFACTS_DEFAULT.CHANNEL_NAME,
      NETWORK_ARTIFACTS_DEFAULT.CHAINCODE_NAME,
      gateway,
      client
    );

    if (!contract) {
      throw new Error("Contract object is undefined, unable to connect to the network.");
    }

    const resultBuffer = await contract.evaluateTransaction('GetHistoryByProjectId', projectId);
    const result = JSON.parse(utf8Decoder.decode(resultBuffer));
    return { data: result };
  } catch (error) {
    console.error('Failed to fetch project history:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to fetch project history: ${error.message}`);
  } finally {
    if (gateway) gateway.close();
    if (client) client.close();
  }
};


module.exports = {
  createCaptureContract,
  updateTransportDetails,
  updateStorageDetails,
  addProjectDetails,
  addRegulatoryDecision,
  addAuditRecord,
  queryAgreements,
  queryAgreementById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  approveDevTx,
  queryApprovalsByAgreementId,
  getDocSignedURL,
  queryHistoryById,
  getAllTransactions,
  approveProject,
  approveRegulator,
  approveAuditor,
  calculateCarbonStored,
  annualCO2Stored,
  getProjectHistory,
  getTransactionById,
  monthlyCO2Stored,

};

