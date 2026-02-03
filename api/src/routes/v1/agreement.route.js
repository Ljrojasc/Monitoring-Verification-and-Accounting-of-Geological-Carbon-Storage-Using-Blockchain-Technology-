const express = require('express');
const { auth } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const agreementValidation = require('../../validations/agreement.validation');
const agreementController = require('../../controllers/agreement.controller');
const { uploadFileToS3 } = require('../../utils/fileUpload');

const router = express.Router();

// ======================
// Existing Agreement Routes
// ======================

router
  .route('/:id')
  .get(auth, validate(agreementValidation.getAgreementById), agreementController.getAgreementById);

router
  .route('/documents/:id')
  .get(auth, validate(agreementValidation.getSignedURL), agreementController.getSignedURL);

router
  .route('/approvals/:id')
  .post(auth, validate(agreementValidation.approveAgreement), agreementController.approveAgreement)
  .get(auth, validate(agreementValidation.getAgreementApprovals), agreementController.getApprovalsByAgreementId);

router
  .route('/history/:id')
  .get(auth, validate(agreementValidation.getAgreementApprovals), agreementController.getHistoryById);

router
  .route('/')
  .post(auth, uploadFileToS3, agreementController.createAgreement)
  .get(auth, agreementController.getAgreements);

// ======================
// NEW: CCS Workflows by Role
// ======================

// ======================
// Org1 - Capture Operator: Create capture record
// ======================
router
  .route('/capture')
  .post(auth, uploadFileToS3, validate(agreementValidation.capture),agreementController.createCaptureContract);

// ======================
// Org2 - Transport Operator: Create transport data
// ======================
router
  .route('/transport')
  .post(auth, uploadFileToS3, validate(agreementValidation.transport), agreementController.updateTransportDetails);

// ======================
// Org3 - Storage Operator: Create storage data
// ======================
router
  .route('/storage')
  .post(auth, uploadFileToS3, validate(agreementValidation.storage), agreementController.updateStorageDetails);

// ======================
// Org4 - Project Developer: Create project data
// ======================
router
  .route('/project')
  .post(auth, uploadFileToS3, validate(agreementValidation.project), agreementController.addProjectDetails);

// ======================
// Org5 - Regulator: Add regulatory data
// ======================
router
  .route('/regulator')
  .post(auth, uploadFileToS3, validate(agreementValidation.regulator), agreementController.addRegulatoryDecision);

// ======================
// Org6 - Auditor or Third Party: Add audit/verification data
// ======================
router
  .route('/audit')
  .post(auth, uploadFileToS3, validate(agreementValidation.audit), agreementController.addAuditRecord);

// ======================
// Approval/Disapproval Routes for Orgs 4, 5, 6
// ======================

// Approvals by Project Developer (Org4)
router
  .route('/project/approvals/:id')
  .post(auth, validate(agreementValidation.approveProject), agreementController.approveProject)
  .get(auth, validate(agreementValidation.getAgreementApprovals), agreementController.getApprovalsByAgreementId);


// Approvals by Regulator (Org5)
router
  .route('/regulator/approvals/:id')
  .post(auth, validate(agreementValidation.approveRegulator), agreementController.approveRegulator)
  .get(auth, validate(agreementValidation.getAgreementApprovals), agreementController.getApprovalsByAgreementId);

// Approvals by Auditor/Org6
router
  .route('/audit/approvals/:id')
  .post(auth, validate(agreementValidation.approveAuditor), agreementController.approveAuditor)
  .get(auth, validate(agreementValidation.getAgreementApprovals), agreementController.getApprovalsByAgreementId);

// ======================
// CARBON ACCOUNTING ROUTES
// ======================

// Calculate net CO2 stored (read-only)
router
  .route('/carbonaccounting/calculate')
  .get(auth, validate(agreementValidation.calculateCarbonStored), agreementController.calculateCarbonStored);

// MOnthly CO2 stored (on-chain, only Org6 Auditors)
router
  .route('/carbonaccounting/monthly')
  .post(auth,validate(agreementValidation.monthlyCO2Stored),agreementController.monthlyCO2Stored);

// Finalize annual CO2 stored (on-chain, only Org6 Auditors)
router
  .route('/carbonaccounting/annual')
  .post(auth,validate(agreementValidation.annualCO2Stored),agreementController.annualCO2Stored);

router
  .route('/project/history/:projectId')
  .get(auth, validate(agreementValidation.getProjectHistory), (req, res, next) => {
    // === ADD THIS LINE ===
    console.log('User object received in router:', req.user);
    // =====================
    agreementController.getProjectHistory(req, res, next);
  });

  
  
  
  

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and retrieval
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a user
 *     description: Only admins can create other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *               role:
 *                  type: string
 *                  enum: [user, admin]
 *             example:
 *               name: fake name
 *               email: fake@example.com
 *               password: password1
 *               role: user
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all users
 *     description: Only admins can retrieve all users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: User name
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: User role
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of users
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user
 *     description: Logged in users can fetch only their own user information. Only admins can fetch other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a user
 *     description: Logged in users can only update their own information. Only admins can update other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *             example:
 *               name: fake name
 *               email: fake@example.com
 *               password: password1
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a user
 *     description: Logged in users can delete only themselves. Only admins can delete other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
