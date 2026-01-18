import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {Card, CardBody, CardHeader, Col, Container, Form, Input, Label, Row} from 'reactstrap';
import BreadCrumb from '../../../Components/Common/BreadCrumb';
//Import Flatepicker
import Flatpickr from "react-flatpickr";
import Select from "react-select";
import {CKEditor} from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import Dropzone from "react-dropzone";

//Import Images
import avatar3 from "../../../assets/images/users/avatar-3.jpg";
import avatar4 from "../../../assets/images/users/avatar-4.jpg";
import {Formik, useFormik} from "formik";
import * as Yup from "yup";
import {editProfile, getProfileUser} from "../../../slices/auth/profile/thunk";
import {useDispatch} from "react-redux";
import {
    createDatabase,
} from "../../../slices/database/thunk";

const CreateDatabase = () => {
    const dispatch = useDispatch();

    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,

        // todo: validate phone
        initialValues: {
            name: '',
            uri: '',
            db_name: '',
            description: '',
            test_connection: false,
        },

        // validationSchema: Yup.object({
        //     // first_name: Yup.string().required("Please Enter Your First Name"),
        // }),
        onSubmit: (values) => {
            dispatch(createDatabase(values)).then(() => {
                // history('/list-database')
            })
            console.log("Submitted")
        }
    });

    document.title = "Create Database | DRManager";
    return (
        <React.Fragment>
            <div className="page-content">

                <Container fluid>
                    <BreadCrumb title="Create Database Connection" pageTitle="Databases"/>
                    <Form
                        onSubmit={(e) => {
                            e.preventDefault();
                            validation.handleSubmit();
                            return false;
                        }}
                    >
                        <Row>
                            <Col lg={8}>
                                <Card>
                                    <CardBody>
                                        <p className="text-muted"> Create your new Mongo DB connection. Your URI should
                                            follow this format <code>mongodb://localhost:27017</code></p>
                                        <div className="mb-3">
                                            <Label className="form-label" htmlFor="Database-title-input">
                                                Connection Name</Label>
                                            <Input type="text" className="form-control"
                                                   id="name"
                                                   name="name"
                                                   value={validation.values.name}
                                                   onChange={validation.handleChange}
                                                   placeholder="Enter connection name"/>
                                        </div>

                                        <Row>
                                            <Col lg={8}>
                                                <div className="mb-3 mb-lg-0">
                                                    <Label htmlFor="choices-priority-input"
                                                           className="form-label">Connection URI</Label>
                                                    <Input type="text" className="form-control"
                                                           id="uri"
                                                           name="uri"
                                                           value={validation.values.uri}
                                                           onChange={validation.handleChange}
                                                           placeholder="Enter connection URI"/>
                                                </div>
                                            </Col>
                                            <Col lg={4}>
                                                <div className="mb-3 mb-lg-0">
                                                    <Label htmlFor="choices-status-input"
                                                           className="form-label">Database Name</Label>
                                                    <Input type="text" className="form-control"
                                                           id="db_name"
                                                           name="db_name"
                                                           value={validation.values.db_name}
                                                           onChange={validation.handleChange}
                                                           placeholder="Enter database name"/>
                                                </div>
                                            </Col>
                                        </Row>

                                        <div className="mb-3">
                                            <Label className="form-label">Description</Label>
                                            <textarea
                                                className="form-control"
                                                id="description"
                                                name="description"
                                                value={validation.values.description}
                                                onChange={validation.handleChange}
                                                rows="3"></textarea>
                                        </div>

                                        <div class="form-check mb-2">
                                            <input
                                                id="test_connection"
                                                name="test_connection"
                                                value={validation.values.test_connection}
                                                onChange={validation.handleChange}
                                                type="checkbox"
                                                className="form-check-input form-check-input"/><label
                                            htmlFor="formCheck1" className="form-check-label form-label">Test
                                            Connection</label></div>
                                    </CardBody>

                                </Card>

                                <div className="text-end mb-4">
                                    <button type="submit" className="btn btn-secondary w-sm me-1">Create</button>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default CreateDatabase;