import React, {useCallback, useEffect, useState} from "react";
import {Button, Col, Container, Row} from "reactstrap";

import {useDispatch, useSelector} from "react-redux";
import {createSelector} from "reselect";
import {
    createCollection,
    getCollectionList as onGetCollectionList
} from "../../../slices/collection/thunk";
import {useFormik} from "formik";
import CollectionComponent from "./CollectionComponent";
import MyPagination from "../../../Components/MyPagination";
import NewCollection from "./NewCollection";
import * as Yup from "yup";
import {ToastContainer} from "react-toastify";

const Collections = () => {
    const dispatch = useDispatch();
    const currentDatabase = useSelector(state => state.Databases.current);

    const selectCollectionState = (state) => state.Collections;
    const [page, setPage] = useState(1)
    const [currentPage, setCurrentPage] = useState(1);
    const [modal, setModal] = useState(false);

    // selector
    const selectDashboardData = createSelector(
        [selectCollectionState],
        (collections) => ({
            collectionLists: collections.list,
            reload: collections.reload,
        })
    );
    const {collectionLists, reload} = useSelector(selectDashboardData);

    useEffect(() => {
        if (currentDatabase?.id) {
            dispatch(onGetCollectionList({database_id: currentDatabase.id}));
        }
    }, [dispatch, reload, currentDatabase?.id]);

    useEffect(() => {
        const pagination = collectionLists?.extra;
        if (pagination) {
            const pagingData = {
                ...pagination,
                totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 1))
            };
            setPage(pagingData);
        }
    }, [collectionLists]);
    useEffect(() => {
        if (currentDatabase?.id) {
            dispatch(onGetCollectionList({database_id: currentDatabase.id, page: currentPage}));
        }
    }, [currentPage, reload, currentDatabase?.id])

    const toggle = useCallback(() => {
        if (modal) {
            setModal(false);
        } else {
            setModal(true);
        }
    }, [modal]);

    function handlePageChange(page) {
        setCurrentPage(page)
    }

    const validation = useFormik({
        enableReinitialize: true,

        initialValues: {
            collection: ""
        },

        validationSchema: Yup.object({
            collection: Yup.string().required("Please Enter Collection Name"),
        }),
        onSubmit: (values) => {
            console.log("submitted CreateCollection")
            dispatch(createCollection({databaseID: currentDatabase.id, collection: values}))
                .then(() => {
                    validation.resetForm();
                })
            toggle();
        }
    })
    return (
        <React.Fragment>
            <ToastContainer closeButton={true}/>
            <Container fluid>

                <Row className="g-4 mb-3 align-items-center">
                    <Col className="col-sm">
                        <div className="d-flex justify-content-sm-end gap-2">
                            <Button color="success" className="btn-sm" outline
                                    onClick={() => {
                                        toggle();
                                    }}> <i className="ri-add-line"/>
                                New Collection
                            </Button>
                            <div className="search-box ms-2">
                                <input type="text" className="form-control" placeholder="Search..."/>
                                <i className="ri-search-line search-icon"></i>
                            </div>
                        </div>
                    </Col>
                </Row>

                <CollectionComponent collectionLists={collectionLists}/>

                {page &&
                    <MyPagination paging={page} currentPage={currentPage} handlePageChange={handlePageChange}/>
                }

            </Container>
            <NewCollection modal={modal} setModal={setModal} toggle={toggle} validation={validation}/>
        </React.Fragment>
    )
        ;
};

export default Collections