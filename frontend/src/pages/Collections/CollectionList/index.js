import React, {useEffect, useMemo} from 'react';
import {Container, Spinner} from 'reactstrap';

import List from './List';
import MyBreadCrumb from "../../../Components/Common/MyBreadCrumb";
import {useSelector} from "react-redux";

const CollectionList = () => {
    const databaseCurrent = useSelector(state => state.Databases.current);
    const dbName = databaseCurrent?.name ?? '…';
    useEffect(() => {
        document.title = `${dbName} | Collections`;
    }, [dbName]);
    const breadcrumbItems = useMemo(
        () => {
            return [
                {
                    id: 'db', label: `Databases [${databaseCurrent.name}]`, path: '/databases', active: false,
                },
                {
                    id: 'coll', label: `Collections`, path: '/collections', active: true
                },
            ]
        }, [databaseCurrent.name]
    )

    return (
        <div className="page-content">
            <Container fluid>
                <MyBreadCrumb items={breadcrumbItems}/>
                <List/>
            </Container>
        </div>
    );
};

export default CollectionList;