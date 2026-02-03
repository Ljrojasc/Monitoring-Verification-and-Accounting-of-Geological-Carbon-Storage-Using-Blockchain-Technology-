/**
 * Converts numeric orgId (e.g. 1, 2) to Fabric MSP ID string (e.g. "Org1MSP")
 * @param {number|string} orgId
 * @returns {string} Fabric MSP ID
 */
function getMSPFromOrgId(orgId) {
  return `Org${orgId}MSP`;
}

module.exports = {
  getMSPFromOrgId,
};
