import React, {useEffect, useState} from 'react';
import {Col, Row, Table, Nav, NavItem, NavLink, TabContent, TabPane} from 'reactstrap';
import classnames from 'classnames';
import {useDispatch, useSelector} from "react-redux";
import {compareByCollection as onCompareByCollection} from "../../../../slices/sync/thunk";
import {createSelector} from "reselect";
import DeleteModal from "../../../../Components/Common/DeleteModal";
import {deleteDatabaseList} from "../../../../slices/database/thunk";

const CompareIndexesByCollectionComponent = ({selectedDatabase, selectedCollection, activeTab}) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (activeTab === 3) {
            if (selectedDatabase
                && selectedCollection) {
                dispatch(onCompareByCollection({
                    values: {
                        database_id: selectedDatabase.id,
                        collections: [selectedCollection.collection]
                    }
                }));
            }
        }
        console.log("selectedDatabase: ", selectedDatabase)
        console.log("selectedCollection: ", selectedCollection)
    }, [dispatch, activeTab]);


    const [compareData, setCompareData] = useState([]);

    const selectIndexState = (state) => state.Syncs;

    const selectDashboardData = createSelector(
        [selectIndexState],
        (indexes) => ({
            compareCollectionData: indexes.compareCollectionData,
            reload: indexes.reload,
        })
    );
    const {compareCollectionData, reload} = useSelector(selectDashboardData);
    useEffect(() => {
        console.log(compareCollectionData)
        if (Array.isArray(compareCollectionData)) {
            setCompareData(compareCollectionData);
        } else if (compareCollectionData && typeof compareCollectionData === "object") {
            setCompareData([compareCollectionData]);
        } else {
            setCompareData([]);
        }
    }, [compareCollectionData]);

    const renderValueLabel = (value) => {
        switch (value) {
            case 1:
                return <i className="ri-arrow-right-up-fill ascending"></i>; // Add ascending class
            case -1:
                return <i className="ri-arrow-right-down-fill descending"></i>; // Add descending class
            default:
                return value;
        }
    };

    const renderOptions = (options) => {
        if (!options) return <span className="text-muted">-</span>;
        
        return (
            <div className="d-flex flex-column gap-1">
                <div>
                    <span className={`badge ${options.is_unique ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'} text-uppercase`}>
                        {options.is_unique ? 'Unique' : 'Not Unique'}
                    </span>
                </div>
                {options.expire_after_seconds && (
                    <div>
                        <small className="text-muted">TTL: </small>
                        <span>{options.expire_after_seconds}s</span>
                    </div>
                )}
                {options.collation?.locale && (
                    <div>
                        <small className="text-muted">Collation: </small>
                        <span className="badge bg-info-subtle text-info">
                            {options.collation.locale}
                        </span>
                    </div>
                )}
                {(options.default_language || options.weights) && (
                    <div>
                        {options.default_language && (
                            <span className="badge bg-primary-subtle text-primary me-1">
                                {options.default_language}
                            </span>
                        )}
                        {options.weights && (
                            <span className="badge bg-secondary-subtle text-secondary" title={JSON.stringify(options.weights)}>
                                {Object.keys(options.weights).length} weight{Object.keys(options.weights).length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderIndexes = (indexes, title, groupClass) => (
        <>
            <tr>
                <th colSpan="3" className="group-title">{title}</th>
            </tr>
            {indexes &&
            indexes.length > 0 ? (
                indexes.map((index, idx) => (
                    <tr key={idx} className={groupClass}>
                        <td>{index.name}</td>
                        <td>
                            {index.keys.map((keyItem, kIdx) => (
                                <div key={kIdx}
                                     className={`key-item ${keyItem.value === 1 ? 'ascending' : keyItem.value === -1 ? 'descending' : ''}`}>
                                    <span className="field">{keyItem.field}</span>: {renderValueLabel(keyItem.value)}
                                </div>
                            ))}
                        </td>
                        <td>{renderOptions(index.options)}</td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="3">No {title}</td>
                </tr>
            )}
        </>
    );

    return (
        <>
            {selectedDatabase && compareData && compareData.length > 0 &&
                compareData.map((result, idx) => {
                    const collectionName = result.collection || result.collection_name || selectedCollection?.collection || "Unknown Collection";
                    const missingIndexes = result.missing_indexes || [];
                    const matchedIndexes = result.matched_indexes || [];
                    const extraIndexes = result.redundant_indexes || result.extra_indexes || [];

                    return (
                        <div className="mt-4" key={idx}>
                            <h2>{collectionName}</h2>
                            <Table bordered>
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Keys</th>
                                    <th>Options</th>
                                </tr>
                                </thead>
                                <tbody>
                                {renderIndexes(missingIndexes, "Missing Indexes", "row-missing")}
                                {renderIndexes(matchedIndexes, "Matched Indexes", "row-matched")}
                                {renderIndexes(extraIndexes, "Extra Indexes", "row-extra")}
                                </tbody>
                            </Table>
                        </div>
                    );
                })
            }
        </>
    )
};

export default CompareIndexesByCollectionComponent;
