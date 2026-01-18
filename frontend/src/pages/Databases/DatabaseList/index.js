import React from 'react';
import BreadCrumb from '../../../Components/Common/BreadCrumb';
import {Container, Spinner} from 'reactstrap';

import List from './List';
import MyBreadCrumb from "../../../Components/Common/MyBreadCrumb";

import LoaderComponent from "../../../Components/Common/LoaderComponent";


const DatabaseList = () => {
    document.title = "Databases List | DRManager";

    const breadcrumbItems = [
        {label: 'Databases', path: '/databases'},
    ];

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <MyBreadCrumb items={breadcrumbItems}/>
                    <List/>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default DatabaseList;