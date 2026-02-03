const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, agreementService } = require('../services');
const { getPagination } = require('../utils/pagination');
const { getSuccessResponse } = require('../utils/Response');


/**
 * Unified function to create a new agreement/transaction based on the user's department.
 * This function acts as a router, calling the appropriate service function for the user's role.
 */
/**
 * Unified function to create a new agreement/transaction based on the user's department.
 * This function acts as a router, calling the appropriate service function for the user's role.
 */
const createAgreement = catchAsync(async (req, res) => {
  const user = req.user;
  const fileMetadata = req.body.fileMetadata;
  let result;
  let successMessage;

  console.log('============user========', user);

  // Check the user's department to route the request to the correct service function
  switch (user.department) {
    case 'Capture Operator':
      result = await agreementService.createCaptureContract(req.body, fileMetadata, user);
      successMessage = 'Transaction created successfully by Capture Operator';
      break;
    case 'Transport Operator':
      result = await agreementService.updateTransportDetails(req.body, fileMetadata, user);
      successMessage = 'Transaction created successfully by Transport Operator';
      break;
    case 'Storage Operator':
      result = await agreementService.updateStorageDetails(req.body, fileMetadata, user);
      successMessage = 'Transaction created successfully by Storage Operator';
      break;
    case 'Project Developer':
      result = await agreementService.addProjectDetails(req.body, fileMetadata, user);
      successMessage = 'Project transaction created successfully by Project Developer';
      break;
    case 'Regulator':
      result = await agreementService.addRegulatoryDecision(req.body, fileMetadata, user);
      successMessage = 'Regulatory transaction created successfully by Regulator';
      break;
    case 'Auditor':
      result = await agreementService.addAuditRecord(req.body, fileMetadata, user);
      successMessage = 'Audit transaction created successfully by Auditor';
      break;
    default:
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid user department for this operation');
  }

  res.status(httpStatus.CREATED).send(getSuccessResponse(httpStatus.CREATED, successMessage, result));
});


// Unified function to approve/disapprove a transaction
const approveAgreement = catchAsync(async (req, res) => {
  const user = req.user;
  const agreementId = req.params.id;
  const { action, comment } = req.body;

  if (!user || !user.email) {
    return res.status(401).json({ message: 'Unauthorized: user info missing' });
  }

  // The service function expects a boolean for isApproved
  const isApproved = action === 'Approve';
  let result;

  // Use a switch statement to route to the correct service function based on user's department
  switch (user.department) {
    case 'Project Developer':
      result = await agreementService.approveProject(agreementId, isApproved, comment, user);
      break;
    case 'Regulator':
      // The `approveRegulator` service function expects `approvalData` as the first argument,
      // so we construct it here.
      const regulatorApprovalData = { isApproved, comment };
      result = await agreementService.approveRegulator(regulatorApprovalData, agreementId, user);
      break;
    case 'Auditor':
      // The `approveAuditor` service function expects `approvalData` as the first argument,
      // so we construct it here.
      const auditorApprovalData = { isApproved, comment };
      result = await agreementService.approveAuditor(auditorApprovalData, agreementId, user);
      break;
    default:
      // If the user's role cannot approve agreements, return a 403 Forbidden error.
      return res.status(httpStatus.FORBIDDEN).send(
        new ApiError(httpStatus.FORBIDDEN, 'Your role is not authorized to approve agreements')
      );
  }

  res.status(httpStatus.OK).send(
    getSuccessResponse(
      httpStatus.OK,
      `Transaction ${agreementId} ${isApproved ? 'approved' : 'disapproved'} successfully`,
      result
    )
  );
});


const getSignedURL = catchAsync(async (req, res) => {
  //let { user } = req.loggerInfo;
  let user = req.user;
  let docId = req.params.id;
  let url = await agreementService.getDocSignedURL(docId, user);
  res
    .status(httpStatus.OK)
    .send(getSuccessResponse(httpStatus.OK, 'Signed URL fetched successfully', { signedURL: url, docId }));
});

