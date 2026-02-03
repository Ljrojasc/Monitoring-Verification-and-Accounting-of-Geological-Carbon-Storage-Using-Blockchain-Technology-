"use strict";

const { Contract } = require("fabric-contract-api");
const ClientIdentity = require('fabric-shim').ClientIdentity; // Import the clientIdentity library for ABAC

// Define a simple structure for our contract data
const CONTRACT_DOC_TYPE = "agreement";

/**
 * A sample chaincode for managing Carbon Capture contracts.
 * This chaincode demonstrates Attribute-Based Access Control (ABAC) to restrict
 * functions to specific organizations and departments.
 */
class CcsChaincode extends Contract {

  /**
   * Initializes the ledger. This is called when the chaincode is first instantiated.
   * We will not put any initial data on the ledger here.
   */
  async InitLedger(ctx) {
    console.info('=========== Initializing Ledger ===========');
  }

  // =========================================================================
  // ORG1 - CAPTURE OPERATOR FUNCTIONS
  // =========================================================================
  /**
   * Creates a new carbon capture contract on the ledger.
   * This function is restricted to Org1 (Capture Operator).
   *
   * @param {Context} ctx The transaction context object
   * @param {string} ccsData JSON string containing the initial capture data
   */

    // ctx: The transaction context, providing APIs to interact with the ledger and client identity.
    // storageData: A JSON string containing capture-related details to be recorded.

  async CreateCaptureContract(ctx, ccsData) { 
    const cid = new ClientIdentity(ctx.stub); //Retrieves the client identity from the transaction context
    const userOrgMSP = cid.getMSPID(); //Extracts the caller's MSP ID (userOrgMSP) of their organization
    const userDepartment = cid.getAttributeValue('department'); //Extracts the department attribute from their identity to verify role

    console.log(`Attempting to create a new capture contract by: MSP=${userOrgMSP}, Department=${userDepartment}`); //Logs the caller’s org and role for debugging/audit

    // Enforce ABAC: Only Org1 with Capture Operator role can create contracts
    if (userOrgMSP !== 'Org1MSP' || userDepartment !== 'Capture Operator') {
      throw new Error(`Unauthorized: Only 'Org1MSP' with 'Capture Operator' role can create carbon capture contracts. Your role: ${userOrgMSP} - ${userDepartment}`);
    }

    // Use the transaction ID as the unique key
    // Retrieves the unique transaction ID of the current chaincode invocation
    // This ID will be used as the key to store the new record on the ledger, ensuring uniqueness
    const contractId = ctx.stub.getTxID();

    // Parse the input data and add a document type
    const data = JSON.parse(ccsData); //Parses the input JSON string into a JavaScript object. This object contains the capture transaction details supplied by the caller

  //accept and record document metadata/hash 
  //recommended input field names: documentHash (string, sha256 hex), documentS3Key (string), documentHashAlgo (optional)
    data.documentHash = data.documentHash || null;
    data.documentS3Key = data.documentS3Key || null;
    data.documentHashAlgo = data.documentHashAlgo || 'sha256';

  // basic validation / logging (non-blocking except for type errors)
    if (data.documentHash && typeof data.documentHash !== 'string') {
      throw new Error('Invalid documentHash: expected hex string');
    }
    if (data.documentHash && data.documentHashAlgo === 'sha256' && data.documentHash.length !== 64) {
      console.warn(`CreateCaptureContract: documentHash length unexpected (${data.documentHash.length})`);
    }

    //Adds metadata fields to the storage data:
    data.docType = CONTRACT_DOC_TYPE; //docType: A label/tag identifying the record type as "captureContract"
    data.createdBy = cid.getID(); //createdBy: The unique identity of the client invoking the transaction
    data.createdAt = new Date().toISOString(); //createdAt: The ISO timestamp when this record was created.

    // Put the new contract on the ledger
    // Converts the string into a Buffer (byte array) for ledger storage
    // Calls putState to store this data on the ledger, using the transaction ID (txId) as the key
    // This effectively writes a new record representing a capture transaction.
    await ctx.stub.putState(contractId, Buffer.from(JSON.stringify(data))); //Serializes the updated data object back into a JSON string

    // Logs success message with the key used
    console.info(`Contract ${contractId} created successfully by ${userOrgMSP} - ${userDepartment}`);

    // Returns an object containing the transaction ID, which can be used as a receipt or reference.
    return { transactionId: contractId };
  }

