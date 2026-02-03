"use strict";

const { WorkloadModuleBase } = require("@hyperledger/caliper-core");

class AnnualCO2Workload extends WorkloadModuleBase {
    constructor() {
        super();
        this.projectId = "Project-Annual-001";
        this.year = "2025";
        this.months = 12;
        this.totalTransactions = 108;   // ✅ You can set total transactions here
        this.transactionsQueue = [];
        this.contractId = "ccschaincode";   // chaincode name
    }

    createPayloads() {
        const txList = [];
        const months = this.months;

        for (let month = 1; month <= months; month++) {
            for (let i = 0; i < 3; i++) {
                const timestamp = new Date(Date.UTC(
                    parseInt(this.year),
                    month - 1,
                    i + 1,
                    12, 0, 0
                )).toISOString();

                txList.push({
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

                txList.push({
                    contractFunction: "UpdateTransportDetails",
                    contractArguments: [JSON.stringify({
                        projectId: this.projectId,
                        transportEmissions: Math.floor(Math.random() * 50) + 10,
                        createdAtTest: timestamp
                    })],
                    invokerIdentity: "User2",
                    invokerMspId: "Org2MSP"
                });

                txList.push({
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

        // Add finalization
        txList.push({
            contractFunction: "annualCO2Stored",
            contractArguments: [this.projectId, this.year],
            invokerIdentity: "User6",
            invokerMspId: "Org6MSP"
        });

        // If there are more tx generated than totalTransactions, truncate
        while (txList.length > this.totalTransactions) {
            txList.pop();
        }

        return txList;
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

        const allPayloads = this.createPayloads();

        // Divide total transactions evenly among workers
        const perWorker = Math.ceil(allPayloads.length / totalWorkers);
        const start = workerIndex * perWorker;
        const end = start + perWorker;
        this.transactionsQueue = allPayloads.slice(start, end);

        console.info(`Worker ${workerIndex} will process ${this.transactionsQueue.length} of ${allPayloads.length} total transactions.`);
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
