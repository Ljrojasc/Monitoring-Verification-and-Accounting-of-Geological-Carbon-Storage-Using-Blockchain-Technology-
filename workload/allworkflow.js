'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class CCSWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.projectId = 'Project-001';
        this.year = 2025;
        this.months = 12;
        this.transactionsQueue = [];
        this.contractId = 'ccschaincode';
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

        this.transactionsQueue = []; // Clear the queue for the new round

        const payloadSize = 1; // 2 transactions per month from each of Org1, Org2, Org3
        
        // ---- Round 1: Data Entry (Capture/Transport/Storage) ----
        if (roundIndex === 0) {
            // Assign roles to workers 0, 1, and 2
            if (workerIndex === 0) { // Org1
                this.functionName = 'CreateCaptureContract';
                this.invokerIdentity = 'User1';
                this.invokerMspId = 'Org1MSP';
            } else if (workerIndex === 1) { // Org2
                this.functionName = 'UpdateTransportDetails';
                this.invokerIdentity = 'User2';
                this.invokerMspId = 'Org2MSP';
            } else if (workerIndex === 2) { // Org3
                this.functionName = 'UpdateStorageDetails';
                this.invokerIdentity = 'User3';
                this.invokerMspId = 'Org3MSP';
            } else { // Other workers do nothing in this round
                console.info(`Worker ${workerIndex} is not active in Round 1.`);
                return;
            }

            // Prepare transactions for a full year for this worker
            for (let month = 1; month <= this.months; month++) {
                for (let i = 0; i < payloadSize; i++) {
                    const timestamp = new Date(Date.UTC(this.year, month - 1, i + 1, 12, 0, 0)).toISOString();
                    let payload = { projectId: this.projectId, createdAt: timestamp };

                    if (this.invokerMspId === 'Org1MSP') {
                        payload.capturedAmount = 100 + Math.random() * 50;
                        payload.location = 'Wyoming';
                    } else if (this.invokerMspId === 'Org2MSP') {
                        payload.transportEmissions = 5 + Math.random() * 5;
                    } else if (this.invokerMspId === 'Org3MSP') {
                        payload.storageLoss = 2 + Math.random() * 5;
                        payload.measurementUnit = 'tonnes';
                        payload.location = 'Reservoir-1';
                    }

                    this.transactionsQueue.push({
                        contractFunction: this.functionName,
                        contractArguments: [JSON.stringify(payload)],
                        invokerIdentity: this.invokerIdentity,
                        invokerMspId: this.invokerMspId
                    });
                }
            }
            console.info(`Worker ${workerIndex} prepared ${this.transactionsQueue.length} data entry transactions.`);
        }

        // ---- Round 2: Monthly Finalization ----
        else if (roundIndex === 1) {
            // Only worker 0 (Org6) performs this task
            if (workerIndex === 0) {
                this.functionName = 'monthlyCO2Stored';
                this.invokerIdentity = 'User6';
                this.invokerMspId = 'Org6MSP';

                // Prepare 1 transaction per month for a full year
                for (let month = 1; month <= this.months; month++) {
                    this.transactionsQueue.push({
                        contractFunction: this.functionName,
                        contractArguments: [this.projectId, this.year.toString(), month.toString()],
                        invokerIdentity: this.invokerIdentity,
                        invokerMspId: this.invokerMspId
                    });
                }
                console.info(`Worker ${workerIndex} prepared ${this.transactionsQueue.length} monthly finalization transactions.`);
            } else {
                console.info(`Worker ${workerIndex} is not active in Round 2.`);
            }
        }

        // ---- Round 3: Annual Finalization ----
        else if (roundIndex === 2) {
            // Only worker 0 (Org6) performs this task
            if (workerIndex === 0) {
                this.functionName = 'annualCO2Stored';
                this.invokerIdentity = 'User6';
                this.invokerMspId = 'Org6MSP';

                // Prepare a single transaction for the year
                this.transactionsQueue.push({
                    contractFunction: this.functionName,
                    contractArguments: [this.projectId, this.year.toString()],
                    invokerIdentity: this.invokerIdentity,
                    invokerMspId: this.invokerMspId
                });
                console.info(`Worker ${workerIndex} prepared 1 annual finalization transaction.`);
            } else {
                console.info(`Worker ${workerIndex} is not active in Round 3.`);
            }
        }
    }

    async submitTransaction() {
        if (this.transactionsQueue.length === 0) return;
        
        const tx = this.transactionsQueue.shift();
        
        const request = {
            contractId: this.contractId,
            contractFunction: tx.contractFunction,
            contractArguments: tx.contractArguments,
            invokerIdentity: tx.invokerIdentity,
            invokerMspId: tx.invokerMspId,
            readOnly: false
        };

        await this.sutAdapter.sendRequests(request);
    }

    async cleanupWorkloadModule() {}
}

function createWorkloadModule() {
    return new CCSWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