  // =========================================================================
  // ORG2 - TRANSPORT OPERATOR FUNCTIONS
  // =========================================================================

  /**
   * Adds a new transport transaction record.
   * Uses  transportData as input.
   * Only Org2MSP with Transport Operator role can call this.
   *
   * @param {Context} ctx The transaction context
   * @param {string} transportData JSON string with transport details
   */
  async UpdateTransportDetails(ctx, transportData) {
    const cid = new ClientIdentity(ctx.stub);
    const userOrgMSP = cid.getMSPID();
    const userDepartment = cid.getAttributeValue('department');

    console.log(`Org MSP: ${userOrgMSP}, Department: ${userDepartment}`);

    // Access control
    if (userOrgMSP !== 'Org2MSP' || userDepartment !== 'Transport Operator') {
      throw new Error(`Unauthorized: Only 'Org2MSP' with 'Transport Operator' role can add transport details.`);
    }

    // Parse transportData
    const data = JSON.parse(transportData);

    data.documentHash = data.documentHash || null;
    data.documentS3Key = data.documentS3Key || null;
    data.documentHashAlgo = data.documentHashAlgo || 'sha256';
    if (data.documentHash && typeof data.documentHash !== 'string') {
      throw new Error('Invalid documentHash: expected hex string');
    }
    if (data.documentHash && data.documentHashAlgo === 'sha256' && data.documentHash.length !== 64) {
    console.warn(`UpdateTransportDetails: documentHash length unexpected (${data.documentHash.length})`);
    }

    // Use transaction ID as the unique ledger key
    const txId = ctx.stub.getTxID();

    // Add metadata
    data.docType = CONTRACT_DOC_TYPE;
    data.createdBy = cid.getID();
    data.createdAt = new Date().toISOString();

    // Save to ledger
    await ctx.stub.putState(txId, Buffer.from(JSON.stringify(data)));

    console.info(`New transport transaction recorded with key: ${txId}`);
    return { transactionId: txId };
  }

  // =========================================================================
  // ORG3 - STORAGE OPERATOR FUNCTIONS
  // =========================================================================
  /**
   * Adds a new storage transaction record.
   * Only Org3MSP with Storage Operator role can call this.
   *
   * @param {Context} ctx The transaction context
   * @param {string} storageData JSON string with storage details
   */

