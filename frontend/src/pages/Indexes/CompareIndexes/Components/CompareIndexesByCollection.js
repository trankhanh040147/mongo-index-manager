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


    const [compareData, setCompareData] = useState({
        missing_indexes: [],
        matched_indexes: [],
        redundant_indexes: []
    });

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
        setCompareData(compareCollectionData);
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
                        <td>{JSON.stringify(index.options)}</td>
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
            {selectedDatabase && selectedCollection &&
                <div className="mt-4">
                    <h2>{selectedCollection.collection}</h2>
                    <Table bordered>
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Keys</th>
                            <th>Options</th>
                        </tr>
                        </thead>
                        <tbody>
                        {compareData &&
                            renderIndexes(compareData.missing_indexes, "Missing Indexes", "row-missing")}
                        {compareData &&
                            renderIndexes(compareData.matched_indexes, "Matched Indexes", "row-matched")}
                        {compareData &&
                            renderIndexes(compareData.redundant_indexes, "Extra Indexes", "row-extra")}
                        </tbody>
                    </Table>
                </div>
            }
        </>
    )
};

export default CompareIndexesByCollectionComponent;
