'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class DailyTransactionsWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.PROJECT_ID = 'Project_1';
        // We set the total transactions per organization per worker to 8.
        // With 3 workers, this will result in a total of 24 transactions per organization.
        this.TRANSACTIONS_PER_ORG_PER_WORKER = 20;
        this.transactionsQueue = [];

        // Org users (keys match MSP IDs from network file)
        this.orgUsers = {
            Org1MSP: ['User1'],
            Org2MSP: ['User2'],
            Org3MSP: ['User3']
        };

        // Corresponding chaincode functions per org
        this.orgFunctions = {
            Org1MSP: 'CreateCaptureContract',
            Org2MSP: 'UpdateTransportDetails',
            Org3MSP: 'UpdateStorageDetails'
        };

        this.contractId = 'ccschaincode'; //chaincode name
    }

    createRandomDate() {
        // Generate a random date for the transaction payload
        const day = Math.floor(Math.random() * 28) + 1;
        const month = Math.floor(Math.random() * 12) + 1;
        return new Date(2025, month - 1, day).toISOString();
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

        // Generate the specified number of transactions for each organization
        for (const orgMSP of Object.keys(this.orgUsers)) {
            for (let i = 0; i < this.TRANSACTIONS_PER_ORG_PER_WORKER; i++) {
                const userIndex = i % this.orgUsers[orgMSP].length;
                const userId = this.orgUsers[orgMSP][userIndex];
                const txFunction = this.orgFunctions[orgMSP];

                // Build payload depending on org
                let payload = { projectId: this.PROJECT_ID, date: this.createRandomDate() };

                switch (orgMSP) {
                    case 'Org1MSP':
                        payload.capturedAmount = Math.floor(Math.random() * 100) + 50;
                        payload.location = 'SiteA';
                        break;
                    case 'Org2MSP':
                        payload.transportEmissions = Math.floor(Math.random() * 50) + 10;
                        break;
                    case 'Org3MSP':
                        payload.storageLoss = Math.floor(Math.random() * 20) + 5;
                        payload.measurementUnit = 'tonnes';
                        payload.location = 'StorageX';
                        break;
                }

                this.transactionsQueue.push({
                    contractFunction: txFunction,
                    contractArguments: [JSON.stringify(payload)], // SINGLE JSON string
                    invokerIdentity: userId,
                    invokerMspId: orgMSP
                });
            }
        }

        console.info(`Worker ${workerIndex} prepared ${this.transactionsQueue.length} transactions.`);
    }

    async submitTransaction() {
        if (this.transactionsQueue.length === 0) return;

        const tx = this.transactionsQueue.shift();

        const request = {
            contractId: this.contractId,
            contractFunction: tx.contractFunction,
            invokerIdentity: tx.invokerIdentity,
            invokerMspId: tx.invokerMspId,
            contractArguments: tx.contractArguments,
            readOnly: false
        };

        await this.sutAdapter.sendRequests(request);
    }

    async cleanupWorkloadModule() {}
}

function createWorkloadModule() {
    return new DailyTransactionsWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
