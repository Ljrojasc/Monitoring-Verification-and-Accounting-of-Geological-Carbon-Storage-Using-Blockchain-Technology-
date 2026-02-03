import React, { useEffect, useState } from 'react'
import { Button, TabContent, TabPane, Card, CardHeader, FormGroup, CardBody, NavItem, NavLink, Nav, Progress, CardText, Table, Container, CardTitle, Row, Col } from "reactstrap";

// import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText, Row, Col } from 'reactstrap';
import { useHistory } from 'react-router-dom'
import classnames from 'classnames';

import Header from "../../components/Headers/Header.js";
import ContractView from './ContractView.js';
import { routes, headers } from '../../helper/config.js'
import NoDataCard from './NoDataCard.js';
import ReviewAndApproveContract from './ReviewAndApproveContract.js';
import ProgressBar from './ProgressBar.js';

import { useDispatch, useSelector } from 'react-redux';
import * as AgreementAction from '../../actions/agreement.jsx'
import dateFormat from 'dateformat';
import { useToasts } from 'react-toast-notifications'

function ContractListView(props) {
    const { addToast } = useToasts()
    let history = useHistory();
    const dispatch = useDispatch();
    const isLoading = useSelector((state) => state.Agreement.isLoading);

    const contractList = useSelector((state => state.Agreement.agreements))

    const {
        status,
        title
    } = props;


    console.log(`Status is =====> ${status}=====`)

    // const [isLoading, setIsLoading] = useState(false)

    const [modal, setModal] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null)
    const [approveModel, setApproveModel] = useState(false)

    const toggleModal = () => setModal(!modal);
    const toggleApproveModel = () => setApproveModel(!approveModel)
    const viewContract = (index) => {
        setModal(!modal);
        setSelectedContract(contractList?.data[index])
    }

    const approveContract = (index) => {
        setApproveModel(!approveModel)
        setSelectedContract(contractList?.data[index])
        // getContract()

        // dispatch(AgreementAction.approveAgreement({id:contractList?.data[index]?.id, body:{
        //     "description":"user1@gmail.com",
        //     "action":"No Action needed",
        //     "comment":"Agreement approved",
        //     "status": "approved"
        // }})).then(()=> {
        //     addToast(`Agreement approved successfully`, {
        //         appearance: 'success',
        //         autoDismiss: true,
        //       })
        // })

    }

    const refreshData = () => {
        dispatch(AgreementAction.getAgreements({ filterType: props.status }))
        .then(res => console.log("Agreements response:", res))

        getContract()
    }

    // const [contractList, setContractList] = useState([])

    useEffect(() => {
        console.log(`-------------------------------`)
        let token = localStorage.getItem('token')
        console.log(`token is -------------: ${token}`)
        if (!token) {
            console.log(`Triggered`)
            history.push('auth/login')
        }
        getContract()



    }, [])

    const getContract = () => {

        dispatch(AgreementAction.getAgreements({filterType: props.status}))

    }

    return (
        <Container className="mt--7" fluid>
            <Row>
                <div className="col">
                    <ContractView modal={modal} toggle={toggleModal} contractDetails={selectedContract} />
                    <ReviewAndApproveContract modal={approveModel} toggle={toggleApproveModel} refreshData={refreshData} contractDetails={selectedContract} />
                    <Card className="shadow" style={{ padding: 40 }}>
                        <CardHeader className="border-0">
                            {/* <h3 className="mb-0">{title}</h3> */}
                            <FormGroup row>

                                <Col sm={9}>
                                    <h3 className="mb-0">{title}</h3>
                                </Col>
                                <Col sm={3}>
                                    <Button className="my-1" color="primary" onClick={()=> refreshData()} type="button">{"Refresh"}</Button>
                                </Col>
                            </FormGroup>
                        </CardHeader>

                        {isLoading ? <ProgressBar /> :
                            <>
                                {contractList?.data?.length > 0 ? 
                                    <Table className="align-items-center table-flush" striped bordered hover>
                                        <thead className="thead-light">
                                            <tr>
                                                {/* Below I added the columns that I want to display in the table*/}
                                                <th scope="col">ID</th>
                                                <th scope="col">Status</th>
                                                <th scope="col">View</th>
                                                {status == "inprogress" ? <th scope="col">Action</th> : null}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {contractList?.data.map((contract, i) =>
                                                (<tr>
                                                    <td onClick={()=> navigator.clipboard.writeText(contract.id)}>{contract.id.substring(0,50)}</td>
                                                    <td> {contract.status}</td>
                                                    <td><Button className="my-1" color="primary" onClick={() => viewContract(i)} type="button">{"View"}</Button></td>
                                                    {status == "inprogress" ? <td><Button className="my-1" color="primary" onClick={() => approveContract(i)} type="button">{"Approve"}</Button></td> : null}

                                                </tr>))
                                            }
                                        </tbody>
                                    </Table>: <NoDataCard status={status} /> }
                            </>
                        }
                        {/* <NoDataCard />  */}
                    </Card>
                </div>
            </Row>
        </Container>
    );
}

export default ContractListView