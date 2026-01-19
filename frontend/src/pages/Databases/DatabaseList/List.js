import React, {useState, useEffect, useCallback} from 'react';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    Container, DropdownItem, DropdownMenu, DropdownToggle, Form, FormFeedback, Input, Label,
    Modal,
    ModalBody,
    ModalHeader,
    Row, UncontrolledDropdown
} from 'reactstrap';
import BreadCrumb from '../../../Components/Common/BreadCrumb';
import {Link, useNavigate} from 'react-router-dom';
import * as Yup from "yup";

// Import Images
import {useDispatch, useSelector} from "react-redux";
import {createSelector} from "reselect";
import {
    createDatabase,
    deleteDatabaseList,
    getDatabaseList as onGetDatabaseList, updateDatabase
} from "../../../slices/database/thunk";
import {ToastContainer} from "react-toastify";
import DeleteModal from "../../../Components/Common/DeleteModal";
import {useFormik} from "formik";
import MyPagination from "../../../Components/MyPagination";
import LoaderComponent from "../../../Components/Common/LoaderComponent";
import {createSync} from "../../../slices/sync/thunk";
import {syncFromDatabase as onSyncFromDatabase} from "../../../slices/sync/thunk";
import {OptionSyncBackward, OptionSyncForward} from "../../../common/const";
import {
    exportIndexes as onExportIndexes,
    importIndexes as onImportIndexes,
} from "../../../slices/index/thunk";
import {databaseActions} from "../../../slices/database/reducer";