const getAgreements = catchAsync(async (req, res) => {
  const { pageSize, bookmark, filterType } = req.query;

  // Get logged-in user's info
  const { orgId, email } = req.user;
  const orgName = `org${orgId}`;

  // Build filter object for the service
  const filter = {
    orgId: parseInt(orgId),
    pageSize: pageSize ? parseInt(pageSize) : 10,
    bookmark: bookmark || '',
    orgName,
    email,
    filterType,
  };

  console.log('Controller: Agreement filter:', filter);

  // Query agreements from blockchain
  let data = await agreementService.queryAgreements(filter);

  // Add a new console log here to see the raw data from the service
  console.log('Controller: Raw data from service:', JSON.stringify(data, null, 2));

  // Step 1: Check if data.data exists and is an array
  if (data?.data && Array.isArray(data.data)) {
    // Step 2: Flatten data and attach the unique 'Key' as the 'id'
    data.data = data.data.map((elm) => {
      // The `Key` is the unique ID from the blockchain.
      // We explicitly create a new 'id' property from the 'Key'
      // to ensure the frontend has a valid unique ID.
      return {
        ...elm.Record,
        id: elm.Key,
      };
    });
  }

  // Send response
  res.status(httpStatus.OK).send(
    getSuccessResponse(httpStatus.OK, 'Agreements fetched successfully', data)
  );
});

const getHistoryById = catchAsync(async (req, res) => {
  const { id } = req.params;
  let user = req.user;
  let data = await agreementService.queryHistoryById(id, user);

  res.status(httpStatus.OK).send(getSuccessResponse(httpStatus.OK, 'Agreement fetched successfully', data));
});

const getApprovalsByAgreementId = catchAsync(async (req, res) => {
  const { pageSize, bookmark } = req.query;
  const agreementId = req.params.id;
  let { orgId, email } = req.user;
  let orgName = `org${orgId}`;

  let filter = {
    orgId: parseInt(req.user.orgId),
    pageSize: pageSize || "10",
    bookmark: bookmark || '',
    orgName,
    email,
    agreementId,
  };

  let data = await agreementService.queryApprovalsByAgreementId(filter);
  data = data.data.map((elm) => elm.Record);
  res.status(httpStatus.OK).send(getSuccessResponse(httpStatus.OK, 'Users fetched successfully', { approvals: data }));
});

const getAgreementById = catchAsync(async (req, res) => {
  const { id } = req.params;
  let user = req.user;
  let data = await agreementService.queryAgreementById(id, user);

  res.status(httpStatus.OK).send(getSuccessResponse(httpStatus.OK, 'Agreement fetched successfully', data));
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.status(httpStatus.OK).send(getSuccessResponse(httpStatus.OK, 'User fetched successfully', user));
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});


// =========================
// NEW: CCS Controller Methods
// =========================
// =========================================================================
// ORG1 - Create Capture Contract
// =========================================================================
const createCaptureContract = catchAsync(async (req, res) => {
  const user = req.user;

  // Enforce access control at API level (optional but recommended)
  if (user.department !== 'Capture Operator' || (user.orgId !== '1' && user.orgId !== 1)) {
    return res.status(403).json({
      message: "Forbidden: Only Org1 Capture Operators can submit capture transactions.",
    });
  }
  const agreementData = req.body;
  const fileMetadata = req.body.fileMetadata || null;

  const result = await agreementService.createCaptureContract(
    agreementData,
    fileMetadata,
    user
  );

  res.status(201).json({
    message: 'Transaction created successfully by Capture Operator',
    txId: result.transactionId, // returns ctx.stub.getTxID()
    data: agreementData,
  });
});

// =========================================================================
// ORG2 - Update Transport Details
// =========================================================================
const updateTransportDetails = catchAsync(async (req, res) => {
  const user = req.user;

  // Access control
  if (user.department !== 'Transport Operator' || (user.orgId !== '2' && user.orgId !== 2)) {
    return res.status(403).json({
      message: "Forbidden: Only Org2 Transport Operators can submit transport details.",
    });
  }
  const transportData = req.body;
  const fileMetadata = req.body.fileMetadata || null;

  const result = await agreementService.updateTransportDetails(
    transportData,
    fileMetadata,
    user);

  res.status(201).json({
    message: 'Transaction created successfully by Transport Operator',
    txId: result.transactionId,
    data: transportData,
  });
});

// =========================================================================
// ORG3 - Update Storage Details
// =========================================================================
const updateStorageDetails = catchAsync(async (req, res) => {
  const user = req.user;

  // Access control
  if (user.department !== 'Storage Operator' || (user.orgId !== '3' && user.orgId !== 3)) {
    return res.status(403).json({
      message: "Forbidden: Only Org3 Storage Operators can submit transport details.",
    });
  }
  const storageData = req.body;
  const fileMetadata = req.body.fileMetadata || null;

  const result = await agreementService.updateStorageDetails(
    storageData,
    fileMetadata,
    user);

  res.status(201).json({
    message: 'Transaction created successfully by Storage Operator',
    txId: result.transactionId,
    data: storageData,
  });
});


