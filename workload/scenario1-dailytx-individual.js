'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class IndividualFunctionWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.PROJECT_ID = 'Project_1';
        // Each worker will generate 8 transactions for the target function.
        // With 3 workers, this results in a total of 24 transactions per function.
        this.TRANSACTIONS_PER_WORKER = 32;
        this.transactionsQueue = [];

        // Define which org corresponds to which function
        this.functionMappings = {
            'CreateCaptureContract': { mspId: 'Org1MSP', user: 'User1' },
            'UpdateTransportDetails': { mspId: 'Org2MSP', user: 'User2' },
            'UpdateStorageDetails': { mspId: 'Org3MSP', user: 'User3' }
        };
        
        this.targetFunction = null;
        this.contractId = 'ccschaincode';
    }

    createRandomDate() {
        // Generate a random date for the transaction payload
        const day = Math.floor(Math.random() * 28) + 1;
        const month = Math.floor(Math.random() * 12) + 1;
        return new Date(2025, month - 1, day).toISOString();
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

        // Get the function name for this specific round from the benchmark arguments
        this.targetFunction = roundArguments.functionName;
        if (!this.targetFunction || !this.functionMappings[this.targetFunction]) {
            throw new Error('Invalid or missing functionName argument in the benchmark configuration.');
        }

        console.info(`Worker ${workerIndex} is preparing transactions for function: ${this.targetFunction}`);

        // Get the specific org details for the target function
        const orgInfo = this.functionMappings[this.targetFunction];

        // Generate the specified number of transactions for this single function
        for (let i = 0; i < this.TRANSACTIONS_PER_WORKER; i++) {
            let payload = { projectId: this.PROJECT_ID, date: this.createRandomDate() };
            
            // Build payload based on the target function
            switch (this.targetFunction) {
                case 'CreateCaptureContract':
                    payload.capturedAmount = Math.floor(Math.random() * 100) + 50;
                    payload.location = 'SiteA';
                    break;
                case 'UpdateTransportDetails':
                    payload.transportEmissions = Math.floor(Math.random() * 50) + 10;
                    break;
                case 'UpdateStorageDetails':
                    payload.storageLoss = Math.floor(Math.random() * 20) + 5;
                    payload.measurementUnit = 'tonnes';
                    payload.location = 'StorageX';
                    break;
            }

            this.transactionsQueue.push({
                contractFunction: this.targetFunction,
                contractArguments: [JSON.stringify(payload)],
                invokerIdentity: orgInfo.user,
                invokerMspId: orgInfo.mspId
            });
        }

        console.info(`Worker ${workerIndex} prepared ${this.transactionsQueue.length} transactions for function ${this.targetFunction}.`);
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
    return new IndividualFunctionWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