const ListTables = () => {
        const dispatch = useDispatch();
        const navigate = useNavigate()

        function handlePageChange(page) {
            setCurrentPage(page)
        }

        const selectDatabaseState = (state) => state.Databases;
        const selectDashboardData = createSelector(
            [selectDatabaseState],
            (databases) => ({
                databaseLists: databases.list,
                databaseCurrent: databases.current,
                reload: databases.reload,
                loading: databases.loading,
            })
        );

        const {databaseLists, databaseCurrent, reload, loading} = useSelector(selectDashboardData);
        const [paging, setPaging] = useState({})   // const [page, setPage] = useState(1);
        const [currentPage, setCurrentPage] = useState(1);
        const [database, setDatabase] = useState(null);
        const [deleteModal, setDeleteModal] = useState(false)
        //modal
        const [modal, setModal] = useState(false);
        const [modalExport, setModalExport] = useState(false);
        const [modalImport, setModalImport] = useState(false);
        const [isEdit, setIsEdit] = useState(false);
        const [query, setQuery] = useState('');
        const [isLoading, setIsLoading] = useState(false);
        const [selectedFile, setSelectedFile] = useState(null)

        const toggle = useCallback(() => {
            if (modal) {
                setModal(false);
                setDatabase(null);
            } else {
                setModal(true);
            }
        }, [modal]);

        const toggleExport = useCallback(() => {
            if (modalExport) {
                setModalExport(false);
                setDatabase(null);
            } else {
                setModalExport(true);
            }
        }, [modalExport]);

        const toggleImport = useCallback(() => {
            if (modalImport) {
                setModalImport(false);
                setDatabase(null);
            } else {
                setModalImport(true);
            }
            console.log("toggleImport | modalImport: " + modalImport)
        }, [modalImport]);


        useEffect(() => {
            dispatch(onGetDatabaseList({page: currentPage}));
            console.log("dispatch start")
        }, [dispatch]);


        useEffect(() => {
            console.log(databaseLists)
            setDatabase(databaseLists);
            const pagination = databaseLists?.extra;
            if (pagination) {
                const pagingData = {
                    ...pagination,
                    totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 1))
                };
                setPaging(pagingData);
            }
        }, [databaseLists]);

        useEffect(() => {
            setIsLoading(loading)
            console.log("loading: ", loading)
        }, [loading]);


        useEffect(() => {
            console.log("Updated paging", paging);
        }, [paging]);

        useEffect(() => {
            console.log("Updated databaseLists", databaseLists)
        }, [databaseLists])

        useEffect(() => {
            dispatch(onGetDatabaseList({page: currentPage}));
            setIsLoading(false)
            console.log("Page changed. Current page: " + currentPage)
        }, [currentPage, reload])

        const fetchResults = async (searchQuery) => {
            setCurrentPage(1)
            dispatch(onGetDatabaseList({page: currentPage, database_name: searchQuery}))
        };

        const debouncedFetchResults = useCallback(_.debounce(fetchResults, 500), []);

        useEffect(() => {
            if (query !== '') {
                debouncedFetchResults(query);
            } else {
                fetchResults(''); // Fetch results immediately for an empty query
            }
        }, [query, debouncedFetchResults]);

        const [modal_list, setmodal_list] = useState(false);

        function tog_list() {
            setmodal_list(!modal_list);
        }

        const [modal_delete, setmodal_delete] = useState(false);

        function tog_delete() {
            setmodal_delete(!modal_delete);
        }

        // delete
        const onClickData = (database) => {
            setDatabase(database);
            setDeleteModal(true);
        };
        const onClickViewCollection = (db) => {
            console.log("database_id" + db.id)
            dispatch(databaseActions.setDatabaseCurrent(db))
            navigate("/collections")
        };
        const onClickExport = (database) => {
            setDatabase(database);
            toggleExport()
            // dispatch(onExportIndexes({database_id: database.id}))
        };
        const onClickImport = (database) => {
            document.getElementById('fileImport').click()
            setDatabase(database);
        };
        const onClickSyncFromDatabase = (db) => {
            dispatch(databaseActions.setDatabaseCurrent(db))
            dispatch(onSyncFromDatabase({values: {database_id: db.id}}))
        };
        const onFileChange = (event) => {
            setSelectedFile(event.target.files[0]);
            toggleImport()
        };

        const handleDeleteProjectList = () => {
            if (database) {
                dispatch(deleteDatabaseList(database));
                setDeleteModal(false);
            }
        };

        // Update Data
        const handleCustomerClick = useCallback((arg) => {
            const database = arg;

            setDatabase({
                id: database.id,
                name: database.name,
                uri: database.uri,
                db_name: database.db_name,
                description: database.description,
                test_connection: database.test_connection,
            });

            setIsEdit(true);
            toggle();

            console.log(database)
        }, [toggle]);

        // Add Data
        const handleTaskClicks = () => {
            setDatabase("");
            setIsEdit(false);
            toggle();
        };

        const mongoUriRegex = /^(mongodb(?:\+srv)?):\/\/(?:[^:\s]+(?::[^@\s]*)?@)?((?:[^:\/\s]+(?::\d{2,5})?)(?:,(?:[^:\/\s]+(?::\d{2,5})?))*)(?:\/(\w+))?(?:\?.*)?$/

        const validation = useFormik({
            enableReinitialize: true,

            initialValues: {
                id: (database && database.id) || '',
                name: (database && database.name) || '',
                uri: (database && database.uri) || '',
                db_name: (database && database.db_name) || '',
                description: (database && database.description) || '',
                test_connection: (database && database.test_connection) || false,
                is_sync: false,
            },

            validationSchema: Yup.object({
                name: Yup.string().required("Name is required"),
                uri: Yup.string().matches(mongoUriRegex, "URI should follow MongoDB format").required("URI is required"),
                db_name: Yup.string().required("Database name is required"),
            }),

            onSubmit: (values) => {
                if (isEdit) {
                    setIsLoading(true)
                    if (values.test_connection) {
                        values.is_test_connection = true
                    }
                    dispatch(updateDatabase(values)).then(() => {
                        validation.resetForm();
                    })
                    console.log("submitted UpdateDatabase")
                } else {
                    if (values.test_connection) {
                        console.log("Testing connection")
                        setIsLoading(true)
                        values.is_test_connection = true
                    }
                    dispatch(createDatabase(values)).then((data) => {
                        console.log("Database created", data)
                        if (values.is_sync && data.payload) {
                            dispatch(createSync({
                                values: {
                                    database_id: data.payload.id,
                                    option_extra: OptionSyncBackward,
                                    option_missing: OptionSyncForward
                                }
                            }));
                        }
                        validation.resetForm();
                    })

                    console.log("submitted CreateDatabase")
                }
                toggle();
            }
        });

        const validationExport = useFormik({
                    enableReinitialize: true,

                    initialValues: {
                        secretKey: "",
                    },

                    validationSchema: Yup.object({
                        secretKey: Yup.string().required("Secret key is required"),
                    }),

                    onSubmit: (values) => {
                        // setIsLoading(true)
                        dispatch(onExportIndexes({database_id: database.id, secret_key: values.secretKey})).then(() => {
                            validation.resetForm();
                        })
                        toggleExport();
                        console.log("submitted CreateDatabase")
                    }
                }
            )
        ;

        const validationImport = useFormik({
                    enableReinitialize: true,
                    initialValues: {
                        secretKey: "",
                    },
                    validationSchema: Yup.object({
                        secretKey: Yup.string().required("Secret key is required"),
                    }),
                    onSubmit: (values) => {
                        if (selectedFile) {
                            dispatch(onImportIndexes({
                                database_id: database.id,
                                file: selectedFile,
                                secret_key: values.secretKey
                            })).then(() => {
                                validation.resetForm();
                            })
                            toggleImport();
                            console.log("Imported Indexes")

                        } else {
                            alert('No file selected');
                        }
                    }
                }
            )
        ;


        const defaultdate = () => {
            let d = new Date(),
                months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return ((d.getDate() + ' ' + months[d.getMonth()] + ', ' + d.getFullYear()).toString());
        };

        const [date, setDate] = useState(defaultdate());

        document.title = "Databases | DRManager";
        return (
            <React.Fragment>
                <ToastContainer closeButton={false}/>
                <DeleteModal
                    show={deleteModal}
                    onDeleteClick={() => handleDeleteProjectList()}
                    onCloseClick={() => setDeleteModal(false)}
                />

                <Container fluid>

                    {isLoading ? <LoaderComponent/> :

                        <Row>
                            <Col lg={12}>
                                <Card>
                                    <CardHeader>
                                        <h4 className="card-title mb-0">Add, Edit & Remove</h4>
                                    </CardHeader>

                                    <CardBody>
                                        <div className="listjs-table" id="customerList">
                                            <Row className="g-4 mb-3">
                                                <Col className="col-sm-auto">
                                                    <div>
                                                        <button className="btn btn-primary add-btn me-1" onClick={() => {
                                                            setIsEdit(false);
                                                            toggle();
                                                        }}><i className="ri-add-line align-bottom me-1"></i> Create Database
                                                        </button>
                                                        <button className="btn btn-soft-danger"><i
                                                            className="ri-delete-bin-2-line"></i></button>
                                                    </div>
                                                </Col>
                                                <Col className="col-sm">
                                                    <div className="d-flex justify-content-sm-end">
                                                        <div className="search-box ms-2">
                                                            <input type="text" className="form-control search"
                                                                   value={query}
                                                                   onChange={(e) => setQuery(e.target.value)}
                                                                   placeholder="Search..."/>
                                                            <i className="ri-search-line search-icon"></i>
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>

                                            <div className="table-responsive table-card mt-3 mb-1">
                                                <table className="table align-middle table-nowrap" id="customerTable">
                                                    <thead className="table-light">
                                                    <tr>
                                                        <th scope="col" style={{width: "50px"}}>
                                                            {/*<div className="form-check">*/}
                                                            {/*    <input className="form-check-input" type="checkbox"*/}
                                                            {/*           id="checkAll" value="option"/>*/}
                                                            {/*</div>*/}
                                                        </th>
                                                        <th className="sort" data-sort="customer_name">Connection Name</th>
                                                        <th className="sort" data-sort="email">URI</th>
                                                        <th className="sort" data-sort="phone">Database Name</th>
                                                        <th className="sort" data-sort="status">Description</th>
                                                        <th className="sort" data-sort="date">Date Created</th>
                                                        <th className="sort" data-sort="action">Action</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody className="list form-check-all">

                                                    {((databaseLists ? databaseLists.records : []) || []).map((data, index) => (
                                                        <tr key={index}>
                                                            <th scope="row">
                                                                {/*<div className="form-check">*/}
                                                                {/*    <input className="form-check-input" type="checkbox"*/}
                                                                {/*           name="checkAll" value="option1"/>*/}
                                                                {/*</div>*/}
                                                            </th>
                                                            <td className="customer_name">{data.name}</td>
                                                            <td className="email">{data.uri}</td>
                                                            <td className="phone"><span
                                                                className="badge bg-success-subtle text-success text-uppercase">{data.db_name}</span>
                                                            </td>
                                                            <td className="status"><span
                                                                className="">{data.description}</span>
                                                            </td>
                                                            <td className="date">{new Date(data.created_at).toLocaleString()}</td>
                                                            <td>
                                                                <div className="d-flex gap-2">
                                                                    <div className="edit">
                                                                        <button
                                                                            className="btn btn-sm btn-info edit-item-btn"
                                                                            onClick={() => {
                                                                                handleCustomerClick(data);
                                                                            }}
                                                                            data-bs-toggle="modal"
                                                                            data-bs-target="#showModal">
                                                                            <i class="ri-edit-circle-fill label-icon align-middle fs-16 me-2"></i>
                                                                            Edit
                                                                        </button>
                                                                    </div>
                                                                    <button href="#" onClick={() => onClickData(data)}
                                                                            className="btn btn-sm btn-danger remove-item-btn"
                                                                            data-bs-toggle="modal"
                                                                            data-bs-target="#removeProjectModal">
                                                                        <i class=" ri-delete-bin-7-line label-icon align-middle fs-16 me-2"></i>
                                                                        Remove
                                                                    </button>
                                                                    <button href="#"
                                                                            onClick={() => onClickViewCollection(data)}
                                                                            className="btn btn-sm btn-warning remove-item-btn"
                                                                            data-bs-toggle="modal"
                                                                    >
                                                                        <i class="ri-inbox-unarchive-fill label-icon align-middle fs-16 me-2"></i>
                                                                        View Collections
                                                                    </button>
                                                                    <button
                                                                        onClick={() => onClickExport(data)}
                                                                        className="btn btn-sm btn-warning export-btn"
                                                                        data-bs-toggle="modal"
                                                                        data-bs-target="#exportModal">
                                                                        <i class="ri-export-fill label-icon align-middle fs-16 me-2"></i>
                                                                        Export
                                                                    </button>
                                                                    <button
                                                                        onClick={() => onClickImport(data)}
                                                                        className="btn btn-sm btn-success import-btn">
                                                                        <i class="ri-export label-icon align-middle fs-16 me-2"></i>
                                                                        Import
                                                                    </button>
                                                                    <button
                                                                        onClick={() => onClickSyncFromDatabase(data)}
                                                                        className="btn btn-sm btn-primary">
                                                                        <i class="ri-refresh-line label-icon align-middle fs-16 me-2"></i>
                                                                        Sync from DB
                                                                    </button>
                                                                </div>
                                                                <input
                                                                    type="file"
                                                                    id="fileImport"
                                                                    value=""
                                                                    style={{display: 'none'}}
                                                                    onChange={onFileChange}
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}

                                                    </tbody>
                                                </table>
                                                <div className="noresult" style={{display: "none"}}>
                                                    <div className="text-center">
                                                        <lord-icon src="/assets/jsons/lordicon/msoeawqm.json"
                                                                   trigger="loop"
                                                                   colors="primary:#121331,secondary:#08a88a"
                                                                   style={{width: "75px", height: "75px"}}>
                                                        </lord-icon>
                                                        <h5 className="mt-2">Sorry! No Result Found</h5>
                                                        <p className="text-muted mb-0">We've searched more than 150+ Orders
                                                            We did not find any
                                                            orders for you search.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {paging &&
                                                <MyPagination paging={paging} currentPage={currentPage}
                                                              handlePageChange={handlePageChange}/>
                                            }

                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>

                    }
                </Container>

                <Modal
                    isOpen={modal}
                    toggle={toggle}
                    centered
                    size="lg"
                    className="border-0"
                    modalClassName='modal fade zoomIn'
                >
                    <ModalHeader className="p-3 bg-info-subtle" toggle={toggle}>
                        {!!isEdit ? "Edit Database" : "Create Database"}
                    </ModalHeader>
                    <Form className="tablelist-form"
                          onSubmit={(e) => {
                              e.preventDefault();
                              validation.handleSubmit();
                              return false;
                          }}>
                        <ModalBody className="modal-body">
                            <BreadCrumb title="Create Database Connection" pageTitle="Databases"/>
                            <Row>
                                <Col lg={12}>
                                    <Card>
                                        <CardBody>
                                            <p className="text-muted"> Create your new Mongo DB connection. Your URI
                                                should
                                                follow this format <code>mongodb://localhost:27017</code></p>
                                            <div className="mb-3">
                                                <Label className="form-label" htmlFor="Database-title-input">
                                                    Connection Name</Label>
                                                <Input type="text" className="form-control"
                                                       id="name"
                                                       name="name"
                                                       value={validation.values.name}
                                                       onChange={validation.handleChange}
                                                       onBlur={validation.handleBlur}
                                                       invalid={validation.touched.name && !!validation.errors.name}
                                                       placeholder="Enter connection name"/>
                                                {validation.touched.name && validation.errors.name ? (
                                                    <FormFeedback>{validation.errors.name}</FormFeedback>
                                                ) : null}
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
                                                               onBlur={validation.handleBlur}
                                                               invalid={validation.touched.uri && !!validation.errors.uri}
                                                               placeholder="Enter connection URI"/>
                                                        {validation.touched.uri && validation.errors.uri ? (
                                                            <FormFeedback>{validation.errors.uri}</FormFeedback>
                                                        ) : null}
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
                                                               placeholder="Enter database name"
                                                               onBlur={validation.handleBlur}
                                                               invalid={validation.touched.db_name && !!validation.errors.db_name}
                                                        />
                                                        {validation.touched.db_name && validation.errors.db_name ? (
                                                            <FormFeedback>{validation.errors.db_name}</FormFeedback>
                                                        ) : null}
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
                                                Connection</label>
                                            </div>
                                            <div class="form-check mb-2" id="is_sync">
                                                <input
                                                    id="is_sync"
                                                    name="is_sync"
                                                    value={validation.values.is_sync}
                                                    onChange={validation.handleChange}
                                                    type="checkbox"
                                                    className="form-check-input form-check-input"/><label
                                                htmlFor="formCheck1" className="form-check-label form-label">Import all
                                                existed indexes</label>
                                            </div>
                                        </CardBody>

                                    </Card>
                                </Col>
                            </Row>

                        </ModalBody>
                        <div className="modal-footer">
                            <div className="hstack gap-2 justify-content-end">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setModal(false);
                                    }}
                                    className="btn-light"
                                >Close</Button>
                                <button type="submit" className="btn btn-success"
                                        id="add-btn">{!!isEdit ? "Update Database" : "Add Database"}</button>
                            </div>
                        </div>
                    </Form>
                </Modal>

                <Modal
                    isOpen={modalExport}
                    toggle={toggleExport}
                    centered
                    size="sm"
                    className="border-0"
                    modalClassName='modal fade zoomIn'
                >
                    <ModalHeader className="p-3 bg-info-subtle" toggle={toggleExport}>
                        Export Indexes
                    </ModalHeader>
                    <Form className="tablelist-form"
                          onSubmit={(e) => {
                              e.preventDefault();
                              validationExport.handleSubmit();
                              return false;
                          }}>
                        <ModalBody className="modal-body">
                            <Row>
                                <Col lg={12}>
                                    <Card>
                                        <CardBody>
                                            <div className="mb-3">
                                                <Label className="form-label">Secret Key</Label>
                                                <input
                                                    className="form-control"
                                                    id="secretKey"
                                                    name="secretKey"
                                                    value={validationExport.values.secretKey}
                                                    onChange={validationExport.handleChange}
                                                ></input>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </Col>
                            </Row>
                        </ModalBody>
                        <div className="modal-footer">
                            <div className="hstack gap-2 justify-content-end">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setModalExport(false);
                                    }}
                                    className="btn-light"
                                >Close</Button>
                                <button type="submit" className="btn btn-success"
                                        id="add-btn">Let's Export
                                </button>
                            </div>
                        </div>
                    </Form>
                </Modal>

                <Modal
                    isOpen={modalImport}
                    toggle={toggleImport}
                    centered
                    size="sm"
                    className="border-0"
                    modalClassName='modal fade zoomIn'
                >
                    <ModalHeader className="p-3 bg-info-subtle" toggle={toggleImport}>
                        Import Indexes
                    </ModalHeader>
                    <Form className="tablelist-form"
                          onSubmit={(e) => {
                              e.preventDefault();
                              validationImport.handleSubmit();
                              return false;
                          }}>
                        <ModalBody className="modal-body">
                            <Row>
                                <Col lg={12}>
                                    <Card>
                                        <CardBody>
                                            <div className="mb-3">
                                                <Label className="form-label">Secret Key</Label>
                                                <input
                                                    className="form-control"
                                                    id="secretKey"
                                                    name="secretKey"
                                                    value={validationImport.values.secretKey}
                                                    onChange={validationImport.handleChange}
                                                ></input>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </Col>
                            </Row>
                        </ModalBody>
                        <div className="modal-footer">
                            <div className="hstack gap-2 justify-content-end">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setModalImport(false);
                                    }}
                                    className="btn-light"
                                >Close</Button>
                                <button type="submit" className="btn btn-success"
                                        id="add-btn">Let's Import
                                </button>
                            </div>
                        </div>
                    </Form>
                </Modal>
            </React.Fragment>
        )
            ;
    }
;

export default ListTables;
