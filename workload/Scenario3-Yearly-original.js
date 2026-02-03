"use strict";

const { WorkloadModuleBase } = require("@hyperledger/caliper-core");

class AnnualCO2Workload extends WorkloadModuleBase {
    constructor() {
        super();
        this.projectId = "Project-Annual-001";
        this.year = "2025";
        this.months = 12;
        this.transactionsQueue = [];
        this.contractId = "ccschaincode";   // chaincode name
    }

    createPayloads() {
        for (let month = 1; month <= this.months; month++) {
            for (let i = 0; i < 3; i++) { //change the 3 
                const timestamp = new Date(Date.UTC(
                    parseInt(this.year),

                    month - 1,
                    i + 1,   // days 1,2
                    12, 0, 0
                )).toISOString();

                // Org1 - Capture
                this.transactionsQueue.push({
                    contractFunction: "CreateCaptureContract",
                    contractArguments: [JSON.stringify({
                        projectId: this.projectId,
                        capturedAmount: Math.floor(Math.random() * 100) + 50,
                        location: "Site-A",
                        createdAtTest: timestamp
                    })],
                    invokerIdentity: "User1",
                    invokerMspId: "Org1MSP"
                });

                // Org2 - Transport
                this.transactionsQueue.push({
                    contractFunction: "UpdateTransportDetails",
                    contractArguments: [JSON.stringify({
                        projectId: this.projectId,
                        transportEmissions: Math.floor(Math.random() * 50) + 10,
                        createdAtTest: timestamp
                    })],
                    invokerIdentity: "User2",
                    invokerMspId: "Org2MSP"
                });

                // Org3 - Storage
                this.transactionsQueue.push({
                    contractFunction: "UpdateStorageDetails",
                    contractArguments: [JSON.stringify({
                        projectId: this.projectId,
                        storageLoss: Math.floor(Math.random() * 20) + 5,
                        measurementUnit: "tonnes",
                        location: "Reservoir-1",
                        createdAtTest: timestamp
                    })],
                    invokerIdentity: "User3",
                    invokerMspId: "Org3MSP"
                });
            }
        }

        // At the end (after all months), Org6 finalizes the year
        this.transactionsQueue.push({
            contractFunction: "annualCO2Stored",
            contractArguments: [this.projectId, this.year],
            invokerIdentity: "User6",
            invokerMspId: "Org6MSP"
        });
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
        this.createPayloads();
        console.info(`Prepared ${this.transactionsQueue.length} transactions: 2 per month (Org1–Org3) + 1 annual finalization (Org6).`);
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
    return new AnnualCO2Workload();
}

module.exports.createWorkloadModule = createWorkloadModule;

