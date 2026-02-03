const Joi = require('joi');
const { ORG_DEPARTMENT } = require('../utils/Constants');
const { password } = require('./custom.validation');

//These are required for the signup part of the user 
const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    department: Joi.string().required().valid(ORG_DEPARTMENT.CAPTUREOPERATOR, ORG_DEPARTMENT.TRANSPORTOPERATOR, ORG_DEPARTMENT.STORAGEOPERATOR, ORG_DEPARTMENT.PROJECTDEVELOPER, ORG_DEPARTMENT.REGULATORYENTITY, ORG_DEPARTMENT.THIRDPARTY),
    orgId: Joi.number().required()
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};



module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
};
