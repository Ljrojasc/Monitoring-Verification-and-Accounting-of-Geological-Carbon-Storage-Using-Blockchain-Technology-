import React, { useState, useEffect } from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter, FormFeedback,
  Card, Form, FormGroup, Label, Input, Col, CustomInput
} from 'reactstrap';
import ProgressBar from './ProgressBar';
import { useToasts } from 'react-toast-notifications';
import { getTimeStamp } from '../../helper/utils';

import { useDispatch, useSelector } from 'react-redux';
import * as AgreementAction from '../../actions/agreement';

const AddContract = (props) => {
  const {
    className,
    modal,
    toggle
  } = props;

  const { addToast } = useToasts();
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.Agreement.isLoading);

  const decodedData = useSelector((state) => state?.User?.login?.decodedData);

  // Determine user role booleans for conditional rendering
  const isCaptureOperator = decodedData?.department === 'Capture Operator';
  const isTransportOperator = decodedData?.department === 'Transport Operator';
  const isStorageOperator = decodedData?.department === 'Storage Operator';
  const isProjectDeveloper = decodedData?.department === 'Project Developer';


  useEffect(() => {
    console.log("User Department:", decodedData?.department);
  }, [decodedData]);

  // Form states
  //const [title, setTitle] = useState('');
  //const [typeOfContract, setTypeOfContract] = useState('');
  //const [startDate, setStartDate] = useState('');
  //const [endDate, setEndDate] = useState('');
  const [csource, setCsource] = useState('');       // For Capture Operator
  const [capturedAmount, setCapturedAmount] = useState('');   // For Capture Operator (CO2 Injected)
  const [transportEmissions, setTransportEmissions] = useState(''); // For Transport Operator (CO2 Transported)
  const [vcreceived, setVcreceived] = useState(''); // For Transport Operator (CO2 Transported)
  const [vcstorage, setVcstorage] = useState('');   // For Storage Operator (CO2 Stored) 
  const [storageLoss, setStorageLoss] = useState('');   // For Storage Operator (CO2 Stored) - new field
  const [projectname, setProjectname] = useState(''); //FAORG ORG4
  const [document, setDocument] = useState('');
  const [comment, setComment] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Validate inputs before submitting
  const validateAndAddContract = () => {
    let isInvalid = false;

    setIsValidating(true);

    //if (title === '') {
      //addToast(`Please add correct contract name`, { appearance: 'error', autoDismiss: true });
      //isInvalid = true;
    //}
    //if (typeOfContract === '') {
      //addToast(`Please add correct type of contract`, { appearance: 'error', autoDismiss: true });
      //isInvalid = true;
    //}
    //if (startDate === '') {
      //addToast(`Please add correct contract Start Date`, { appearance: 'error', autoDismiss: true });
      //isInvalid = true;
    //}
    //if (endDate === '') {
      //addToast(`Please add correct contract End Date`, { appearance: 'error', autoDismiss: true });
      //isInvalid = true;
    //}
    if (document === '') {
      addToast(`Please select contract agreement file`, { appearance: 'error', autoDismiss: true });
      isInvalid = true;
    }
    // Role-specific validation
    if (isCaptureOperator) {
      if (csource === '') {
        addToast(`Please add correct Carbon Source`, { appearance: 'error', autoDismiss: true });
        isInvalid = true;
      }
      if (capturedAmount === '') {
        addToast(`Please add correct amount of CO2 Injected`, { appearance: 'error', autoDismiss: true });
        isInvalid = true;
      }
    }

    if (isTransportOperator) {
      if (transportEmissions === '') {
        addToast(`Please add correct amount of CO2 Transported`, { appearance: 'error', autoDismiss: true });
        isInvalid = true;
      }
    }

    if (isTransportOperator) {
      if (vcreceived === '') {
        addToast(`Please add correct amount of CO2 received`, { appearance: 'error', autoDismiss: true });
        isInvalid = true;
      }
    }

    if (isStorageOperator) {
      if (vcstorage === '') {
        addToast(`Please add correct amount of CO2 Stored`, { appearance: 'error', autoDismiss: true });
        isInvalid = true;
      }

    } 
        if (isStorageOperator) {
      if (storageLoss === '') {
        addToast(`Please add correct amount of CO2 lost`, { appearance: 'error', autoDismiss: true });
        isInvalid = true;
      }
    } 

    if (isProjectDeveloper) {
      if (projectname === '') {
        addToast(`Please add CCS Project Name`, { appearance: 'error', autoDismiss: true });
        isInvalid = true;
      }
    }

    if (!isInvalid) {
      addContract();
    }
  };

  // Reset inputs after submit or cancel
  const resetInput = () => {
    //setTypeOfContract('');
    //setTitle('');
    setCsource('');
    setCapturedAmount('');
    setTransportEmissions('');
    setVcreceived('');
    setStorageLoss('');
    setVcstorage('');
    setProjectname('');
    //setStartDate('');
    //setEndDate('');
    setComment('');
    setDocument('');
  };

  // Submit contract form data
  const addContract = () => {
    const data = new FormData();
    //data.append('typeOfContract', typeOfContract);
    //data.append('title', title);
    //data.append('startDate', getTimeStamp(startDate));
    //data.append('endDate', getTimeStamp(endDate));
    data.append('comment', comment);
    data.append('agreement', document);

    // Append role-specific data conditionally
    if (isCaptureOperator) {
      data.append('csource', csource);
      data.append('capturedAmount', capturedAmount);
    }
    if (isTransportOperator) {
      data.append('transportEmissions', transportEmissions);
    } 
    if (isTransportOperator) {
      data.append('vcreceived', vcreceived);
    } 
    if (isStorageOperator) {
      data.append('vcstorage', vcstorage);
    } 
    if (isStorageOperator) {
      data.append('storageLoss', storageLoss);
    } 
    if (isProjectDeveloper) {
      data.append('projectname', projectname);
    }

    dispatch(AgreementAction.createAgreement(data))
      .then(() => {
        addToast(`Agreement created successfully`, { appearance: 'success', autoDismiss: true });
        toggle();
      })
      .catch((error) => {
        alert(error);
      })
      .finally(() => {
        resetInput();
        setIsValidating(false);
      });
  };

  // Handle file upload
  const getFile = (e) => {
    e.preventDefault();
    let file = e.target.files[0];
    if (file) {
      setDocument(file);
    }
  };

  // Input change handler
  const inputChangeHandler = (value, fieldName) => {
    switch (fieldName) {
      //case 'title': setTitle(value); break;
      //case 'typeOfContract': setTypeOfContract(value); break;
      case 'csource': setCsource(value); break;
      case 'capturedAmount': setCapturedAmount(value); break;
      case 'transportEmissions': setTransportEmissions(value); break;
      case 'vcreceived': setVcreceived(value); break;  
      case 'storageLoss': setStorageLoss(value); break;  
      case 'vcstorage': setVcstorage(value); break;
      case 'projectname': setProjectname(value); break;
      //case 'startDate': setStartDate(value); break;
      //case 'endDate': setEndDate(value); break;
      case 'comment': setComment(value); break;
      default: break;
    }
  };

  return (
    <div>
      <Modal isOpen={modal} toggle={toggle} className={className} size={'lg'}>
        <ModalHeader toggle={toggle}>Add Transaction Details About CCS Project</ModalHeader>
        {isLoading ? (
          <ProgressBar />
        ) : (
          <>
            <Card className="bg-secondary px-md-2">
              <ModalBody>
                 {/*<FormGroup row>
                  <Label sm={2}>Title</Label>
                  <Col sm={10}>
                    <Input
                      type="text"
                      invalid={isValidating && title === ''}
                      onChange={e => { inputChangeHandler(e.target.value, 'title'); }}
                      placeholder="Enter Title of Entry"
                    />
                    <FormFeedback>*Required</FormFeedback>
                  </Col>
                </FormGroup>*/}

                  {/*<FormGroup row>
                  <Label sm={2}>Contract Type</Label>
                  <Col sm={10}>
                    <Input
                      invalid={isValidating && typeOfContract === ''}
                      onChange={e => { inputChangeHandler(e.target.value, 'typeOfContract'); }}
                      placeholder="Enter Contract Type"
                    />
                    <FormFeedback>*Required</FormFeedback>
                  </Col>
                </FormGroup>*/}

                {/* Capture Operator Fields */}
                {isCaptureOperator && (
                  <>
                    <FormGroup row>
                      <Label sm={2}>Carbon Source</Label>
                      <Col sm={10}>
                        <Input
                          invalid={isValidating && csource === ''}
                          onChange={e => { inputChangeHandler(e.target.value, 'csource'); }}
                          placeholder="Enter the CO2 source"
                        />
                        <FormFeedback>*Required</FormFeedback>
                      </Col>
                    </FormGroup>

                    <FormGroup row>
                      <Label sm={2}>Carbon Injected</Label>
                      <Col sm={10}>
                        <Input
                          invalid={isValidating && capturedAmount === ''}
                          onChange={e => { inputChangeHandler(e.target.value, 'capturedAmount'); }}
                          placeholder="Enter the amount of CO2 injected"
                        />
                        <FormFeedback>*Required</FormFeedback>
                      </Col>
                    </FormGroup>
                  </>
                )}

                {/* Transport Operator Fields */}
                {isTransportOperator && (
                  <FormGroup row>
                    <Label sm={2}>Carbon Transported</Label>
                    <Col sm={10}>
                      <Input
                        invalid={isValidating && transportEmissions === ''}
                        onChange={e => { inputChangeHandler(e.target.value, 'transportEmissions'); }}
                        placeholder="Enter the amount of CO2 transported from the source"
                      />
                      <FormFeedback>*Required</FormFeedback>
                    </Col>
                  </FormGroup>
                )}

                  {isTransportOperator && (
                  <FormGroup row>
                    <Label sm={2}>Carbon Received</Label>
                    <Col sm={10}>
                      <Input
                        invalid={isValidating && vcreceived === ''}
                        onChange={e => { inputChangeHandler(e.target.value, 'vcreceived'); }}
                        placeholder="Enter the amount of CO2 received from the source"
                      />
                      <FormFeedback></FormFeedback>
                    </Col>
                  </FormGroup>
                )}

                {/* Storage Operator Fields */}
                {isStorageOperator && (
                  <FormGroup row>
                    <Label sm={2}>Carbon Stored</Label>
                    <Col sm={10}>
                      <Input
                        invalid={isValidating && vcstorage === ''}
                        onChange={e => { inputChangeHandler(e.target.value, 'vcstorage'); }}
                        placeholder="Enter the amount of CO2 stored"
                      />
                      <FormFeedback>*Required</FormFeedback>
                    </Col>
                  </FormGroup>
                )} 

                {isStorageOperator && (
                  <FormGroup row>
                    <Label sm={2}>Carbon Loss</Label>
                    <Col sm={10}>
                      <Input
                        invalid={isValidating && storageLoss === ''}
                        onChange={e => { inputChangeHandler(e.target.value, 'storageLoss'); }}
                        placeholder="Enter the amount of CO2 lost"
                      />
                      <FormFeedback>*Required</FormFeedback>
                    </Col>
                  </FormGroup>
                )} 

                {/* Project Developer Fields */}
                {isProjectDeveloper && (
                  <FormGroup row>
                    <Label sm={2}>Name of Project</Label>
                    <Col sm={10}>
                      <Input
                        invalid={isValidating && projectname === ''}
                        onChange={e => { inputChangeHandler(e.target.value, 'projectname'); }}
                        placeholder="Enter the CCS project name"
                      />
                      <FormFeedback>*Required</FormFeedback>
                    </Col>
                  </FormGroup>
                )}

                {/* Common Fields */}
                {/* <FormGroup row>
                  <Label sm={2}>Start Date</Label>
                  <Col sm={10}>
                    <Input
                      invalid={isValidating && startDate === ''}
                      onChange={e => { inputChangeHandler(e.target.value, 'startDate'); }}
                      type="date"
                      placeholder="Start Date"
                    />
                    <FormFeedback>*Required</FormFeedback>
                  </Col>
                </FormGroup>*/}

                {/*<FormGroup row>
                  <Label sm={2}>End Date</Label>
                  <Col sm={10}>
                    <Input
                      invalid={isValidating && endDate === ''}
                      onChange={e => { inputChangeHandler(e.target.value, 'endDate'); }}
                      type="date"
                      placeholder="End Date"
                    />
                    <FormFeedback>*Required</FormFeedback>
                  </Col>
                </FormGroup>*/}

                <FormGroup row>
                  <Label sm={2}>Comment</Label>
                  <Col sm={10}>
                    <Input
                      type="text"
                      invalid={isValidating && comment === ''}
                      onChange={e => { inputChangeHandler(e.target.value, 'comment'); }}
                      placeholder="Enter comment"
                    />
                    <FormFeedback>*Required</FormFeedback>
                  </Col>
                </FormGroup>

                <FormGroup row>
                  <Col sm={2}>
                    <Label>Document</Label>
                  </Col>
                  <Col sm={1}>
                    <Label>:</Label>
                  </Col>
                  <Col sm={9}>
                    <CustomInput
                      invalid={isValidating && document === ''}
                      type="file"
                      accept=".pdf, .PDF"
                      onChange={getFile}
                      id="exampleCustomFileBrowser"
                      name="customFile"
                    />
                    <FormFeedback>*Required</FormFeedback>
                  </Col>
                </FormGroup>
              </ModalBody>
            </Card>

            <ModalFooter>
              <Button color="primary" onClick={validateAndAddContract}>Submit Transaction</Button>{' '}
              <Button color="secondary" onClick={toggle}>Cancel</Button>
            </ModalFooter>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AddContract;