  async UpdateStorageDetails(ctx, storageData) {
    const cid = new ClientIdentity(ctx.stub);
    const userOrgMSP = cid.getMSPID();
    const userDepartment = cid.getAttributeValue('department');

    console.log(`Org MSP: ${userOrgMSP}, Department: ${userDepartment}`);
    
    // Access control
    if (userOrgMSP !== 'Org3MSP' || userDepartment !== 'Storage Operator') {
    throw new Error(`Unauthorized: Only 'Org3MSP' with 'Storage Operator' role can add storage details.`);
  }

  // Parse storageData input
    const data = JSON.parse(storageData);

      //accept and record document metadata/hash ---
    data.documentHash = data.documentHash || null;
    data.documentS3Key = data.documentS3Key || null;
    data.documentHashAlgo = data.documentHashAlgo || 'sha256';
    if (data.documentHash && typeof data.documentHash !== 'string') {
      throw new Error('Invalid documentHash: expected hex string');
    }
    if (data.documentHash && data.documentHashAlgo === 'sha256' && data.documentHash.length !== 64) {
      console.warn(`UpdateStorageDetails: documentHash length unexpected (${data.documentHash.length})`);
    }

  // Use transaction ID as the unique ledger key
    const txId = ctx.stub.getTxID();

  // Add metadata
    data.docType = CONTRACT_DOC_TYPE;
    data.createdBy = cid.getID();
    data.createdAt = new Date().toISOString();

  // Save to ledger
    await ctx.stub.putState(txId, Buffer.from(JSON.stringify(data)));
  
  // Emit event
    const eventPayload = {
      transactionId: txId,
      action: 'StorageUpdated',
      timestamp: new Date().toISOString(),
      performedBy: cid.getID(),
      data,
    };
    ctx.stub.setEvent('StorageUpdated', Buffer.from(JSON.stringify(eventPayload)));

    console.info(`New storage transaction recorded with key: ${txId}`);
    return { transactionId: txId };
}

// =========================================================================
// ORG4 - PROJECT DEVELOPER FUNCTIONS
// =========================================================================
/**
 * Adds a new project development record.
 * Only Org4MSP with Project Developer role can call this.
 *
 * @param {Context} ctx The transaction context
 * @param {string} projectData JSON string with project details
 */
async AddProjectDetails(ctx, projectData) {
  const cid = new ClientIdentity(ctx.stub);
  const userOrgMSP = cid.getMSPID();
  const userDepartment = cid.getAttributeValue('department');

  console.log(`Org MSP: ${userOrgMSP}, Department: ${userDepartment}`);

  if (userOrgMSP !== 'Org4MSP' || userDepartment !== 'Project Developer') {
    throw new Error(`Unauthorized: Only 'Org4MSP' with 'Project Developer' role can add project details.`);
  }

  const data = JSON.parse(projectData);

  // Document metadata
  data.documentHash = data.documentHash || null;
  data.documentS3Key = data.documentS3Key || null;
  data.documentHashAlgo = data.documentHashAlgo || 'sha256';
  if (data.documentHash && typeof data.documentHash !== 'string') {
    throw new Error('Invalid documentHash: expected hex string');
  }
  if (data.documentHash && data.documentHashAlgo === 'sha256' && data.documentHash.length !== 64) {
    console.warn(`AddProjectDetails: documentHash length unexpected (${data.documentHash.length})`);
  }

  const txId = ctx.stub.getTxID();
  data.docType = CONTRACT_DOC_TYPE;
  data.createdBy = cid.getID();
  data.createdAt = new Date().toISOString();

  await ctx.stub.putState(txId, Buffer.from(JSON.stringify(data)));

  const eventPayload = {
    transactionId: txId,
    action: 'ProjectAdded',
    timestamp: new Date().toISOString(),
    performedBy: cid.getID(),
    data,
  };
  ctx.stub.setEvent('ProjectAdded', Buffer.from(JSON.stringify(eventPayload)));

  console.info(`New project record added with key: ${txId}`);
  return { transactionId: txId };
}


// =========================================================================
// ORG5 - REGULATOR FUNCTIONS
// =========================================================================
/**
 * Adds a new regulatory decision record.
 * Only Org5MSP with Regulator role can call this.
 *
 * @param {Context} ctx The transaction context
 * @param {string} regulatorData JSON string with regulator details
 */
async AddRegulatoryDecision(ctx, regulatorData) {
  const cid = new ClientIdentity(ctx.stub);
  const userOrgMSP = cid.getMSPID();
  const userDepartment = cid.getAttributeValue('department');

  console.log(`Org MSP: ${userOrgMSP}, Department: ${userDepartment}`);

  if (userOrgMSP !== 'Org5MSP' || userDepartment !== 'Regulator') {
    throw new Error(`Unauthorized: Only 'Org5MSP' with 'Regulator' role can add regulatory decisions.`);
  }

  const data = JSON.parse(regulatorData);

  // Document metadata
  data.documentHash = data.documentHash || null;
  data.documentS3Key = data.documentS3Key || null;
  data.documentHashAlgo = data.documentHashAlgo || 'sha256';
  if (data.documentHash && typeof data.documentHash !== 'string') {
    throw new Error('Invalid documentHash: expected hex string');
  }
  if (data.documentHash && data.documentHashAlgo === 'sha256' && data.documentHash.length !== 64) {
    console.warn(`AddRegulatoryDecision: documentHash length unexpected (${data.documentHash.length})`);
  }

  const txId = ctx.stub.getTxID();
  data.docType = CONTRACT_DOC_TYPE;
  data.createdBy = cid.getID();
  data.createdAt = new Date().toISOString();

  await ctx.stub.putState(txId, Buffer.from(JSON.stringify(data)));

  const eventPayload = {
    transactionId: txId,
    action: 'RegulatoryDecisionAdded',
    timestamp: new Date().toISOString(),
    performedBy: cid.getID(),
    data,
  };
  ctx.stub.setEvent('RegulatoryDecisionAdded', Buffer.from(JSON.stringify(eventPayload)));

  console.info(`New regulatory decision recorded with key: ${txId}`);
  return { transactionId: txId };
}


// =========================================================================
// ORG6 - AUDITOR FUNCTIONS
// =========================================================================
/**
 * Adds a new audit record.
 * Only Org6MSP with Auditor role can call this.
 *
 * @param {Context} ctx The transaction context
 * @param {string} auditData JSON string with audit details
 */
async AddAuditRecord(ctx, auditData) {
  const cid = new ClientIdentity(ctx.stub);
  const userOrgMSP = cid.getMSPID();
  const userDepartment = cid.getAttributeValue('department');

  console.log(`Org MSP: ${userOrgMSP}, Department: ${userDepartment}`);

  if (userOrgMSP !== 'Org6MSP' || userDepartment !== 'Auditor') {
    throw new Error(`Unauthorized: Only 'Org6MSP' with 'Auditor' role can add audit records.`);
  }

  const data = JSON.parse(auditData);

  // Document metadata
  data.documentHash = data.documentHash || null;
  data.documentS3Key = data.documentS3Key || null;
  data.documentHashAlgo = data.documentHashAlgo || 'sha256';
  if (data.documentHash && typeof data.documentHash !== 'string') {
    throw new Error('Invalid documentHash: expected hex string');
  }
  if (data.documentHash && data.documentHashAlgo === 'sha256' && data.documentHash.length !== 64) {
    console.warn(`AddAuditRecord: documentHash length unexpected (${data.documentHash.length})`);
  }

  const txId = ctx.stub.getTxID();
  data.docType = CONTRACT_DOC_TYPE;
  data.createdBy = cid.getID();
  data.createdAt = new Date().toISOString();

  await ctx.stub.putState(txId, Buffer.from(JSON.stringify(data)));

  const eventPayload = {
    transactionId: txId,
    action: 'AuditRecordAdded',
    timestamp: new Date().toISOString(),
    performedBy: cid.getID(),
    data,
  };
  ctx.stub.setEvent('AuditRecordAdded', Buffer.from(JSON.stringify(eventPayload)));

  console.info(`New audit record recorded with key: ${txId}`);
  return { transactionId: txId };
}

// =========================================================================
// ORG4 - PROJECT DEVELOPER FUNCTIONS
// =========================================================================
/**
 * Adds a new project development record.
 * Only Org4MSP with Project Developer role can call this.
 *
 * @param {Context} ctx The transaction context
 * @param {string} projectData JSON string with project details
 */
async	AddProjectDetails(ctx, projectData) {
	const cid = new ClientIdentity(ctx.stub);
	const userOrgMSP = cid.getMSPID();
	const userDepartment = cid.getAttributeValue('department');

	console.log(`Org MSP: ${userOrgMSP}, Department: ${userDepartment}`);

	if (userOrgMSP !== 'Org4MSP' || userDepartment !== 'Project Developer') {
		throw new Error(`Unauthorized: Only 'Org4MSP' with 'Project Developer' role can add project details.`);
	}

	const data = JSON.parse(projectData);

	// Document metadata
	data.documentHash = data.documentHash || null;
	data.documentS3Key = data.documentS3Key || null;
	data.documentHashAlgo = data.documentHashAlgo || 'sha256';
	if (data.documentHash && typeof data.documentHash !== 'string') {
		throw new Error('Invalid documentHash: expected hex string');
	}
	if (data.documentHash && data.documentHashAlgo === 'sha256' && data.documentHash.length !== 64) {
		console.warn(`AddProjectDetails: documentHash length unexpected (${data.documentHash.length})`);
	}

	const txId = ctx.stub.getTxID();
	data.docType = CONTRACT_DOC_TYPE;
	data.createdBy = cid.getID();
	data.createdAt = new Date().toISOString();

	await ctx.stub.putState(txId, Buffer.from(JSON.stringify(data)));

	const eventPayload = {
		transactionId: txId,
		action: 'ProjectAdded',
		timestamp: new Date().toISOString(),
		performedBy: cid.getID(),
		data,
	};
	ctx.stub.setEvent('ProjectAdded', Buffer.from(JSON.stringify(eventPayload)));

	console.info(`New project record added with key: ${txId}`);
	return { transactionId: txId };
}


// =========================================================================
// ORG5 - REGULATOR FUNCTIONS
// =========================================================================
/**
 * Adds a new regulatory decision record.
 * Only Org5MSP with Regulator role can call this.
 *
 * @param {Context} ctx The transaction context
 * @param {string} regulatorData JSON string with regulator details
 */
async	AddRegulatoryDecision(ctx, regulatorData) {
	const cid = new ClientIdentity(ctx.stub);
	const userOrgMSP = cid.getMSPID();
	const userDepartment = cid.getAttributeValue('department');

	console.log(`Org MSP: ${userOrgMSP}, Department: ${userDepartment}`);

	if (userOrgMSP !== 'Org5MSP' || userDepartment !== 'Regulator') {
		throw new Error(`Unauthorized: Only 'Org5MSP' with 'Regulator' role can add regulatory decisions.`);
	}

	const data = JSON.parse(regulatorData);

	// Document metadata
	data.documentHash = data.documentHash || null;
	data.documentS3Key = data.documentS3Key || null;
	data.documentHashAlgo = data.documentHashAlgo || 'sha256';
	if (data.documentHash && typeof data.documentHash !== 'string') {
		throw new Error('Invalid documentHash: expected hex string');
	}
	if (data.documentHash && data.documentHashAlgo === 'sha256' && data.documentHash.length !== 64) {
		console.warn(`AddRegulatoryDecision: documentHash length unexpected (${data.documentHash.length})`);
	}

	const txId = ctx.stub.getTxID();
	data.docType = CONTRACT_DOC_TYPE;
	data.createdBy = cid.getID();
	data.createdAt = new Date().toISOString();

	await ctx.stub.putState(txId, Buffer.from(JSON.stringify(data)));

	const eventPayload = {
		transactionId: txId,
		action: 'RegulatoryDecisionAdded',
		timestamp: new Date().toISOString(),
		performedBy: cid.getID(),
		data,
	};
	ctx.stub.setEvent('RegulatoryDecisionAdded', Buffer.from(JSON.stringify(eventPayload)));

	console.info(`New regulatory decision recorded with key: ${txId}`);
	return { transactionId: txId };
}


// =========================================================================
// ORG6 - AUDITOR FUNCTIONS
// =========================================================================
/**
 * Adds a new audit record.
 * Only Org6MSP with Auditor role can call this.
 *
 * @param {Context} ctx The transaction context
 * @param {string} auditData JSON string with audit details
 */
async	AddAuditRecord(ctx, auditData) {
	const cid = new ClientIdentity(ctx.stub);
	const userOrgMSP = cid.getMSPID();
	const userDepartment = cid.getAttributeValue('department');

	console.log(`Org MSP: ${userOrgMSP}, Department: ${userDepartment}`);

	if (userOrgMSP !== 'Org6MSP' || userDepartment !== 'Auditor') {
		throw new Error(`Unauthorized: Only 'Org6MSP' with 'Auditor' role can add audit records.`);
	}

	const data = JSON.parse(auditData);

	// Document metadata
	data.documentHash = data.documentHash || null;
	data.documentS3Key = data.documentS3Key || null;
	data.documentHashAlgo = data.documentHashAlgo || 'sha256';
	if (data.documentHash && typeof data.documentHash !== 'string') {
		throw new Error('Invalid documentHash: expected hex string');
	}
	if (data.documentHash && data.documentHashAlgo === 'sha256' && data.documentHash.length !== 64) {
		console.warn(`AddAuditRecord: documentHash length unexpected (${data.documentHash.length})`);
	}

	const txId = ctx.stub.getTxID();
	data.docType = CONTRACT_DOC_TYPE;
	data.createdBy = cid.getID();
	data.createdAt = new Date().toISOString();

	await ctx.stub.putState(txId, Buffer.from(JSON.stringify(data)));

	const eventPayload = {
		transactionId: txId,
		action: 'AuditRecordAdded',
		timestamp: new Date().toISOString(),
		performedBy: cid.getID(),
		data,
	};
	ctx.stub.setEvent('AuditRecordAdded', Buffer.from(JSON.stringify(eventPayload)));

	console.info(`New audit record recorded with key: ${txId}`);
	return { transactionId: txId };
}

// =========================================================================
// ORG4 - PROJECT DEVELOPER APPROVAL/DISAPPROVAL FUNCTIONS
// =========================================================================
/**
 * Approves or disapproves a contract/transaction.
 * Only Org4MSP with Project Developer role can call this.
 *
 * @param {Context} ctx The transaction context
 * @param {string} contractId The ID of the contract to approve/disapprove
 * @param {boolean} isApproved True if approving, false if disapproving
 * @param {string} comment Optional comment
 */
async	ApproveOrDisapproveContractByProject(ctx, contractId, isApproved, comment) {
	const cid = new ClientIdentity(ctx.stub);
	const userOrgMSP = cid.getMSPID();
	const userDepartment = cid.getAttributeValue('department');

	console.log(`Org MSP: ${userOrgMSP}, Department: ${userDepartment}`);

	if (userOrgMSP !== 'Org4MSP' || userDepartment !== 'Project Developer') {
		throw new Error(`Unauthorized: Only 'Org4MSP' with 'Project Developer' role can approve/disapprove contracts.`);
	}

	const contractDataJSON = await ctx.stub.getState(contractId);
	if (!contractDataJSON || contractDataJSON.length === 0) {
		throw new Error(`Contract ${contractId} does not exist`);
	}
	const contractData = JSON.parse(contractDataJSON.toString());

	contractData.approvalStatusByProject = isApproved ? 'Approved' : 'Disapproved';
	contractData.approvalCommentByProject = comment || '';
	contractData.approvalTimestampByProject = new Date().toISOString();
	contractData.approvedByProject = cid.getID();

	await ctx.stub.putState(contractId, Buffer.from(JSON.stringify(contractData)));

	const eventPayload = {
		transactionId: contractId,
		action: 'ApprovalByProjectDeveloper',
		timestamp: new Date().toISOString(),
		performedBy: cid.getID(),
		approvalStatus: contractData.approvalStatusByProject,
		comment: contractData.approvalCommentByProject,
	};
	ctx.stub.setEvent('ApprovalByProjectDeveloper', Buffer.from(JSON.stringify(eventPayload)));

	console.info(`Contract ${contractId} ${contractData.approvalStatusByProject} by Project Developer`);
	return { transactionId: contractId, status: contractData.approvalStatusByProject };
}

// =========================================================================
// ORG5 - REGULATOR APPROVAL/DISAPPROVAL FUNCTIONS
// =========================================================================
/**
 * Approves or disapproves a contract/transaction.
 * Only Org5MSP with Regulator role can call this.
 *
 * @param {Context} ctx The transaction context
 * @param {string} contractId The ID of the contract to approve/disapprove
 * @param {boolean} isApproved True if approving, false if disapproving
 * @param {string} comment Optional comment
 */
async	ApproveOrDisapproveContractByRegulator(ctx, contractId, isApproved, comment) {
	const cid = new ClientIdentity(ctx.stub);
	const userOrgMSP = cid.getMSPID();
	const userDepartment = cid.getAttributeValue('department');

	console.log(`Org MSP: ${userOrgMSP}, Department: ${userDepartment}`);

	if (userOrgMSP !== 'Org5MSP' || userDepartment !== 'Regulator') {
		throw new Error(`Unauthorized: Only 'Org5MSP' with 'Regulator' role can approve/disapprove contracts.`);
	}

	const contractDataJSON = await ctx.stub.getState(contractId);
	if (!contractDataJSON || contractDataJSON.length === 0) {
		throw new Error(`Contract ${contractId} does not exist`);
	}
	const contractData = JSON.parse(contractDataJSON.toString());

	contractData.approvalStatusByRegulator = isApproved ? 'Approved' : 'Disapproved';
	contractData.approvalCommentByRegulator = comment || '';
	contractData.approvalTimestampByRegulator = new Date().toISOString();
	contractData.approvedByRegulator = cid.getID();

	await ctx.stub.putState(contractId, Buffer.from(JSON.stringify(contractData)));

	const eventPayload = {
		transactionId: contractId,
		action: 'ApprovalByRegulator',
		timestamp: new Date().toISOString(),
		performedBy: cid.getID(),
		approvalStatus: contractData.approvalStatusByRegulator,
		comment: contractData.approvalCommentByRegulator,
	};
	ctx.stub.setEvent('ApprovalByRegulator', Buffer.from(JSON.stringify(eventPayload)));

	console.info(`Contract ${contractId} ${contractData.approvalStatusByRegulator} by Regulator`);
	return { transactionId: contractId, status: contractData.approvalStatusByRegulator };
}

// =========================================================================
// ORG6 - AUDITOR APPROVAL/DISAPPROVAL FUNCTIONS
// =========================================================================
/**
 * Approves or disapproves a contract/transaction.
 * Only Org6MSP with Auditor role can call this.
 *
 * @param {Context} ctx The transaction context
 * @param {string} contractId The ID of the contract to approve/disapprove
 * @param {boolean} isApproved True if approving, false if disapproving
 * @param {string} comment Optional comment
 */
async	ApproveOrDisapproveContractByAuditor(ctx, contractId, isApproved, comment) {
	const cid = new ClientIdentity(ctx.stub);
	const userOrgMSP = cid.getMSPID();
	const userDepartment = cid.getAttributeValue('department');

	console.log(`Org MSP: ${userOrgMSP}, Department: ${userDepartment}`);

	if (userOrgMSP !== 'Org6MSP' || userDepartment !== 'Auditor') {
		throw new Error(`Unauthorized: Only 'Org6MSP' with 'Auditor' role can approve/disapprove contracts.`);
	}

	const contractDataJSON = await ctx.stub.getState(contractId);
	if (!contractDataJSON || contractDataJSON.length === 0) {
		throw new Error(`Contract ${contractId} does not exist`);
	}
	const contractData = JSON.parse(contractDataJSON.toString());

	contractData.approvalStatusByAuditor = isApproved ? 'Approved' : 'Disapproved';
	contractData.approvalCommentByAuditor = comment || '';
	contractData.approvalTimestampByAuditor = new Date().toISOString();
	contractData.approvedByAuditor = cid.getID();

	await ctx.stub.putState(contractId, Buffer.from(JSON.stringify(contractData)));

	const eventPayload = {
		transactionId: contractId,
		action: 'ApprovalByAuditor',
		timestamp: new Date().toISOString(),
		performedBy: cid.getID(),
		approvalStatus: contractData.approvalStatusByAuditor,
		comment: contractData.approvalCommentByAuditor,
	};
	ctx.stub.setEvent('ApprovalByAuditor', Buffer.from(JSON.stringify(eventPayload)));

	console.info(`Contract ${contractId} ${contractData.approvalStatusByAuditor} by Auditor`);
	return { transactionId: contractId, status: contractData.approvalStatusByAuditor };
}

