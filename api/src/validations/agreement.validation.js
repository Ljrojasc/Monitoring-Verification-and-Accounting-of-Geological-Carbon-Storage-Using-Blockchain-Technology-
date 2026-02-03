const Joi = require('joi');
const { USER_DEPARTMENT, APPROVAL_STATUS } = require('../utils/Constants');
const { objectId } = require('./custom.validation'); // Assuming objectId is defined here

// Validation schema for Org1 (Capture Operator) to create a new contract
const createCaptureContract = { 
  body: Joi.object().keys({
    projectId: Joi.string().required(), // New: now a required field
    startDate: Joi.date().timestamp().required(),
    endDate: Joi.date().timestamp().required(),
    comment: Joi.string().required(),
    csource: Joi.string().required(),
    capturedAmount: Joi.number().required(), // Corrected to expect a number
  })
};

// New validation schema for Org2 (Transport Operator) to update transport details
const updateTransportDetails = {
  body: Joi.object().keys({
    contractId: Joi.string().custom(objectId).required(),
    transportData: Joi.object().keys({
      vcreceived: Joi.number().required(), // Corrected to expect a number
      transportEmissions: Joi.number().required(),
      comment: Joi.string().optional(),
    }).required(),
  }),
};

// New validation schema for Org3 (Storage Operator) to update storage details
const updateStorageDetails = {
  body: Joi.object().keys({
    contractId: Joi.string().custom(objectId).required(),
    storageData: Joi.object().keys({
      injectedAmount: Joi.number().required(),
      storageLoss: Joi.number().required(),
      comment: Joi.string().optional(),
    }).required(),
  }),
};

const approveAgreement = {
  body: Joi.object().keys({
    action: Joi.string().required(),
    comment: Joi.string().required(),
    status: Joi.string().required().valid(APPROVAL_STATUS.APPROVED, APPROVAL_STATUS.REJECTED, APPROVAL_STATUS.OTHER)
  }),
};

const getAgreementById = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

const getSignedURL = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

const getAgreementApprovals = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

// === New validation schema for the getProjectHistory endpoint ===
const getProjectHistory = {
  params: Joi.object().keys({
    projectId: Joi.string().required(),
  }),
};

// ======================
// Carbon Accounting Validations
// ======================

const calculateCarbonStored = {
  query: Joi.object().keys({
    projectId: Joi.string().required(),
    date: Joi.string().isoDate().required() // expects ISO 8601 date, e.g., "2025-09-08"
  }),
};

const annualCO2Stored = {
  body: Joi.object().keys({
    projectId: Joi.string().required(),
    year: Joi.string()
      .pattern(/^\d{4}$/) // 4-digit year
      .required()
  }),
};

const monthlyCO2Stored = {
  body: Joi.object().keys({
    projectId: Joi.string().required(),
    year: Joi.string()
      .pattern(/^\d{4}$/) // 4-digit year, e.g. "2025"
      .required(),
    month: Joi.number()
      .integer()
      .min(1)
      .max(12)
      .required() // 1 = January ... 12 = December
  }),
};



module.exports = {
  createCaptureContract,
  updateTransportDetails,
  updateStorageDetails,
  approveAgreement,
  getAgreementApprovals,
  getAgreementById,
  getSignedURL,
  getProjectHistory,
  calculateCarbonStored,
  annualCO2Stored,
  monthlyCO2Stored,

  
};


