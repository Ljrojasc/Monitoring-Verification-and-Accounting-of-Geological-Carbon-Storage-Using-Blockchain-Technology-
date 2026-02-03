'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class MultiOrgMonthlyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.transactionsQueue = [];
    }

    // Generate deterministic monthly timestamps
    createDateForMonth(year, month, dayOffset = 0) {
        return new Date(Date.UTC(year, month - 1, 1 + dayOffset, 12, 0, 0, 0)).toISOString();
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

        this.contractId = roundArguments.contractId;
        this.channel = roundArguments.channel;
        this.projectId = roundArguments.projectId || 'Project_001';
        this.months = roundArguments.months || 12;
        this.txPerMonth = roundArguments.txPerMonth || 20; //I can modify this
        this.year = 2025;

        // Assign orgs to workers
        if (workerIndex === 0) {
            this.mspId = 'Org1MSP';
            this.user = 'User1';
            this.functionName = 'CreateCaptureContract';
        } else if (workerIndex === 1) {
            this.mspId = 'Org2MSP';
            this.user = 'User2';
            this.functionName = 'UpdateTransportDetails';
        } else if (workerIndex === 2) {
            this.mspId = 'Org3MSP';
            this.user = 'User3';
            this.functionName = 'UpdateStorageDetails';
        } else if (workerIndex === 3) {
            this.mspId = 'Org6MSP';
            this.user = 'User6';
            this.functionName = 'monthlyCO2Stored';
        }

        // Populate transactions queue depending on the org
        if (this.mspId !== 'Org6MSP') {
            // Org1–3: send 2 tx per month with createdAt
            for (let month = 1; month <= this.months; month++) {
                for (let i = 0; i < this.txPerMonth; i++) {
                    const createdAt = this.createDateForMonth(this.year, month, i);

                    let payload = {
                        projectId: this.projectId,
                        createdAt,
                    };

                    if (this.mspId === 'Org1MSP') {
                        payload.capturedAmount = Math.floor(Math.random() * 100) + 50;
                        payload.location = 'SiteA';
                    } else if (this.mspId === 'Org2MSP') {
                        payload.transportEmissions = Math.floor(Math.random() * 50) + 10;
                    } else if (this.mspId === 'Org3MSP') {
                        payload.storageLoss = Math.floor(Math.random() * 20) + 5;
                        payload.measurementUnit = 'tonnes';
                        payload.location = 'StorageX';
                    }

                    this.transactionsQueue.push({
                        contractFunction: this.functionName,
                        contractArguments: [JSON.stringify(payload)],
                        invokerIdentity: this.user,
                        invokerMspId: this.mspId,
                    });
                }
            }
        } else {
            // Org6: run monthlyCO2Stored for each month
            for (let month = 1; month <= this.months; month++) {
                this.transactionsQueue.push({
                    contractFunction: this.functionName,
                    contractArguments: [this.projectId, String(this.year), String(month)],
                    invokerIdentity: this.user,
                    invokerMspId: this.mspId,
                });
            }
        }

        console.info(`Worker ${workerIndex} (${this.mspId}) prepared ${this.transactionsQueue.length} transactions`);
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
            channel: this.channel,
            readOnly: false,
        };

        await this.sutAdapter.sendRequests(request);
    }

    async cleanupWorkloadModule() {}
}

function createWorkloadModule() {
    return new MultiOrgMonthlyWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