  // =========================================================================
  // GENERAL READ/UTILITY FUNCTIONS (No ABAC needed here)
  // =========================================================================

  // Function to check if an asset exists
  async assetExists(ctx, id) {
    const assetJSON = await ctx.stub.getState(id);
    return assetJSON && assetJSON.length > 0;
  }

  // Get a single asset by its ID
  async getAssetByID(ctx, id) {
    try {
      const assetJSON = await ctx.stub.getState(id); //Get the id 
      if (!assetJSON || assetJSON.length === 0) {
        throw new Error(`The asset ${id} does not exist`);
      }
      return assetJSON.toString();
    } catch (err) {
      throw new Error(err.stack);
    }
  }

  // Get all assets on the ledger
  async getAllAssets(ctx) {
    const allResults = [];
    const iterator = await ctx.stub.getStateByRange('', '');
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
      let record;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.error(err);
        record = strValue;
      }
      allResults.push({ Key: result.value.key, Record: record });
      result = await iterator.next();
    }
    return JSON.stringify(allResults);
  }

  // Query assets using a rich query string
  async getQueryResult(ctx, queryString) {
    console.log(`- getQueryResult queryString:\n${queryString}`);
    const resultsIterator = await ctx.stub.getQueryResult(queryString);
    const results = await this.getAllResults(resultsIterator, false);
    return JSON.stringify(results);
  }

  //getAllAssets returns all assets found in the world state.
  async getAllResults(iterator, isHistory) {
    let allResults = [];
    while (true) {
      let res = await iterator.next();
      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        if (isHistory && isHistory === true) {
          jsonRes.txId = res.value.txId;
          jsonRes.Timestamp = res.value.timestamp;
          jsonRes.IsDelete = res.value.is_delete ? res.value.is_delete.toString() : "false";
          try {
            jsonRes.Value = JSON.parse(res.value.value.toString("utf8"));
          } catch (err) {
            console.log(err);
            jsonRes.Value = res.value.value.toString("utf8");
          }
        } else {
          jsonRes.Key = res.value.key;
          try {
            jsonRes.Record = JSON.parse(res.value.value.toString("utf8"));
          } catch (err) {
            console.log(err);
            jsonRes.Record = res.value.value.toString("utf8");
          }
        }
        allResults.push(jsonRes);
      }
      if (res.done) {
        await iterator.close();
        return allResults;
      }
    }
  }

  //getDataForQuery (rich query)
  async getDataForQuery(ctx, queryString) {
    console.log(`- getDataForQuery queryString:\n${queryString}`);
    const resultsIterator = await ctx.stub.getQueryResult(queryString);
    const results = await this.getAllResults(resultsIterator, false);
    return JSON.stringify(results);
  }

  //getAssetHistory (history of an asset)
  async getAssetHistory(ctx, id) {
    const resultsIterator = await ctx.stub.getHistoryForKey(id);
    const results = await this.getAllResults(resultsIterator, true);
    return JSON.stringify(results);
  }

  //getDataWithPagination (query with pagination)
  async getDataWithPagination(ctx, queryString, pageSize, bookmark) {
    const pageSizeInt = parseInt(pageSize, 10);
    const { iterator, metadata } = await ctx.stub.getQueryResultWithPagination(queryString, pageSizeInt, bookmark);
    const results = await this.getAllResults(iterator, false);
    const finalData = {
      data: results,
      metadata: {
        RecordsCount: metadata.fetchedRecordsCount,
        Bookmark: metadata.bookmark,
      },
    };
    return JSON.stringify(finalData);
    console.log('Raw ledger response:', JSON.stringify(data, null, 2));

  }
}

module.exports = CcsChaincode;
