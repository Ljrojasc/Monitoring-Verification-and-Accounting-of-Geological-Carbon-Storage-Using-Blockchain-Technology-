
import React from 'react'

import ContractListView from './ContractListView.js';

function InProgressContract() {
    return (
        <>
            <ContractListView status="inprogress" title="List of Transactions sent to the Blockchain and have In Progress status"/>
        </>
    );
}

export default InProgressContract
