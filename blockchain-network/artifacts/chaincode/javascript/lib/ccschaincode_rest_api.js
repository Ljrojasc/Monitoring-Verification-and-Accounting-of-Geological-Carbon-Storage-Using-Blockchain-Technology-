"use strict";

const { Contract } = require("fabric-contract-api");
const ClientIdentity = require('fabric-shim').ClientIdentity;

const CONTRACT_DOC_TYPE = "agreement";

/**
 * A chaincode for managing Carbon Capture data.
 * This chaincode demonstrates Attribute-Based Access Control (ABAC) to restrict
 * functions to specific organizations (stakeholders).
 */
class CcsChaincode extends Contract {

  /**
   * Initializes the ledger. This is called when the chaincode is first instantiated.
   */
  async InitLedger(ctx) {
    console.info('=========== Initializing Ledger ===========');
  }

  // =========================================================================
  // ORG1 - CAPTURE OPERATOR FUNCTIONS
  // =========================================================================
  /**
   * Creates a new carbon capture transaction on the ledger.
   * This function is restricted to Org1 (Capture Operator).
   *
   * @param {Context} ctx The transaction context object
   * @param {string} ccsData JSON string containing the initial capture data.
   * Expected data format: { "projectId": "<string>", "capturedAmount": <number>, "location": "..." }
   */
  async CreateCaptureContract(ctx, ccsData) {
    const cid = new ClientIdentity(ctx.stub);
    const userOrgMSP = cid.getMSPID();
    const userDepartment = cid.getAttributeValue('department');

    console.log(`Attempting to create a new capture contract by: MSP=${userOrgMSP}, Department=${userDepartment}`);

    if (userOrgMSP !== 'Org1MSP' || userDepartment !== 'Capture Operator') {
      throw new Error(`Unauthorized: Only 'Org1MSP' with 'Capture Operator' role can create carbon capture contracts. Your role: ${userOrgMSP} - ${userDepartment}`);
    }

    const contractId = ctx.stub.getTxID();
    const data = JSON.parse(ccsData);

    // Add a check to ensure the projectId is included
    if (!data.projectId || typeof data.projectId !== 'string') {
        throw new Error('Invalid projectId: must be a non-empty string.');
    }
    
    // Validate new required field
    if (typeof data.capturedAmount !== 'number' || data.capturedAmount <= 0) {
      throw new Error('Invalid capturedAmount: must be a positive number.');
    }

    data.docType = CONTRACT_DOC_TYPE;
    data.createdBy = cid.getID();
    data.createdAt = new Date().toISOString();

    await ctx.stub.putState(contractId, Buffer.from(JSON.stringify(data)));

    console.info(`Contract ${contractId} created successfully by ${userOrgMSP} - ${userDepartment}`);
    return { transactionId: contractId };
  }

