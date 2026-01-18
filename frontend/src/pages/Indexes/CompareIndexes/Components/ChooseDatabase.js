import React, {useState, useMemo, useEffect} from "react";
import PropTypes from "prop-types";
import {Input, Table, Button} from "reactstrap";
import {useDispatch, useSelector} from "react-redux";
import {createSelector} from "reselect";
import {getDatabaseList as onGetDatabaseList} from "../../../../slices/database/thunk";

const ChooseDatabaseComponent = ({setSelectedDatabase, activeTab}) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (activeTab === 1) {
            console.log("ChooseDatabase load");
            dispatch(onGetDatabaseList({page: 1, limit: 1000}));
        }
    }, [dispatch, activeTab]);

    const selectDatabaseState = (state) => state.Databases;
    const [databases, setDatabases] = useState(null);

    const selectDashboardData = createSelector(
        [selectDatabaseState],
        (dbs) => ({
            list: dbs.list,
            reload: dbs.reload,
        })
    );

    const {databaseLists, reload} = useSelector(selectDashboardData);

    useEffect(() => {
        console.log(databaseLists);
        setDatabases(databaseLists);
    }, [databaseLists]);

    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({key: "id", order: "desc"});
    const [selectedDatabaseId, setSelectedDatabaseId] = useState(null);
    const [visibleCount, setVisibleCount] = useState(10);
    const minVisibleCount = 10; // Set the minimum number of visible items

    const filteredAndSortedDatabases = useMemo(() => {
        if (!databases || !databases.records) return null;

        const filteredDatabases = databases.records.filter((db) =>
            [db.name, db.uri, db.db_name, db.description]
                .join(" ")
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        );

        const sortedDatabases = filteredDatabases.sort((a, b) => {
            const order = sortConfig.order === "asc" ? 1 : -1;
            if (a[sortConfig.key] < b[sortConfig.key]) return -1 * order;
            if (a[sortConfig.key] > b[sortConfig.key]) return 1 * order;
            return 0;
        });

        return sortedDatabases;
    }, [databases, searchTerm, sortConfig]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setVisibleCount(minVisibleCount); // Reset the visible count when search changes
    };

    const handleSort = (key) => {
        setSortConfig((prevSortConfig) => ({
            key,
            order: prevSortConfig.key === key && prevSortConfig.order === "asc" ? "desc" : "asc",
        }));
        setVisibleCount(minVisibleCount); // Reset the visible count when sort order changes
    };

    const handleDatabaseSelect = (dbId) => {
        setSelectedDatabaseId(dbId);
        const selectedDatabase = databases.records.find((db) => db.id === dbId);
        console.log("handleDatabaseSelect: ", selectedDatabase);
        setSelectedDatabase(selectedDatabase);
    };

    const handleLoadMore = () => {
        setVisibleCount((prevCount) => prevCount + 10);
    };

    const handleShowLess = () => {
        setVisibleCount((prevCount) => Math.max(prevCount - 10, minVisibleCount));
    };

    const renderSortIndicator = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.order === "asc" ? " ↑" : " ↓";
        }
        return null;
    };

    return (
        <div>
            <Input
                type="text"
                placeholder="Search by any field"
                value={searchTerm}
                onChange={handleSearchChange}
                className="mb-3"
            />
            <Table>
                <thead>
                <tr>
                    <th>#</th>
                    <th onClick={() => handleSort("name")}>Name {renderSortIndicator("name")}</th>
                    <th onClick={() => handleSort("description")}>Description {renderSortIndicator("description")}</th>
                    <th onClick={() => handleSort("uri")}>URI {renderSortIndicator("uri")}</th>
                    <th onClick={() => handleSort("db_name")}>DB Name {renderSortIndicator("db_name")}</th>
                    <th>Select</th>
                </tr>
                </thead>
                <tbody>
                {filteredAndSortedDatabases &&
                    filteredAndSortedDatabases.slice(0, visibleCount).map((db, index) => (
                        <tr
                            key={db.id}
                            className={selectedDatabaseId === db.id ? "selected-row" : ""}
                        >
                            <th scope="row">{index + 1}</th>
                            <td>{db.name}</td>
                            <td>{db.description}</td>
                            <td>{db.uri}</td>
                            <td>{db.db_name}</td>
                            <td>
                                <Button
                                    color="primary"
                                    onClick={() => handleDatabaseSelect(db.id)}
                                    disabled={selectedDatabaseId === db.id}
                                >
                                    Select
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            {filteredAndSortedDatabases && (
                <div className="d-flex justify-content-center mt-4">
                    {visibleCount < filteredAndSortedDatabases.length && (
                        <Button
                            className="btn btn-primary me-2"
                            onClick={handleLoadMore}
                            style={{
                                position: "relative",
                                animation: "floating 2s infinite",
                            }}
                        >
                            <i className="ri-add-line"></i> Load More
                        </Button>
                    )}
                    {visibleCount > minVisibleCount && (
                        <Button
                            className="btn btn-danger"
                            onClick={handleShowLess}
                            style={{
                                position: "relative",
                                animation: "floating 2s infinite",
                            }}
                        >
                            <i className="ri-subtract-line"></i> Show Less
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

ChooseDatabaseComponent.propTypes = {
    setSelectedDatabase: PropTypes.func.isRequired,
};

export default ChooseDatabaseComponent;
