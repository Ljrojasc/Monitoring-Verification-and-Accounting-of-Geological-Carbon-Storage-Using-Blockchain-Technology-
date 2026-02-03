//This file is for registering new users to the network 

import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
// reactstrap components
import {
  Button,
  Card,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Row,
  Col,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

import ProgressBar from "./ProgressBar";
import axios from "axios";
import { routes } from "../../helper/config.js";

import { useDispatch, useSelector } from "react-redux";
import * as UserAction from "../../actions/user";
import { useToasts } from "react-toast-notifications";

export default function Register2() {
  let history = useHistory();
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignInFailed, setIsSignInFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");

  const { addToast } = useToasts();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  // Store selected option as an object to hold both display name and internal value
  const [selectedOrg, setSelectedOrg] = useState(null); // { name: "Org 1", id: 1, department: "CaptureOperator" }

  const toggle = () => setDropdownOpen((prevState) => !prevState);

  const handleDropdownItemClick = (orgName, orgId, departmentRole) => {
    setSelectedOrg({ name: orgName, id: orgId, department: departmentRole });
    setDropdownOpen(false); // Close dropdown after selection
  };

  const inputChangeHandler = (value, fieldName) => {
    switch (fieldName) {
      case "username":
        setUsername(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
      default:
        break;
    }
  };

  const resetInput = () => {
    setEmail("");
    setPassword("");
    setUsername(""); // Also reset username
    setSelectedOrg(null); // Reset selected organization
    setIsSignInFailed(false);
    setFailedMessage("");
  };

  // This is the method that creates an account when click on create account  
  const createAccount = () => {
    if (!selectedOrg) {
      addToast("Please select an organization", {
        appearance: "warning",
        autoDismiss: true,
      });
      return;
    }

    let userData = {
      email: email,
      name: username,
      password: password,
      orgId: selectedOrg.id,
      department: selectedOrg.department, // Use the department from selectedOrg
    };

    dispatch(UserAction.registerUser(userData))
      .then((resp) => {
        console.log("response from api=================", resp);
        resetInput();
        addToast(resp?.message || "Account created successfully!", {
          appearance: "success",
          autoDismiss: true,
        });
      })
      .catch((err) => {
        console.log("error response from api=================", err);
        setIsSignInFailed(true);
        setFailedMessage(err.message || "An error occurred during registration.");
        addToast(err.message || "Account creation failed.", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  return (
    <>
      <Col lg="6" md="8">
        <Card className="bg-secondary shadow border-0">
          <CardBody className="px-lg-5 py-lg-5">
            <div className="text-center text-muted mb-4">
              <small>Sign up with credentials</small>
            </div>
            <Form role="form">
              <FormGroup>
                <InputGroup className="input-group-alternative mb-3">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-hat-3" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Username"
                    onChange={(e) => {
                      inputChangeHandler(e.target.value, "username");
                    }}
                    type="text"
                    value={username} // Controlled component
                  />
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <InputGroup className="input-group-alternative mb-3">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-email-83" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Email"
                    type="email"
                    onChange={(e) => {
                      inputChangeHandler(e.target.value, "email");
                    }}
                    autoComplete="new-email"
                    value={email} // Controlled component
                  />
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-lock-circle-open" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Password"
                    type="password"
                    onChange={(e) => {
                      inputChangeHandler(e.target.value, "password");
                    }}
                    autoComplete="new-password"
                    value={password} // Controlled component
                  />
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                  <DropdownToggle caret>
                    {selectedOrg ? selectedOrg.name : "Select Organization Role"}
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem
                      onClick={() => handleDropdownItemClick("Org 1 (Capture Operator)", 1, "CaptureOperator")}
                    >
                      Org 1 (Capture Operator)
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => handleDropdownItemClick("Org 2 (Transport Operator)", 2, "TransportOperator")}
                    >
                      Org 2 (Transport Operator)
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => handleDropdownItemClick("Org 3 (Storage Operator)", 3, "StorageOperator")}
                    >
                      Org 3 (Storage Operator)
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </FormGroup>

              {/* Removed old department checkboxes as they are now determined by Org selection */}
              {/* <FormGroup>
                <div>
                  <CustomInput
                    type="checkbox"
                    checked={isLegalDepartment}
                    onChange={(e) => {
                      inputChangeHandler(e.target.value, "isLegalDepartment");
                    }}
                    id="exampleCustomInline"
                    label="CCS Company"
                    inline
                  />
                  <CustomInput
                    type="checkbox"
                    checked={isFinancialDepartment}
                    onChange={(e) => {
                      inputChangeHandler(
                        e.target.value,
                        "isFinantialDepartment"
                      );
                    }}
                    id="exampleCustomInline2"
                    label="MVA Entity"
                    inline
                  />
                </div>
              </FormGroup> */}

              {isSignInFailed ? (
                <div className="text-muted font-italic">
                  <small>
                    <span className="text-danger font-weight-700">
                      {failedMessage}
                    </span>
                  </small>
                </div>
              ) : (
                ""
              )}
              <Row className="my-4">
                <Col xs="12">
                  <div className="custom-control custom-control-alternative custom-checkbox">
                    <input
                      className="custom-control-input"
                      id="customCheckRegister"
                      type="checkbox"
                      checked={true}
                      readOnly // Make it read-only if always checked
                    />
                    <label
                      className="custom-control-label"
                      htmlFor="customCheckRegister"
                    >
                      <span className="text-muted">
                        I agree with the{" "}
                        <a href="#pablo" onClick={(e) => e.preventDefault()}>
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                    {isLoading ? (
                      <div className="text-center">
                        <ProgressBar />
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </Col>
              </Row>
              <div className="text-center">
                <Button
                  className="mt-4"
                  onClick={createAccount} // Directly call createAccount
                  color="primary"
                  type="button"
                >
                  Create account
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </Col>
    </>
  );
}
