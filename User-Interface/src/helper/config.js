// exports.const= {
//     API_BASE_URL='localhost:3001/api/v2'
// }

let BASE_URL= process.env.REACT_APP_BASE_URL || "http://localhost:3000/v1"

export const routes = {  //All the API endpoints built from BASE_URL
    register: `${BASE_URL}/users`,
    login: `${BASE_URL}/auth/login`,
    registerUser: `${BASE_URL}/auth/register`,
    getUserList: `${BASE_URL}/users`,
    updateUserStatus:`${BASE_URL}/users/`,

    //Transactions
    getAgreements: `${BASE_URL}/agreements`,
    createAgreement: `${BASE_URL}/agreements`,
    agreementsCapture: `${BASE_URL}/agreements/capture`,
    agreementsTransport: `${BASE_URL}/agreements/transport`,
    agreementsStorage: `${BASE_URL}/agreements/storage`,
    agreementsProjectDeveloper: `${BASE_URL}/agreements/project`,
    agreementsRegulator: `${BASE_URL}/agreements/regulator`,
    agreementsAudit: `${BASE_URL}/agreements/audit`,

    //Carbon Accounting
    agreementsCarbonAccounting: `${BASE_URL}/agreements/carbonaccounting`,

    
    getApprovals: `${BASE_URL}/agreements/approvals/`,
    approveAgreement: `${BASE_URL}/agreements/approvals/`,
    getAgreementHistory: `${BASE_URL}/agreements/history`,
    approveOrg4: `${BASE_URL}/agreements/project/approvals/:id`,
    approveOrg5: `${BASE_URL}/agreements/regulator/approvals/:id`,
    approveOrg6: `${BASE_URL}/agreements/audit/approvals/:id`,

    activateUser: `${BASE_URL}/users/activate`,
    deActivateUser:`${BASE_URL}/users/deactivate`,
    // getAllContracts: `${BASE_URL}/fabric/channels/mychannel/chaincodes/contract_cc?args=['1']&fcn=GetContractsForQuery`,
    // getExpiringContracts: `${BASE_URL}/fabric/channels/mychannel/chaincodes/contract_cc?args=['1']&fcn=GetInProgressContract`,
    // addContract:`${BASE_URL}/fabric/channels/mychannel/chaincodes/contract_cc`,
    // getContractHistory: `${BASE_URL}/fabric/channels/mychannel/chaincodes/contract_cc?fcn=GetHistoryForAsset&`
}

export const headers = () => {
  const token = localStorage.getItem("token");

  const config = {
    headers: {
      "Content-Type": "application/json"
    }
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};


