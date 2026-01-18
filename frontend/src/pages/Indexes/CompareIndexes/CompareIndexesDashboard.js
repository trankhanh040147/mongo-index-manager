import React, {useEffect, useState} from "react";

//Import Breadcrumb
import BreadCrumb from "../../../Components/Common/BreadCrumb";

import {
    Container,
    Form,
    Row,
    Col,
    Card,
    CardBody,
    CardHeader,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
    Modal,
    ModalFooter,
    ModalHeader,
    ModalBody,
    Label,
    Input,
} from "reactstrap";

import Select from "react-select";
import classnames from "classnames";
import {Link} from "react-router-dom";
import ChooseDatabaseComponent from "./Components/ChooseDatabase";
import ChooseCollectionComponent from "./Components/ChooseCollection";
import "./CompareIndexes.css";
import "../indexTable.css"
import CompareIndexesByDatabaseComponent from "./Components/CompareIndexesByDatabase"; // Import  file
import CompareIndexesByCollectionComponent from "./Components/CompareIndexesByCollection";
import SyncHistory from "./Components/SyncHistory";
import {compareByCollection as onCompareByCollection, createSync} from "../../../slices/sync/thunk";
import {useDispatch} from "react-redux";
import {toast, ToastContainer} from "react-toastify";
import DeleteModal from "../../../Components/Common/DeleteModal";
import SyncModal from "./Components/SyncModal";


