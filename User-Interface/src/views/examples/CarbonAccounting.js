import React, { useState } from 'react';
import {
  Button, Card, CardHeader, FormGroup, CardBody, Container, Row, Col, Input,

} from "reactstrap";
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import { useHistory } from 'react-router-dom'
import classnames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import * as AgreementAction from '../../actions/agreement'
import { useToasts } from 'react-toast-notifications'
import dateFormat from 'dateformat';

import Header from "../../components/Headers/Header.js";
import InProgressContract from './InProgressContract.js';
import CompletedContract from './CompletedContract.js';
import ExpiringContracts from './ExpiringContracts.js';
import ContractView from './ContractView.js';
import AddContract from './AddContract.js';
import AllContracts from './AllContracts.js';
import { routes, headers } from '../../helper/config'; // Import the routes here
import axios from 'axios'
import ProgressBar from './ProgressBar'

// Component for the Carbon Credits Calculator
export default function CarbonAccounting() {
  const [formData, setFormData] = useState({
    captureTxId: '',
    transportTxId: '',
    storageTxId: '',
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to handle changes in the input fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Function to handle form submission and make the API call
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // Use the endpoint from your config.js file
      const response = await fetch(routes.agreementsCarbonAccounting, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers().headers, // Use your headers function for Authorization etc.
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong on the server.');
      }

      const data = await response.json();
      setResult(data);

    } catch (err) {
      setError(err.message);
      console.error('Error during transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col lg="8" md="10">
            <Card className="shadow">
              <CardHeader className="border-0">
                <h3 className="mb-0">Carbon Accounting Calculator</h3>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Input
                      type="text"
                      name="captureTxId"
                      placeholder="Capture Transaction ID"
                      value={formData.captureTxId}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Input
                      type="text"
                      name="transportTxId"
                      placeholder="Transport Transaction ID"
                      value={formData.transportTxId}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Input
                      type="text"
                      name="storageTxId"
                      placeholder="Storage Transaction ID"
                      value={formData.storageTxId}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                  
                  <Button
                    color="primary"
                    type="submit"
                    className="mt-4"
                    disabled={loading}
                  >
                    {loading ? 'Calculating...' : 'Calculate CO2 Stored'}
                  </Button>
                </form>

                {/* Display messages based on state */}
                {loading && (
                  <div className="mt-4 text-center text-info">
                    Calculating carbon credits. Please wait...
                  </div>
                )}

                {error && (
                  <div className="mt-4 text-danger text-center">
                    Error: {error}
                  </div>
                )}

                {result && (
                  <div className="mt-4 p-4 rounded bg-success text-white">
                    <h4 className="mb-2">Calculation Complete!</h4>
                    <p>
                      <strong>Net Carbon Captured:</strong> {result.netCarbonCaptured} tonnes
                    </p>
                    <p>
                      <strong>Transaction ID:</strong> {result.txId}
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}
