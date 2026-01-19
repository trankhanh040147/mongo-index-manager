import React, {useEffect, useMemo} from 'react';
import {Container} from 'reactstrap';
import IndexesListComponent from "./IndexesList";
import MyBreadCrumb from "../../Components/Common/MyBreadCrumb";
import {useRequireDatabaseAndCollection} from "../../helpers/routeGuards";

const IndexList = () => {
    const {currentDatabase: database, currentCollection: collection} = useRequireDatabaseAndCollection();
    const dbName = database?.name ?? '…';
    const collName = collection
    useEffect(() => {
        document.title = `${dbName} ›  ${collName} | Indexes`;
    }, [dbName, collection]);
    const breadcrumbItems = useMemo(
        () => {
            return [
                {id: 'db', label: `Databases [${database?.name || '...'}]`, path: '/databases', active: false},
                {id: 'coll', label: `Collections [${collection || '...'}]`, path: '/collections', active: false},
                {id: 'index', label: 'Indexes', path: '/indexes', active: true}
            ]
        }, [database?.name, collection]
    )

    return (
        <div className="page-content">
            <Container fluid>
                <MyBreadCrumb items={breadcrumbItems}/>
                <IndexesListComponent/>
            </Container>
        </div>
    );
};

export default IndexList;