const CompareIndexesDashboard = () => {
        const dispatch = useDispatch();

        const [selectedDatabase, setSelectedDatabase] = useState(null);
        const [selectedCollection, setSelectedCollection] = useState(null);
        const [selectedState, setselectedState] = useState(null);
        const [activeTab, setactiveTab] = useState(1);
        const [passedSteps, setPassedSteps] = useState([1]);
        const [modal, setModal] = useState(false);
        const [deletemodal, setDeleteModal] = useState(false);
        const [compareMethod, setCompareMethod] = useState("database");
        const [syncModal, setSyncModal] = useState(false)
        const [optionMissingIndexes, setOptionMissingIndexes] = useState(1);
        const [optionExtraIndexes, setOptionExtraIndexes] = useState(1);

        const toggledeletemodal = () => {
            setDeleteModal(!deletemodal);
        };

        const togglemodal = () => {
            setModal(!modal);
        };

        function handleSelectState(selectedState) {
            setselectedState(selectedState);
        }

        function toggleTab(tab) {
            if (activeTab !== tab) {
                var modifiedSteps = [...passedSteps, tab];

                if (tab >= 1 && tab <= 4) {
                    setactiveTab(tab);
                    setPassedSteps(modifiedSteps);
                }
            }
        }

        useEffect(() => {
            console.log("activeTab: ", activeTab)
        }, [activeTab]);

        function handleClickStartSync() {
            console.log("selectedDatabase: ", selectedDatabase)
            console.log("selectedCollection: ", selectedCollection)
            if (selectedDatabase) {
                dispatch(createSync({
                    values: {
                        database_id: selectedDatabase.id,
                        collection_name: selectedCollection && selectedCollection.collection,
                        option_extra: optionExtraIndexes,
                        option_missing: optionMissingIndexes
                    }
                }));
                resetData();
                toggleTab(4);
            } else {
                toast.error("Please select a database and collection to start syncing", {autoClose: 2500})
            }
            setSyncModal(false);
        }

        function onClickStartSyncing() {
            setSyncModal(true)
        }

        function onClickReload() {
            setSelectedCollection(selectedCollection)
        }

        function resetData() {
            console.log("current step: " + passedSteps)
            setSelectedCollection(null)
        }

        return (
            <React.Fragment>
                <ToastContainer closeButton={false}/>
                <SyncModal
                    show={syncModal}
                    onStartSyncClick={() => handleClickStartSync()}
                    onCloseClick={() => setSyncModal(false)}
                    optionMissingIndexes={optionMissingIndexes}
                    setOptionMissingIndexes={setOptionMissingIndexes}
                    optionExtraIndexes={optionExtraIndexes}
                    setOptionExtraIndexes={setOptionExtraIndexes}
                />
                <Row>
                    <Col xl="12">
                        <Card>
                            <CardBody className="checkout-tab">
                                <Form action="#">
                                    <div className="step-arrow-nav mt-n3 mx-n3 mb-3">
                                        <Nav
                                            className="nav-pills nav-justified custom-nav"
                                            role="tablist"
                                        >
                                            <NavItem role="presentation">
                                                <NavLink href="#"
                                                         className={classnames({
                                                             active: activeTab === 1,
                                                             done: (activeTab <= 4 && activeTab >= 0)
                                                         }, "fs-15 p-3")}
                                                         onClick={() => {
                                                             if (activeTab > 1) {
                                                                 toggleTab(1);
                                                             }
                                                         }}
                                                >
                                                    <i className=" ri-database-2-line fs-16 p-2 bg-primary-subtle text-primary rounded-circle align-middle me-2"></i>{" "}
                                                    Choose Database
                                                </NavLink>
                                            </NavItem>
                                            <NavItem role="presentation">
                                                <NavLink href="#"
                                                         className={classnames({
                                                             active: activeTab === 2,
                                                             done: activeTab <= 4 && activeTab > 1
                                                         }, "fs-15 p-3")}
                                                         onClick={() => {
                                                             if (activeTab > 2) {
                                                                 toggleTab(2);
                                                             }
                                                         }}
                                                >
                                                    <i className=" ri-tablet-line fs-16 p-2 bg-primary-subtle text-primary rounded-circle align-middle me-2"></i> {" "}
                                                    Choose Collection
                                                </NavLink>
                                            </NavItem>
                                            <NavItem role="presentation">
                                                <NavLink href="#"
                                                         className={classnames({
                                                             active: activeTab === 3,
                                                             done: activeTab <= 4 && activeTab > 2
                                                         }, "fs-15 p-3")}
                                                         onClick={() => {
                                                             if (activeTab > 3) {
                                                                 toggleTab(3);
                                                             }
                                                         }}
                                                >
                                                    <i className="ri-checkbox-multiple-blank-fill fs-16 p-2 bg-primary-subtle text-primary rounded-circle align-middle me-2"></i>{" "}
                                                    Compare Indexes
                                                </NavLink>
                                            </NavItem>
                                            <NavItem role="presentation">
                                                <NavLink href="#"
                                                         className={classnames({
                                                             active: activeTab === 4,
                                                             done: activeTab <= 4 && activeTab > 3
                                                         }, "fs-15 p-3")}
                                                         onClick={() => {
                                                             if (activeTab > 4) {
                                                                 toggleTab(4);
                                                             }
                                                         }}
                                                >
                                                    <i className="ri-checkbox-circle-line fs-16 p-2 bg-primary-subtle text-primary rounded-circle align-middle me-2"></i>{" "}
                                                    Finish
                                                </NavLink>
                                            </NavItem>
                                        </Nav>
                                    </div>

                                    <TabContent activeTab={activeTab}>
                                        <TabPane tabId={1} id="pills-bill-info">
                                            <div>
                                                <h5 className="mb-1">Choose Database</h5>
                                                <p className="text-muted mb-4">
                                                    Please choose a database below
                                                </p>
                                            </div>

                                            <ChooseDatabaseComponent
                                                setSelectedDatabase={setSelectedDatabase}
                                                activeTab={activeTab}
                                            />

                                            <div className="d-flex align-items-start gap-3 mt-3">
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-label right ms-auto nexttab"
                                                    disabled={selectedDatabase === null}
                                                    onClick={() => {
                                                        toggleTab(activeTab + 1);
                                                    }}
                                                >
                                                    <i className="ri-tablet-line label-icon align-middle fs-16 ms-2"></i>
                                                    Proceed to Choose Collection
                                                </button>
                                            </div>
                                        </TabPane>

                                        <TabPane tabId={2}>
                                            <div>
                                                <h5 className="mb-1">Choose Collection</h5>
                                                <p className="text-muted mb-4">
                                                    Please choose a collection to compare indexes
                                                </p>
                                            </div>

                                            <ChooseCollectionComponent
                                                selectedDatabase={selectedDatabase}
                                                setSelectedCollection={setSelectedCollection}
                                                activeTab={activeTab}
                                                compareMethod={compareMethod} setCompareMethod={setCompareMethod}
                                            />

                                            <div className="d-flex align-items-start gap-3 mt-4">
                                                <button
                                                    type="button"
                                                    className="btn btn-light btn-label previestab"
                                                    onClick={() => {
                                                        toggleTab(activeTab - 1);
                                                    }}
                                                >
                                                    <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>
                                                    Back to Choose Database
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-label right ms-auto nexttab"
                                                    onClick={() => {
                                                        toggleTab(activeTab + 1);
                                                    }}
                                                    disabled={compareMethod === "collection" && selectedCollection === null}
                                                >
                                                    <i className="ri-checkbox-multiple-blank-fill label-icon align-middle fs-16 ms-2"></i>
                                                    Continue to Compare Indexes
                                                </button>
                                            </div>
                                        </TabPane>

                                        <TabPane tabId={3}>
                                            <div>
                                                <h5 className="mb-1">Compare Indexes</h5>
                                                <p className="text-muted mb-4">
                                                    Here are the differences between the indexes of the selected collections
                                                </p>
                                            </div>
                                            {
                                                selectedCollection ?
                                                    (
                                                        <CompareIndexesByCollectionComponent
                                                            selectedDatabase={selectedDatabase}
                                                            selectedCollection={selectedCollection}
                                                            activeTab={activeTab}
                                                        />
                                                    ) :
                                                    (
                                                        <CompareIndexesByDatabaseComponent
                                                            selectedDatabase={selectedDatabase}
                                                            selectedCollection={selectedCollection}
                                                            activeTab={activeTab}
                                                        />
                                                    )
                                            }
                                            <div className="d-flex align-items-start gap-3 mt-4">
                                                <button
                                                    type="button"
                                                    className="btn btn-light btn-label previestab"
                                                    onClick={() => {
                                                        toggleTab(activeTab - 1);
                                                    }}
                                                >
                                                    <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>
                                                    Back to Choose Collection
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-label right ms-auto nexttab"
                                                    // onClick={() => {
                                                    //     handleClickStartSync()
                                                    // }}
                                                    onClick={() => onClickReload()}
                                                >
                                                    <i className=" ri-play-circle-fill label-icon align-middle fs-16 ms-2"></i>
                                                    Reload
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-label right ms-auto nexttab"
                                                    // onClick={() => {
                                                    //     handleClickStartSync()
                                                    // }}
                                                    onClick={() => onClickStartSyncing()}
                                                >
                                                    <i className=" ri-play-circle-fill label-icon align-middle fs-16 ms-2"></i>
                                                    Start Syncing
                                                </button>
                                            </div>
                                        </TabPane>

                                        <TabPane tabId={4} id="pills-finish">
                                            <div className="text-center py-5">
                                                <div className="mb-4">
                                                    <lord-icon
                                                        src="/jsons/lordicon/lupuorrc.json"
                                                        trigger="loop"
                                                        colors="primary:#695eef,secondary:#73dce9"
                                                        style={{width: "120px", height: "120px"}}
                                                    ></lord-icon>
                                                </div>
                                                <h5>Congratulations ! Your have started a new sync !</h5>
                                                <p className="text-muted">
                                                    You can see the sync progress on the Sync History on the right side.
                                                </p>

                                                {/*<h3 className="fw-semibold">*/}
                                                {/*    Syncing ID:{" "}*/}
                                                {/*    <a*/}
                                                {/*        href="apps-ecommerce-order-details"*/}
                                                {/*        className="text-decoration-underline"*/}
                                                {/*    >*/}
                                                {/*        fhqwoiaoipfj124*/}
                                                {/*    </a>*/}
                                                {/*</h3>*/}
                                            </div>
                                        </TabPane>
                                    </TabContent>
                                </Form>
                            </CardBody>
                        </Card>
                    </Col>

                    <Col xl={12}>
                        <Card>
                            <CardHeader>
                                <div className="d-flex">
                                    <div className="flex-grow-1">
                                        <h5 className="card-title mb-0">Sync History</h5>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <div className="table-responsive table-card">
                                    <table className="table table-borderless align-middle mb-0">
                                        <thead className="table-light text-muted">
                                        <tr>
                                            <th style={{width: "90px"}} scope="col">
                                                Detail of all sync processes
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <SyncHistory/>
                                        </tbody>
                                    </table>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
                {/*<Modal*/}
                {/*    isOpen={deletemodal}*/}
                {/*    role="dialog"*/}
                {/*    autoFocus={true}*/}
                {/*    centered*/}
                {/*    id="removeItemModal"*/}
                {/*    toggle={toggledeletemodal}*/}
                {/*>*/}
                {/*    <ModalHeader toggle={() => {*/}
                {/*        setDeleteModal(!deletemodal);*/}
                {/*    }}>*/}
                {/*    </ModalHeader>*/}
                {/*    <ModalBody>*/}
                {/*        <div className="mt-2 text-center">*/}
                {/*            <lord-icon*/}
                {/*                src="https://cdn.lordicon.com/gsqxdxog.json"*/}
                {/*                trigger="loop"*/}
                {/*                colors="primary:#ffc061,secondary:#ff7f41"*/}
                {/*                style={{width: "100px", height: "100px"}}*/}
                {/*            ></lord-icon>*/}
                {/*            <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">*/}
                {/*                <h4>Are you sure ?</h4>*/}
                {/*                <p className="text-muted mx-4 mb-0">*/}
                {/*                    Are you Sure You want to Remove this Address ?*/}
                {/*                </p>*/}
                {/*            </div>*/}
                {/*        </div>*/}
                {/*        <div className="d-flex gap-2 justify-content-center mt-4 mb-2">*/}
                {/*            <button*/}
                {/*                type="button"*/}
                {/*                className="btn w-sm btn-light"*/}
                {/*                onClick={() => {*/}
                {/*                    setDeleteModal(!deletemodal);*/}
                {/*                }}*/}
                {/*            >*/}
                {/*                Close*/}
                {/*            </button>*/}
                {/*            <button type="button" className="btn w-sm btn-danger" onClick={() => {*/}
                {/*                setDeleteModal(!deletemodal);*/}
                {/*            }}>*/}
                {/*                Yes, Delete It!*/}
                {/*            </button>*/}
                {/*        </div>*/}
                {/*    </ModalBody>*/}
                {/*</Modal>*/}

                {/*<Modal*/}
                {/*    isOpen={modal}*/}
                {/*    role="dialog"*/}
                {/*    autoFocus={true}*/}
                {/*    centered*/}
                {/*    id="addAddressModal"*/}
                {/*    toggle={togglemodal}*/}
                {/*>*/}
                {/*    <ModalHeader*/}
                {/*        toggle={() => {*/}
                {/*            setModal(!modal);*/}
                {/*        }}*/}
                {/*    >*/}
                {/*        <h5 className="modal-title" id="addAddressModalLabel">*/}
                {/*            Address*/}
                {/*        </h5>*/}
                {/*    </ModalHeader>*/}
                {/*    <ModalBody>*/}
                {/*        <div>*/}
                {/*            <div className="mb-3">*/}
                {/*                <Label for="addaddress-Name" className="form-label">*/}
                {/*                    Name*/}
                {/*                </Label>*/}
                {/*                <Input*/}
                {/*                    type="text"*/}
                {/*                    className="form-control"*/}
                {/*                    id="addaddress-Name"*/}
                {/*                    placeholder="Enter Name"*/}
                {/*                />*/}
                {/*            </div>*/}

                {/*            <div className="mb-3">*/}
                {/*                <Label for="addaddress-textarea" className="form-label">*/}
                {/*                    Address*/}
                {/*                </Label>*/}
                {/*                <textarea*/}
                {/*                    className="form-control"*/}
                {/*                    id="addaddress-textarea"*/}
                {/*                    placeholder="Enter Address"*/}
                {/*                    rows="2"*/}
                {/*                ></textarea>*/}
                {/*            </div>*/}

                {/*            <div className="mb-3">*/}
                {/*                <Label for="addaddress-Name" className="form-label">*/}
                {/*                    Phone*/}
                {/*                </Label>*/}
                {/*                <Input*/}
                {/*                    type="text"*/}
                {/*                    className="form-control"*/}
                {/*                    id="addaddress-Name"*/}
                {/*                    placeholder="Enter Phone No."*/}
                {/*                />*/}
                {/*            </div>*/}

                {/*            <div className="mb-3">*/}
                {/*                <Label for="state" className="form-label">*/}
                {/*                    Address Type*/}
                {/*                </Label>*/}
                {/*                <select className="form-select" id="state" data-plugin="choices">*/}
                {/*                    <option value="homeAddress">Home (7am to 10pm)</option>*/}
                {/*                    <option value="officeAddress">Office (11am to 7pm)</option>*/}
                {/*                </select>*/}
                {/*            </div>*/}
                {/*        </div>*/}
                {/*    </ModalBody>*/}
                {/*    <ModalFooter>*/}
                {/*        <button*/}
                {/*            type="button"*/}
                {/*            className="btn btn-light"*/}
                {/*            onClick={() => {*/}
                {/*                setModal(!modal);*/}
                {/*            }}*/}
                {/*        >*/}
                {/*            Close*/}
                {/*        </button>*/}
                {/*        <button*/}
                {/*            type="button"*/}
                {/*            className="btn btn-success"*/}
                {/*            onClick={() => {*/}
                {/*                setModal(!modal);*/}
                {/*            }}*/}
                {/*        >*/}
                {/*            Save*/}
                {/*        </button>*/}
                {/*    </ModalFooter>*/}
                {/*</Modal>*/}
            </React.Fragment>
        );
    }
;

export default CompareIndexesDashboard;