  // =========================================================================
  // ORG2 - TRANSPORT OPERATOR FUNCTIONS
  // =========================================================================
  /**
   * Adds a new transport transaction record.
   * Only Org2MSP with Transport Operator role can call this.
   *
   * @param {Context} ctx The transaction context
   * @param {string} transportData JSON string with transport details.
   * Expected data format: { "projectId": "<string>", "transportEmissions": <number>}
   */
  async UpdateTransportDetails(ctx, transportData) {
    const cid = new ClientIdentity(ctx.stub);
    const userOrgMSP = cid.getMSPID();
    const userDepartment = cid.getAttributeValue('department');

    if (userOrgMSP !== 'Org2MSP' || userDepartment !== 'Transport Operator') {
      throw new Error(`Unauthorized: Only 'Org2MSP' with 'Transport Operator' role can add transport details.`);
    }

    const data = JSON.parse(transportData);

    // Add a check for the projectId
    if (!data.projectId || typeof data.projectId !== 'string') {
      throw new Error('Invalid projectId: must be a non-empty string.');
    }

    if (typeof data.transportEmissions !== 'number' || data.transportEmissions < 0) {
      throw new Error('Invalid transportEmissions: must be a non-negative number.');
    }

    const txId = ctx.stub.getTxID();
    data.docType = CONTRACT_DOC_TYPE;
    data.createdBy = cid.getID();
    data.createdAt = new Date().toISOString();

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
   * @param {string} storageData JSON string with storage details.
   * Expected data format: { "projectId": "<string>", "storageLoss": <number>, "measurementUnit": "tonnes", "location": "..." }
   */
  async UpdateStorageDetails(ctx, storageData) {
    const cid = new ClientIdentity(ctx.stub);
    const userOrgMSP = cid.getMSPID();
    const userDepartment = cid.getAttributeValue('department');

    if (userOrgMSP !== 'Org3MSP' || userDepartment !== 'Storage Operator') {
      throw new Error(`Unauthorized: Only 'Org3MSP' with 'Storage Operator' role can add storage details.`);
    }

    const data = JSON.parse(storageData);

    // Add a check for the projectId
    if (!data.projectId || typeof data.projectId !== 'string') {
      throw new Error('Invalid projectId: must be a non-empty string.');
    }

    if (typeof data.storageLoss !== 'number' || data.storageLoss < 0) {
      throw new Error('Invalid storageLoss: must be a non-negative number.');
    }

    const txId = ctx.stub.getTxID();
    data.docType = CONTRACT_DOC_TYPE;
    data.createdBy = cid.getID();
    data.createdAt = new Date().toISOString();

    await ctx.stub.putState(txId, Buffer.from(JSON.stringify(data)));
    
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

    if (userOrgMSP !== 'Org4MSP' || userDepartment !== 'Project Developer') {
      throw new Error(`Unauthorized: Only 'Org4MSP' with 'Project Developer' role can add project details.`);
    }

    const data = JSON.parse(projectData);
    const txId = ctx.stub.getTxID();
    data.docType = CONTRACT_DOC_TYPE;
    data.createdBy = cid.getID();
    data.createdAt = new Date().toISOString();

    await ctx.stub.putState(txId, Buffer.from(JSON.stringify(data)));
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

    if (userOrgMSP !== 'Org5MSP' || userDepartment !== 'Regulator') {
      throw new Error(`Unauthorized: Only 'Org5MSP' with 'Regulator' role can add regulatory decisions.`);
    }

    const data = JSON.parse(regulatorData);
    const txId = ctx.stub.getTxID();
    data.docType = CONTRACT_DOC_TYPE;
    data.createdBy = cid.getID();
    data.createdAt = new Date().toISOString();

    await ctx.stub.putState(txId, Buffer.from(JSON.stringify(data)));
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

    if (userOrgMSP !== 'Org6MSP' || userDepartment !== 'Auditor') {
      throw new Error(`Unauthorized: Only 'Org6MSP' with 'Auditor' role can add audit records.`);
    }

    const data = JSON.parse(auditData);
    const txId = ctx.stub.getTxID();
    data.docType = CONTRACT_DOC_TYPE;
    data.createdBy = cid.getID();
    data.createdAt = new Date().toISOString();

    await ctx.stub.putState(txId, Buffer.from(JSON.stringify(data)));
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
  async ApproveOrDisapproveContractByProject(ctx, contractId, isApproved, comment) {
    const cid = new ClientIdentity(ctx.stub);
    const userOrgMSP = cid.getMSPID();
    const userDepartment = cid.getAttributeValue('department');

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
  async ApproveOrDisapproveContractByRegulator(ctx, contractId, isApproved, comment) {
    const cid = new ClientIdentity(ctx.stub);
    const userOrgMSP = cid.getMSPID();
    const userDepartment = cid.getAttributeValue('department');

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
  async ApproveOrDisapproveContractByAuditor(ctx, contractId, isApproved, comment) {
    const cid = new ClientIdentity(ctx.stub);
    const userOrgMSP = cid.getMSPID();
    const userDepartment = cid.getAttributeValue('department');

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

    console.info(`Contract ${contractId} ${contractData.approvalStatusByAuditor} by Auditor`);
    return { transactionId: contractId, status: contractData.approvalStatusByAuditor };
  }

  // =========================================================================
  // CARBON ACCOUNTING FUNCTIONS
  // =========================================================================
  /**
   * Calculates the net CO2 stored from raw data, without saving it to the chain.
   * This is a read-only (query) function intended for dynamic, off-chain reporting.
   * It takes the IDs of three records and returns a calculated value.
   *
   * @param {string} captureTxId The transaction ID of the Capture record (Org1)
   * @param {string} transportTxId The transaction ID of the Transport record (Org2)
   * @param {string} storageTxId The transaction ID of the Storage record (Org3)
   */
  async calculateCarbonStored(ctx, projectId, date) {
    if (!projectId || !date) {
      throw new Error('Both projectId and date must be provided.');
    }

    // Parse date as YYYY-MM-DD
    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
        throw new Error('Invalid date format, expected YYYY-MM-DD');
    }

    const startDate = new Date(parsedDate);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(parsedDate);
    endDate.setUTCHours(23, 59, 59, 999);

    const startISOString = startDate.toISOString();
    const endISOString = endDate.toISOString();

    // Query all Capture, Transport, Storage records for the project on that day
    const query = {
        selector: {
            docType: CONTRACT_DOC_TYPE,
            projectId: projectId,
            createdAt: { $gte: startISOString, $lte: endISOString }
        }
    };

    const resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(query));
    let totalCaptured = 0;
    let totalTransportEmissions = 0;
    let totalStorageLoss = 0;

    let res = await resultsIterator.next();
    while (!res.done) {
        if (res.value && res.value.value.toString()) {
            const record = JSON.parse(res.value.value.toString('utf8'));
            totalCaptured += record.capturedAmount || 0;
            totalTransportEmissions += record.transportEmissions || 0;
            totalStorageLoss += record.storageLoss || 0;
        }
        res = await resultsIterator.next();
    }

    const netCarbonCaptured = totalCaptured - totalTransportEmissions - totalStorageLoss;

    return {
        netCarbonCaptured,
        unit: "tonnes",
        calculatedAt: new Date().toISOString(),
        projectId,
        date
    };
  }

  /**
   * Calculates and saves the  cumulative value for a given project and month.
   * This function is restricted to Org6 (Auditor) and creates an immutable, on-chain record.
   *
   * @param {Context} ctx The transaction context
   * @param {string} projectId The unique identifier for the project.
   * @param {string} year The year for which the total is being finalized.
   */
  async monthlyCO2Stored(ctx, projectId, year, month) {
  // Only Org6 Auditors can finalize monthly CO2 storage
    const cid = new ClientIdentity(ctx.stub);
    if (cid.getMSPID() !== 'Org6MSP' || cid.getAttributeValue('department') !== 'Auditor') {
      throw new Error("Unauthorized: Only Org6 Auditors can finalize monthly CO₂ storage.");
    }

  // Validate year/month
    const parsedYear = parseInt(year, 10);
    const parsedMonth = parseInt(month, 10); // 1–12
    if (isNaN(parsedYear) || isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      throw new Error("Invalid year or month. Month must be 1–12.");
    }

  // Start/end of month in UTC
    const startDate = new Date(Date.UTC(parsedYear, parsedMonth - 1, 1, 0, 0, 0, 0)).toISOString();
    const endDate = new Date(Date.UTC(parsedYear, parsedMonth, 0, 23, 59, 59, 999)).toISOString();

  // Query all project records in that month
    const queryString = JSON.stringify({
      selector: {
      docType: CONTRACT_DOC_TYPE,
      projectId,
      createdAt: { $gte: startDate, $lte: endDate }
    }
  });

    const resultsIterator = await ctx.stub.getQueryResult(queryString);
    let totalNetCarbon = 0;
    
    let res = await resultsIterator.next();
    while (!res.done) {
      if (res.value && res.value.value.toString()) {
        const record = JSON.parse(res.value.value.toString('utf8'));
        const capturedAmount = record.capturedAmount || 0;
        const transportEmissions = record.transportEmissions || 0;
        const storageLoss = record.storageLoss || 0;
        totalNetCarbon += capturedAmount - transportEmissions - storageLoss;
      }
      res = await resultsIterator.next();
    }

  // Save finalized monthly record
    const resultId = `${projectId}-${parsedYear}-${parsedMonth}-finalized`;
    const finalResult = {
      docType: CONTRACT_DOC_TYPE,
      projectId,
      year: parsedYear,
      month: parsedMonth,
      totalNetCarbonCaptured: totalNetCarbon,
      unit: "tonnes",
      finalizedBy: cid.getID(),
      finalizedAt: new Date().toISOString(),
    };
    
    await ctx.stub.putState(resultId, Buffer.from(JSON.stringify(finalResult)));
    return finalResult;
  }

  /**
   * Calculates and saves the official cumulative value for a given project and year.
   * This function is restricted to Org6 (Auditor) and creates an immutable, on-chain record.
   *
   * @param {Context} ctx The transaction context
   * @param {string} projectId The unique identifier for the project.
   * @param {string} year The year for which the total is being finalized.
   */
  async annualCO2Stored(ctx, projectId, year) {
    // Only Org6 Auditors can finalize annual CO2 storage
    const cid = new ClientIdentity(ctx.stub);
    if (cid.getMSPID() !== 'Org6MSP' || cid.getAttributeValue('department') !== 'Auditor') {
        throw new Error("Unauthorized: Only Org6 Auditors can finalize annual CO2 storage.");
    }

    // Validate year format
    const parsedYear = parseInt(year, 10);
    if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 3000) {
        throw new Error('Invalid year format. Expected a number like 2025.');
    }

    // Construct start and end ISO dates for the year
    const startDate = new Date(Date.UTC(parsedYear, 0, 1, 0, 0, 0, 0)).toISOString();
    const endDate = new Date(Date.UTC(parsedYear, 11, 31, 23, 59, 59, 999)).toISOString();

    // Query all project records for the year
    const queryString = JSON.stringify({
        selector: {
            docType: CONTRACT_DOC_TYPE,
            projectId,
            createdAt: { $gte: startDate, $lte: endDate }
        }
    });

    const resultsIterator = await ctx.stub.getQueryResult(queryString);
    let totalNetCarbon = 0;

    let res = await resultsIterator.next();
    while (!res.done) {
        if (res.value && res.value.value.toString()) {
            const record = JSON.parse(res.value.value.toString('utf8'));
            const capturedAmount = record.capturedAmount || 0;
            const transportEmissions = record.transportEmissions || 0;
            const storageLoss = record.storageLoss || 0;
            totalNetCarbon += capturedAmount - transportEmissions - storageLoss;
        }
        res = await resultsIterator.next();
    }

    // Save finalized annual record on-chain
    const resultId = `${projectId}-${parsedYear}-finalized`;
    const finalResult = {
        docType: CONTRACT_DOC_TYPE,
        projectId,
        year: parsedYear,
        totalNetCarbonCaptured: totalNetCarbon,
        unit: "tonnes",
        finalizedBy: cid.getID(),
        finalizedAt: new Date().toISOString(),
    };

    await ctx.stub.putState(resultId, Buffer.from(JSON.stringify(finalResult)));
    return finalResult;
  }

  // =========================================================================
  // NEW QUERY FUNCTIONS
  // =========================================================================
  /**
   * Gets a list of all transactions for a specific projectId.
   * This function is for the backend to query all data related to a single project
   * to perform off-chain aggregation.
   *
   * @param {Context} ctx The transaction context
   * @param {string} projectId The unique identifier for the carbon accounting project.
   */
  async GetHistoryByProjectId(ctx, projectId) {
    if (!projectId) {
      throw new Error('A projectId must be provided.');
    }

    // Use a rich query to find all documents with a matching projectId
    const queryString = JSON.stringify({
      selector: {
        docType: CONTRACT_DOC_TYPE,
        projectId: projectId,
      },
    });

    return await this.getQueryResult(ctx, queryString);
  }

  /**
 * Query all records created within a date range, optionally filtered by projectId, with pagination.
 *
 * @param {Context} ctx The transaction context
 * @param {string} startDate ISO 8601 date string (e.g. "2025-01-01T00:00:00Z")
 * @param {string} endDate ISO 8601 date string (e.g. "2025-01-31T23:59:59Z")
 * @param {string} [projectId=null] Optional project ID to filter results
 * @param {number|string} pageSize Number of records per page
 * @param {string} [bookmark=''] Optional bookmark for pagination
 */
  async queryRecordsByDateRange(ctx, startDate, endDate, projectId = null, pageSize, bookmark = '') {
    if (!startDate || !endDate) {
      throw new Error('Both startDate and endDate must be provided in ISO format.');
    }
    
    const pageSizeInt = parseInt(pageSize, 10);
    if (isNaN(pageSizeInt) || pageSizeInt <= 0) {
      throw new Error('pageSize must be a positive integer.');
    }

  // Optional maximum page size limit (adjust as needed)
  const MAX_PAGE_SIZE = 1000;
  const finalPageSize = Math.min(pageSizeInt, MAX_PAGE_SIZE);

  // Build query selector
  const selector = {
    docType: CONTRACT_DOC_TYPE,
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  };

  if (projectId) {
    selector.projectId = projectId;
  }

  // Add sorting by createdAt to ensure consistent order
  const queryString = JSON.stringify({
    selector,
    sort: [{ createdAt: 'asc' }],
  });

  try {
    const { iterator, metadata } = await ctx.stub.getQueryResultWithPagination(queryString, finalPageSize, bookmark);
    const results = await this.getAllResults(iterator, false);

    return JSON.stringify({
      data: results,
      metadata: {
        fetchedRecordsCount: metadata.fetchedRecordsCount,
        bookmark: metadata.bookmark,
      },
    });
  } catch (err) {
    throw new Error(`Failed to query records by date range: ${err.message}`);
  }
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
      const assetJSON = await ctx.stub.getState(id);
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
    console.log('Raw ledger response:', JSON.stringify(data, null, 2));
    return JSON.stringify(finalData);
  }
}

module.exports = CcsChaincode;
