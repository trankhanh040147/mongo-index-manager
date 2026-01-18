import React from 'react';
import UiContent from "../../Components/Common/UiContent";

//import Components
import BreadCrumb from '../../Components/Common/BreadCrumb';
import {Card, CardBody, Col, Container, Form, Input, InputGroup, Label, Row} from 'reactstrap';
import PreviewCardHeader from '../../Components/Common/PreviewCardHeader';

const NewDatabase = () => {
    document.title = "New Database | DRManager";
    return (
        <React.Fragment>
            <UiContent/>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Database" pageTitle="New Database"/>
                    <Row>
                        <Col xxl={6}>
                            <Card>
                                <PreviewCardHeader title="New Database"/>
                                <div className="card-body">
                                    <p className="text-muted"> Create your new Mongo DB connection. Your URI should
                                        follow this format <code>mongodb://localhost:27017</code></p>
                                    <div className="live-preview">
                                        <form action="#" className="row g-3">
                                            <Col md={12}>
                                                <Label htmlFor="fullnameInput" className="form-label">Name</Label>
                                                <Input type="text" className="form-control" id="fullnameInput"
                                                       placeholder="Enter your name"/>
                                            </Col>
                                            <Col md={6}>
                                                <Label htmlFor="inputEmail4" className="form-label">URI
                                                    Connection</Label>
                                                <Input type="email" className="form-control" id="inputEmail4"
                                                       placeholder="Email"/>
                                            </Col>
                                            <Col md={6}>
                                                <Label htmlFor="inputPassword4" className="form-label">Database
                                                    Name</Label>
                                                <Input type="password" className="form-control" id="inputPassword4"
                                                       placeholder="Password"/>
                                            </Col>
                                            <Col xs={12}>
                                                <Label htmlFor="inputAddress" className="form-label">Description</Label>
                                                <Input type="text" className="form-control" id="inputAddress"
                                                       placeholder="1234 Main St"/>
                                            </Col>
                                            <Col xs={12}>
                                                <div className="form-check">
                                                    <Input className="form-check-input" type="checkbox" id="gridCheck"/>
                                                    <Label className="form-check-label" htmlFor="gridCheck">
                                                        Test Connection
                                                    </Label>
                                                </div>
                                            </Col>
                                            <Col xs={12}>
                                                <div className="text-end">
                                                    <button type="submit" className="btn btn-primary">Create</button>
                                                </div>
                                            </Col>
                                        </form>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default NewDatabase;