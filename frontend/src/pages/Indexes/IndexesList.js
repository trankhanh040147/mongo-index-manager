import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Button, Card, CardBody, CardHeader, Col, NavLink, Row} from 'reactstrap';
import {Link} from 'react-router-dom';
import IndexTable from "./IndexTable";
import NewIndex from "./NewIndex";
import {useDispatch, useSelector} from "react-redux";
import {getCurrentCollection, getCurrentDatabase} from "../../helpers/api_helper";
import {createSelector} from "reselect";
import {useFormik} from "formik";
import {
    createIndex, deleteIndexList,
    getIndexList as onGetIndexList, updateIndex,
} from "../../slices/index/thunk";
import {ToastContainer} from "react-toastify";
import LoaderComponent from "../../Components/Common/LoaderComponent";

const defaultdate = () => {
    let d = new Date(),
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return ((d.getDate() + ' ' + months[d.getMonth()] + ', ' + d.getFullYear()).toString());
};

const IndexesListComponent = ({}) => {
    const dispatch = useDispatch();

    // state
    let currentDatabase = useSelector(state => state.Databases.current)
    let currentCollection = useSelector(state => state.Collections.current)
    const selectIndexState = (state) => state.Indexes;
    const [paging, setPaging] = useState({})   // const [page, setPage] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [index, setIndex] = useState(null);
    const [deleteModal, setDeleteModal] = useState(false)
    const [modal, setModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [modal_list, setmodal_list] = useState(false);
    const [modal_delete, setmodal_delete] = useState(false);
    const [date, setDate] = useState(defaultdate());
    const dateformate = (e) => {
        const date = e.toString().split(" ");
        const joinDate = (date[2] + " " + date[1] + ", " + date[3]).toString();
        setDate(joinDate);
    };

    // selector
    const selectDashboardData = createSelector(
        [selectIndexState],
        (indexes) => ({
            indexLists: indexes.indexLists,
            reload: indexes.reload,
            loading: indexes.loading,
        })
    );
    const {indexLists, reload, loading} = useSelector(selectDashboardData);

    useEffect(() => {
        if (currentDatabase?.id && currentCollection) {
            dispatch(onGetIndexList({database_id: currentDatabase.id, collection: currentCollection}));
        }
    }, [dispatch, currentDatabase?.id, currentCollection]);

    useEffect(() => {
        console.log(indexLists)
        setIndex(indexLists);
        const pagination = indexLists?.extra;
        if (pagination) {
            const pagingData = {
                ...pagination,
                totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 1))
            };
            setPaging(pagingData);
        }
    }, [indexLists]);
    useEffect(() => {
        console.log("Updated paging", paging);
    }, [paging]);
    useEffect(() => {
        console.log("Updated indexLists", indexLists)
    }, [indexLists])
    useEffect(() => {
        if (currentDatabase?.id && currentCollection) {
            dispatch(onGetIndexList({database_id: currentDatabase.id, collection: currentCollection}));
            console.log("Page changed. Current page: " + currentPage)
        }
    }, [currentPage, reload, currentDatabase?.id, currentCollection])

    const toggle = useCallback(() => {
        if (modal) {
            setModal(false);
            setSelectedIndex({});
        } else {
            setModal(true);
            setDate(defaultdate());
        }
    }, [modal]);

    function tog_list() {
        setmodal_list(!modal_list);
    }

    function tog_delete() {
        setmodal_delete(!modal_delete);
    }

    const handleCustomerClick = useCallback((arg) => {
        const index = arg;

        setIndex({
            id: index.id,
            name: index.name,
            uri: index.uri,
            db_name: index.db_name,
            description: index.description,
            test_connection: index.test_connection,
        });

        setIsEdit(true);
        toggle();

        console.log(index)
    }, [toggle]);
    const handleTaskClicks = () => {
        setIndex("");
        setIsEdit(false);
        toggle();
    };
    const handleDeleteProjectList = () => {
        if (index) {
            // dispatch(deleteIndexList(index));
            setDeleteModal(false);
        }
    };

    function handlePageChange(page) {
        setCurrentPage(page)
    }

    const [selectedIndex, setSelectedIndex] = useState({});
    const [selectedIds, setSelectedIds] = useState([]);

    const onToggleOne = (id) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    };

    const onToggleAll = () => {
        const ids = (indexLists?.records || []).filter(r => r.name !== '_id_').map((r) => r.id);
        setSelectedIds((prev) => (prev.length === ids.length ? [] : ids));
    };

    const onBulkDelete = () => {
        selectedIds.forEach((id) => dispatch(deleteIndexList({data: {id}})));
        setSelectedIds([]);
    };

    const handleCreateOrUpdateIndex = (values, isEdit) => {
        console.log("handleCreateOrUpdateIndex")
        values.id = selectedIndex.id;
        values.database_id = currentDatabase.id
        values.collection = currentCollection
        if (isEdit) {
            dispatch(updateIndex({values: values}));
        } else {
            dispatch(createIndex({values: values}));
        }
    };

    const handleEditClick = (index) => {
        setSelectedIndex(index)
        setIsEdit(true);
        toggle();
    };

    const handleDeleteClick = (index) => {
        // setSelectedIndex(index)
        console.log("Delete index with id:", index.id)
        dispatch(deleteIndexList({data: {id: index.id}}));
    };

    const handleCreateClick = () => {
        setSelectedIndex({});
        setIsEdit(false)
        toggle();
    };

    const handleEdit = (index) => {
        console.log('Edit index:', index);
    };

    const handleDelete = (id) => {
        console.log('Delete index with id:', id);
        // Implement delete logic here
    };

    return (
        <>
            <ToastContainer closeButton={true}/>
            <Row>
                <Col lg={12}>
                    <Card>
                        {/*<CardHeader>*/}
                        {/*    <h4 className="card-title mb-0">Add, Edit & Remove</h4>*/}
                        {/*</CardHeader>*/}

                        <CardBody>
                            <div className="listjs-table" id="customerList">
                                <Row className="g-4 mb-3">
                                    <Col className="col-sm-auto">
                                        <div>
                                            {/*<Button color="info" className="add-btn" onClick={() => tog_ist()}*/}
                                            <Button color="success" className="add-btn"
                                                    onClick={() => {
                                                        handleCreateClick()
                                                    }}
                                                    id="create-btn"><i
                                                className="ri-add-line align-bottom me-1"></i> Add Index</Button>{" "}
                                            <Button
                                                color="danger"
                                                className="ms-2"
                                                disabled={!selectedIds.length}
                                                onClick={onBulkDelete}
                                            >
                                                <i className="ri-delete-bin-2-line align-bottom me-1"></i>
                                                Delete Selected
                                            </Button>
                                        </div>
                                    </Col>
                                    <Col className="col-sm">
                                        <div className="d-flex justify-content-sm-end">
                                            <div className="search-box ms-2">
                                                <input type="text" className="form-control search"
                                                       placeholder="Search..."/>
                                                <i className="ri-search-line search-icon"></i>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                {loading ? (
                                    <LoaderComponent/>
                                ) : (
                                    <IndexTable
                                        indexes={(indexLists.records || []).filter(idx => idx.name !== '_id_')}
                                        selectedIds={selectedIds}
                                        onToggleOne={onToggleOne}
                                        onToggleAll={onToggleAll}
                                        handleEdit={handleEditClick}
                                        handleDelete={handleDeleteClick}
                                    />
                                )}

                                {/*Pagination*/}
                                {/*<div className="d-flex justify-content-end">*/}
                                {/*    <div className="pagination-wrap hstack gap-2">*/}
                                {/*        <Link className="page-item pagination-prev disabled" to="#">*/}
                                {/*            Previous*/}
                                {/*        </Link>*/}
                                {/*        <ul className="pagination listjs-pagination mb-0"></ul>*/}
                                {/*        <Link className="page-item pagination-next" to="#">*/}
                                {/*            Next*/}
                                {/*        </Link>*/}
                                {/*    </div>*/}
                                {/*</div>*/}
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
            <NewIndex
                modal={modal}
                setModal={setModal}
                toggle={toggle}
                onSubmit={handleCreateOrUpdateIndex}
                isEdit={isEdit}
                index={selectedIndex}
            />
        </>
    )
};

export default IndexesListComponent;
