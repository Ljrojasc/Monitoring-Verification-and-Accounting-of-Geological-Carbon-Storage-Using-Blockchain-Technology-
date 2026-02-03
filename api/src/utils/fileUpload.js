const multer = require('multer');
const fs = require('fs');
const path = require('path');
const aws = require('aws-sdk');
require('dotenv').config();
const httpStatus = require('http-status');
const config = require('../config/config');
const { getSuccessResponse } = require('./Response');

const logger = require('../logger')(module);

const getDataHash = (data) => {
  try {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha1');
    hash.setEncoding('hex');
    hash.write(data);
    hash.end();
    return hash.read();
  } catch (error) {
    console.log(`Error occurred while creating file data hash: Error: ${error}`);
    return null;
  }
};

aws.config.update({
  secretAccessKey: config.awsSecretAccess,
  accessKeyId: config.awsAccessKey,
  signatureVersion: 'v4',
  region: 'us-west-2',
});
const s3 = new aws.S3();

// 5MB Max File size allowed
const fileSizeLimit = 5242880;

const upload = multer({
  storage: multer.diskStorage({
    destination: function (_req, _file, cb) {
      cb(null, path.resolve(__dirname, '../../', 'uploads'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const extension = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
    },
  }),
  limits: { fileSize: fileSizeLimit },
  fileFilter: (req, file, cb) => {
    // Use req.user, fallback to null if missing (just for safe logging)
    logger.info({ userInfo: req.user || null, method: 'Upload', fileMimeType: file.mimetype });
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      return cb(new Error('Only .pdf format allowed!'));
    }
  },
});

const imageUpload = upload.fields([{ name: 'agreement', maxCount: 1 }]);

exports.uploadFileToS3 = async (req, res, next) => {
  logger.info({ userInfo: req.user || null, method: 'uploadFileToS3' });
  imageUpload(req, res, async (err) => {
    try {
      if (!req.user || !req.user.orgId) {
        logger.error({ userInfo: req.user || null, method: 'uploadFileToS3', error: 'Missing user or orgId in request' });
        return res.status(httpStatus.UNAUTHORIZED).send(getSuccessResponse(httpStatus.UNAUTHORIZED, 'User authentication information missing'));
      }
      let org = `org${req.user.orgId}`;
      if (err) {
        logger.error({ userInfo: req.user, method: 'uploadFileToS3', error: 'Error in imageUpload : ' + err });
        if (err.message === 'Unexpected field') {
          err.message = 'Invalid number of files / Invalid key in form data';
        }
        return res.status(httpStatus.FORBIDDEN).send(getSuccessResponse(httpStatus.FORBIDDEN, err.message));
      }
      if (!req.files?.agreement?.length) {
        logger.error({ userInfo: req.user, method: 'uploadFileToS3', error: 'No files selected' });
        return res.status(httpStatus.FORBIDDEN).send(getSuccessResponse(httpStatus.FORBIDDEN, 'No files selected'));
      }
      
      let fileMetadata = await uploadFile(req.files.agreement[0], org);
      logger.info({ userInfo: req.user, method: 'uploadFileToS3', info: fileMetadata });
      
      req.body.fileMetadata = fileMetadata;
      next();
    } catch (error) {
      logger.error({
        userInfo: req.user || null,
        method: 'uploadDocument',
        errorMessage: error.message || error.toString(),
        errorStack: error.stack || 'No stack trace',
        errorRaw: error,
      });
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send(getSuccessResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Unknown error'));
    }
  });
};

const BUCKET_NAME = config.awsPrivateBucketName;
const BUCKET_ACL = 'authenticated-read';
const BUCKET_URL = `https://${BUCKET_NAME}.s3.amazonaws.com`;
const URL_EXPIRY_TIME = 3600;

exports.getSignedUrl = async (docID, orgName) => {
  return s3.getSignedUrlPromise('getObject', {
    Bucket: BUCKET_NAME + `/${orgName}`,
    Key: docID,
    Expires: URL_EXPIRY_TIME,
  });
};

const uploadFile = async (data, orgName) => {
  console.log('uploadFile data:', data);
  if (!data.path) throw new Error('File path missing in uploadFile data');
  
  const fileData = fs.readFileSync(data.path);
  const originalFileName = data.originalname;
  let dataHash = getDataHash(fileData);
  const fileName = dataHash + '-' + originalFileName;
  let params = {
    Bucket: BUCKET_NAME + `/${orgName}`,
    Key: fileName,
    ACL: BUCKET_ACL,
    ContentType: data.mimetype,
    Body: fileData
  };
  let fileUrl = `${BUCKET_URL}/${fileName}`;
  await s3.putObject(params).promise();
  return {
    id: fileName,
    orgName,
    name: originalFileName.replace(/\.[^/.]+$/, ''),
    url: fileUrl,
    contentHash: dataHash
  };
};

module.exports.imageUpload = imageUpload;
module.exports.uploadFile = uploadFile;
