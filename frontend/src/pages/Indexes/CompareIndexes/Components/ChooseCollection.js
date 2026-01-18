import React, {useEffect, useState} from "react";
import {Col, Input, Label, Row, Button} from "reactstrap";
import {useDispatch, useSelector} from "react-redux";
import {getDatabaseList as onGetDatabaseList} from "../../../../slices/database/thunk";
import {createSelector} from "reselect";
import {getCollectionList as onGetCollectionList} from "../../../../slices/collection/thunk";
import {useNavigate} from "react-router-dom";

const ChooseCollectionComponent = ({
                                       selectedDatabase,
                                       setSelectedCollection,
                                       activeTab,
                                       compareMethod,
                                       setCompareMethod
                                   }) => {
    const [visibleCollections, setVisibleCollections] = useState(12);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (activeTab === 2) {
            dispatch(onGetCollectionList({id: selectedDatabase.id, limit: 1000}));
            console.log("Tab ChooseCollection loaded")
            setCompareMethod("database")
            setSelectedCollection(null)
        }
    }, [dispatch, activeTab]);

    const selectCollectionState = (state) => state.Collections;
    const [collections, setCollections] = useState([]);
    // selector
    const selectDashboardData = createSelector(
        [selectCollectionState],
        (collections) => ({
            collectionLists: collections.collectionLists,
            reload: collections.reload,
        })
    );
    const {collectionLists, reload} = useSelector(selectDashboardData);
    useEffect(() => {
        console.log(collectionLists)
        setCollections(collectionLists.records);
    }, [collectionLists]);

    const handleLoadMore = () => {
        setVisibleCollections((prev) => prev + 12);
    };

    function handleClickCollection(coll) {
        console.log("coll: ", coll)
        setSelectedCollection(coll)
    }

    return (
        <div className="mt-4">
            <div className="mt-4">
                <h5 className="fs-14 mb-3">Compare Method</h5>

                <Row className="g-4">
                    <Col lg={6}>
                        <div className="form-check card-radio">
                            <Input
                                id="compareMethodDatabase"
                                name="compareMethod"
                                type="radio"
                                className="form-check-input"
                                checked={compareMethod === "database"}
                                onChange={() => {
                                    setCompareMethod("database")
                                    setSelectedCollection(null)
                                }
                                }
                            />
                            <Label
                                className="form-check-label"
                                htmlFor="compareMethodDatabase"
                            >
                                <span className="fs-14 mb-1 text-wrap d-block">
                                    Compare by Database
                                </span>
                                <span className="text-muted fw-normal text-wrap d-block">
                                    Compare by all collections of selected database
                                </span>
                            </Label>
                        </div>
                    </Col>

                    <Col lg={6}>
                        <div className="form-check card-radio">
                            <Input
                                id="compareMethodCollection"
                                name="compareMethod"
                                type="radio"
                                className="form-check-input"
                                checked={compareMethod === "collection"}
                                onChange={() => setCompareMethod("collection")}
                            />
                            <Label
                                className="form-check-label"
                                htmlFor="compareMethodCollection"
                            >
                                <span className="fs-14 mb-1 text-wrap d-block">
                                    Compare by Collection
                                </span>
                                <span className="text-muted fw-normal text-wrap d-block">
                                    Compare by selected collection
                                </span>
                            </Label>
                        </div>
                    </Col>
                </Row>
            </div>
            {compareMethod === "collection" && (
                <>
                    <div className="d-flex align-items-center mt-4 mb-2">
                        <div className="flex-grow-1">
                            <h5 className="fs-14 mb-0">Collections</h5>
                        </div>
                        <div className="flex-shrink-0">
                            <Button
                                type="button"
                                className="btn btn-sm btn-success mt-2"
                                onClick={() => {
                                    navigate("/collections")
                                }}
                            >
                                Add Collection
                            </Button>
                        </div>
                    </div>
                    <Row className="gy-3">
                        {collections && collections.slice(0, visibleCollections).map((coll) => (
                            <Col lg={4} sm={6} key={coll.collection}>
                                <div className="form-check card-radio">
                                    <Input
                                        id={`collection-${coll.collection}`}
                                        name="collection"
                                        type="radio"
                                        onClick={() => handleClickCollection(coll)}
                                        className="form-check-input"
                                    />
                                    <Label
                                        className="form-check-label"
                                        htmlFor={`collection-${coll.collection}`}
                                    >
                                        <span className="mb-3 fw-semibold d-block text-muted">
                                            {coll.collection}
                                        </span>
                                        <span className="fs-14 mb-2 d-block">
                                            {coll.total_indexes} Indexes
                                        </span>
                                    </Label>
                                </div>
                            </Col>
                        ))}
                    </Row>
                    {collections &&
                        visibleCollections < collections.length && (
                            <div className="d-flex justify-content-center mt-4">
                                <Button
                                    className="btn btn-primary"
                                    onClick={handleLoadMore}
                                    style={{
                                        position: "relative",
                                        animation: "floating 2s infinite",
                                    }}
                                >
                                    <i className="ri-add-line"></i> Load More
                                </Button>
                            </div>
                        )}
                </>
            )}
        </div>
    );
};

export default ChooseCollectionComponent;
