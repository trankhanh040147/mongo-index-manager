import React, {useEffect, useState} from "react";
import {Table, Tooltip} from "reactstrap";
import {FaCheckCircle, FaExclamationCircle, FaSync} from "react-icons/fa";
import './SyncHistoryComponent.css';
import {useDispatch, useSelector} from "react-redux";
import {getSyncHistory as onGetSyncHistory} from "../../../../slices/sync/thunk";
import {createSelector} from "reselect"; // Import a CSS file for custom styling

const SyncHistoryComponent = ({}) => {
    const dispatch = useDispatch();

    const selectSyncState = (state) => state.Syncs;
    const selectDatabaseState = (state) => state.Databases;
    // selector
    const selectDashboardData = createSelector(
        [selectSyncState, selectDatabaseState],
        (syncs, databases) => ({
            syncData: syncs.syncData,
            reload: syncs.reload,
            currentDatabase: databases.current,
        })
    );
    const {syncData, reload, currentDatabase} = useSelector(selectDashboardData);

    // useEffect(() => {
    //     dispatch(onGetSyncHistory({}));
    // }, [dispatch, reload]);
    useEffect(() => {
        if (currentDatabase?.id) {
            dispatch(onGetSyncHistory({database_id: currentDatabase.id}))
        }
    }, [dispatch, currentDatabase?.id]);

    useEffect(() => {
        if (!currentDatabase?.id) return;
        const intervalId = setInterval(() => {
            dispatch(onGetSyncHistory({database_id: currentDatabase.id}))
        }, 3000);
        return () => clearInterval(intervalId);
    }, [dispatch, currentDatabase?.id]);
    // setInterval(() => {
    //     dispatch(onGetSyncHistory({}))
    // }, 1000)

    const [syncs, setSyncs] = useState([]);

    useEffect(() => {
        console.log(syncData)
        setSyncs(syncData);
    }, [syncData]);

    const [tooltipOpen, setTooltipOpen] = React.useState({});

    const toggleTooltip = (id) => {
        setTooltipOpen((prevState) => ({
            ...prevState,
            [id]: !prevState[id]
        }));
    };

    const getStatusIcon = (record, index) => {
        if (record.error) {
            return (
                <>
                    <FaExclamationCircle id={`error-${index}`} className="error-icon"/>
                    <Tooltip
                        placement="top"
                        isOpen={tooltipOpen[`error-${index}`]}
                        target={`error-${index}`}
                        toggle={() => toggleTooltip(`error-${index}`)}
                    >
                        {record.error}
                    </Tooltip>
                </>
            );
        } else if (record.is_finished || record.completed_tasks === record.total_tasks || record.progress === 100) {
            return <FaCheckCircle className="success-icon"/>;
        } else {
            return <FaSync className="syncing-icon"/>;
        }
    };

    console.log("syncData: ", syncs)

    return (
        <div className="sync-history">
            <Table bordered>
                <thead>
                <tr>
                    <th>Status</th>
                    <th>Database</th>
                    <th>Collection</th>
                    <th>Progress</th>
                    <th>Error</th>
                    <th>Start At</th>
                </tr>
                </thead>
                <tbody>
                {syncs && syncs?.records &&
                    syncs.records.map((record, index) => (
                        <tr key={index} className={record.error ? 'error-row' : 'success-row'}>
                            <td className="icon-cell">{getStatusIcon(record, index)}</td>
                            <td>{record.database_name || record.database_id || ""}</td>
                            <td>{record.collection_name || (Array.isArray(record.collections) ? record.collections.join(", ") : "")}</td>
                            <td>{(record.progress !== undefined && record.progress !== null)
                                ? `${record.progress}%`
                                : (record.total_tasks ? `${((record.completed_tasks / record.total_tasks) * 100).toFixed(2)}%` : "")
                            }</td>
                            <td className="icon-cell">{record.error ?
                                <FaExclamationCircle id={`error-${index}`}/> : ""}</td>
                            <td>{new Date(record.created_at).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default SyncHistoryComponent;
