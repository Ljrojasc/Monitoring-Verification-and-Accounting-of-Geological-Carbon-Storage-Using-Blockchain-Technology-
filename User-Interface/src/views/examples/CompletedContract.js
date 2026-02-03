import React from 'react'
import ContractListView from './ContractListView.js';

function CompletedContract() {
    return (
        <>
            <ContractListView status="active" title="Transactions with Completed Status"/>
        </>
    );
}

export default CompletedContract
