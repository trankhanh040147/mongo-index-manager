import React, {useEffect, useState} from 'react';
import {Table} from 'reactstrap';
import {useDispatch, useSelector} from "react-redux";
import {compareByDatabase as onCompareByDatabase} from "../../../../slices/sync/thunk";
import {createSelector} from "reselect";

const CompareIndexesByDatabaseComponent = ({selectedDatabase, selectedCollection, activeTab}) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (activeTab === 3) {
            dispatch(onCompareByDatabase({
                values: {
                    database_id: selectedDatabase.id,
                }
            }));
        }
        console.log("selectedDatabase: ", selectedDatabase)
    }, [dispatch, activeTab]);

    const [compareData, setCompareData] = useState([]); // Initialize as an empty array

    const selectIndexState = (state) => state.Syncs;
    const selectDashboardData = createSelector([selectIndexState], (indexes) => ({
        compareDatabaseData: indexes.compareDatabaseData,
        reload: indexes.reload,
    }));
    const {compareDatabaseData} = useSelector(selectDashboardData);

    useEffect(() => {
        console.log(compareDatabaseData)
        setCompareData(compareDatabaseData);
    }, [compareDatabaseData]);

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
            {indexes && indexes.length > 0 ? (
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
            {compareData
                && compareData.length > 0 && compareData.map((value, index) => (
                    <div className="mt-4" key={index}>
                        <h2>{value.collection_name}</h2>
                        <Table bordered>
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Keys</th>
                                <th>Options</th>
                            </tr>
                            </thead>
                            <tbody>
                            {renderIndexes(value.missing_indexes, "Missing Indexes", "row-missing")}
                            {renderIndexes(value.matched_indexes, "Matched Indexes", "row-matched")}
                            {renderIndexes(value.extra_indexes, "Extra Indexes", "row-extra")}
                            </tbody>
                        </Table>
                    </div>
                ))}
        </>
    );
};

export default CompareIndexesByDatabaseComponent;
