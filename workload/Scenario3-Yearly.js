"use strict";

const { WorkloadModuleBase } = require("@hyperledger/caliper-core");

class AnnualCO2Workload extends WorkloadModuleBase {
    constructor() {
        super();
        this.projectId = "Project";
        this.year = 2025;
        this.months = 12;
        this.txPerMonthPerOrg = 5 // Change this to control transactions per month per org
        this.transactionsQueue = [];
        this.contractId = "ccschaincode"; // Chaincode name
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

        const allTx = [];

        // --- Generate monthly transactions ---
        for (let month = 1; month <= this.months; month++) {
            for (let i = 0; i < this.txPerMonthPerOrg; i++) {
                const day = i + 1;
                const timestamp = new Date(Date.UTC(this.year, month - 1, day, 12, 0, 0)).toISOString();

                // Org1 - Capture
                allTx.push({
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
                allTx.push({
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
                allTx.push({
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

        // --- Annual TX (only 1) ---
        const annualTx = {
            contractFunction: "annualCO2Stored",
            contractArguments: [this.projectId.toString(), this.year.toString()],
            invokerIdentity: "User6",
            invokerMspId: "Org6MSP"
        };

        // --- Distribute monthly transactions evenly across workers ---
        const monthlyTx = allTx.filter((_, index) => index % totalWorkers === workerIndex);

        // --- Ensure one worker (worker 0) sends the annual TX ---
        if (workerIndex === 0) {
            monthlyTx.push(annualTx);
        }

        this.transactionsQueue = monthlyTx;

        console.info(`Worker ${workerIndex} assigned ${this.transactionsQueue.length} transactions out of total ${allTx.length + 1}.`);
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