// =========================================================================
// ORG4 - Project Developer: Create Project Data
// =========================================================================
const addProjectDetails = catchAsync(async (req, res) => {
  const user = req.user;

  // Access control
  if (user.department !== 'Project Developer' || (user.orgId !== '4' && user.orgId !== 4)) {
    return res.status(403).json({
      message: "Forbidden: Only Org4 Project Developers can submit project transactions.",
    });
  }

  const projectData = req.body;
  const fileMetadata = req.body.fileMetadata || null;

  const result = await agreementService.addProjectDetails(
    projectData,
    fileMetadata,
    user
  );

  res.status(201).json({
    message: 'Project transaction created successfully by Project Developer',
    txId: result.transactionId,
    data: projectData,
  });
});

// =========================================================================
// ORG5 - Regulator: Add Regulatory Data
// =========================================================================
const addRegulatoryDecision = catchAsync(async (req, res) => {
  const user = req.user;

  // Access control
  if (user.department !== 'Regulator' || (user.orgId !== '5' && user.orgId !== 5)) {
    return res.status(403).json({
      message: "Forbidden: Only Org5 Regulators can submit regulatory data.",
    });
  }

  const regulatorData = req.body;
  const fileMetadata = req.body.fileMetadata || null;

  const result = await agreementService.addRegulatoryDecision(
    regulatorData,
    fileMetadata,
    user
  );

  res.status(201).json({
    message: 'Regulatory transaction created successfully by Regulator',
    txId: result.transactionId,
    data: regulatorData,
  });
});

// =========================================================================
// ORG6 - Auditor / Third Party: Add Audit / Verification Data
// =========================================================================
const addAuditRecord = catchAsync(async (req, res) => {
  const user = req.user;

  // Access control
  if (user.department !== 'Auditor' || (user.orgId !== '6' && user.orgId !== 6)) {
    return res.status(403).json({
      message: "Forbidden: Only Org6 Auditors can submit audit/verification data.",
    });
  }

  const auditData = req.body;
  const fileMetadata = req.body.fileMetadata || null;

  const result = await agreementService.addAuditRecord(
    auditData,
    fileMetadata,
    user
  );

  res.status(201).json({
    message: 'Audit transaction created successfully by Auditor',
    txId: result.transactionId,
    data: auditData,
  });
});

// =========================================================================
// ORG6 - Auditor / Third Party: Calculate Carbon Credits
// =========================================================================
// =========================================================================
// GET /carbonaccounting/calculate?projectId=...&date=YYYY-MM-DD
// =========================================================================
const calculateCarbonStored = async (req, res) => {
  try {
    const { projectId, date } = req.query;

    if (!projectId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required query parameters: projectId, date',
      });
    }

    const result = await agreementService.calculateCarbonStored(
      projectId,
      date,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Daily CO₂ stored calculated successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error in calculateCarbonStored controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to calculate CO₂ stored',
    });
  }
};

// =========================================================================
// POST /carbonaccounting/monthly
// Body: { projectId, year, month }
// =========================================================================
const monthlyCO2Stored = async (req, res) => {
  try {
    const { projectId, year, month } = req.body;

    if (!projectId || !year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Missing required body parameters: projectId, year, month',
      });
    }

    const result = await agreementService.monthlyCO2Stored(
      projectId,
      year,
      month,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Monthly CO2 stored finalized successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error in monthlyCO2Stored controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to finalize monthly CO2 stored',
    });
  }
};

// =========================================================================
// POST /carbonaccounting/annual
// Body: { projectId, year }
// =========================================================================
const annualCO2Stored = async (req, res) => {
  try {
    const { projectId, year } = req.body;

    if (!projectId || !year) {
      return res.status(400).json({
        success: false,
        message: 'Missing required body parameters: projectId, year',
      });
    }

    const result = await agreementService.annualCO2Stored(
      projectId,
      year,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Annual CO2 stored finalized successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error in annualCO2Stored controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to finalize annual CO2 stored',
    });
  }
};

// =========================================================================
// ORG6 - Auditor / Third Party: Get Project History
// =========================================================================
const getProjectHistory = catchAsync(async (req, res) => {
  const user = req.user;
  
  // Access control: Only auditors can query project history
  if (user.department !== 'Auditor' || (user.orgId !== '6' && user.orgId !== 6)) {
    return res.status(httpStatus.FORBIDDEN).json({
      message: "Forbidden: Only Org6 Auditors can access this resource.",
    });
  }

  //console.log('User object received in controller:', req.user);


  const { projectId } = req.params;
  // This line was causing the error because the function was not marked async
  // The line was also only passing the user's orgId, not the full user object
  // which caused the next error you saw
  // const result = await agreementService.getProjectHistory(projectId, userOrgId);

  // Here is the corrected line:
  const result = await agreementService.getProjectHistory(projectId, user);

  res.status(httpStatus.OK).json({
    message: 'Project history fetched successfully',
    data: result.data,
  });
});


// =========================================================================
// ORG4 - Project Developer: Approve / Disapprove Transaction
// =========================================================================
const approveProject = catchAsync(async (req, res) => {
  const agreementId = req.params.id;

  // Get user info from auth middleware
  const user = req.user;
  if (!user || !user.email) {
    return res.status(401).json({ message: 'Unauthorized: user info missing' });
  }

  // Access control
  if (user.department !== 'Project Developer' || (user.orgId !== '4' && user.orgId !== 4)) {
    return res.status(403).json({
      message: "Forbidden: Only Org4 Project Developers can approve/disapprove transactions.",
    });
  }

  // Extract action from request
  const action = req.body.action; // Expected: "Approve" or "Disapprove"
  const comment = req.body.comment || '';

  if (!action || (action !== 'Approve' && action !== 'Disapprove')) {
    return res.status(400).json({ message: 'Invalid action: must be "Approve" or "Disapprove"' });
  }

  const isApproved = action === 'Approve';

  // Call service
  const result = await agreementService.approveProject(
    agreementId,
    isApproved,
    comment,
    user
  );

  res.status(httpStatus.OK).send(
    getSuccessResponse(
      httpStatus.OK,
      `Transaction ${agreementId} ${isApproved ? 'approved' : 'disapproved'} successfully by Project Developer`,
      result
    )
  );
});

// =========================================================================
// ORG5 - Regulator: Approve / Disapprove Transaction
// =========================================================================
const approveRegulator = catchAsync(async (req, res) => {
  const agreementId = req.params.id;

  // Get user info either from auth middleware or fallback to request body
  const user = req.user || {
    email: req.body.approverEmail,
    department: req.body.department || 'Regulator',
    orgId: req.body.orgId || '5'
  };

  // Access control: only Org5 Regulators
  if (user.department !== 'Regulator' || (user.orgId !== '5' && user.orgId !== 5)) {
    return res.status(403).json({
      message: "Forbidden: Only Org5 Regulators can approve/disapprove transactions.",
    });
  }

  // Build approval payload
  const approvalData = {
    isApproved: req.body.isApproved,   // boolean true/false
    comment: req.body.comment,
    approverEmail: user.email
  };

  // Call service
  const result = await agreementService.approveRegulator(
    approvalData,
    agreementId,
    user
  );

  // Send response
  res.status(httpStatus.OK).send(
    getSuccessResponse(
      httpStatus.OK,
      `Transaction ${agreementId} ${approvalData.isApproved ? 'approved' : 'disapproved'} successfully by Regulator`,
      result
    )
  );
});

// =========================================================================
// ORG6 - Auditor: Approve / Disapprove Transaction
// =========================================================================
const approveAuditor = catchAsync(async (req, res) => {
  const agreementId = req.params.id;

  // Get user info from auth middleware or fallback to request body
  const user = req.user || {
    email: req.body.approverEmail,
    department: req.body.department || 'Auditor',
    orgId: req.body.orgId || '6'
  };

  // Access control
  if (user.department !== 'Auditor' || (user.orgId !== '6' && user.orgId !== 6)) {
    return res.status(403).json({
      message: "Forbidden: Only Org6 Auditors can approve/disapprove transactions.",
    });
  }

  // Build approval payload
  const approvalData = {
    isApproved: req.body.isApproved,   // boolean true/false
    comment: req.body.comment,
    approverEmail: user.email
  };

  // Call service
  const result = await agreementService.approveAuditor(
    approvalData,
    agreementId,
    user
  );

  // Send response
  res.status(httpStatus.OK).send(
    getSuccessResponse(
      httpStatus.OK,
      `Transaction ${agreementId} ${approvalData.isApproved ? 'approved' : 'disapproved'} successfully by Auditor`,
      result
    )
  );
});




// =========================
// Export
// =========================

module.exports = {
  createAgreement,
  getAgreements,
  getUser,
  updateUser,
  deleteUser,
  getAgreementById,
  approveAgreement,
  getApprovalsByAgreementId,
  getSignedURL,
  getHistoryById,
  createCaptureContract,
  updateTransportDetails,
  updateStorageDetails,
  addProjectDetails,
  addRegulatoryDecision,
  addAuditRecord,
  approveProject,
  approveRegulator,
  approveAuditor,
  calculateCarbonStored,
  annualCO2Stored,
  getProjectHistory,
  monthlyCO2Stored,
};

