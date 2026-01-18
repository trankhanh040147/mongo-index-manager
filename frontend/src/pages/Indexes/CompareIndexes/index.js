import React from 'react';
import {Container} from 'reactstrap';
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import CompareIndexesDashboard from "./CompareIndexesDashboard";


const CompareIndexes = () => {
    document.title = "Compare & Sync | DRManager";

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Compare & Sync" pageTitle="Dashboard"/>
                    <CompareIndexesDashboard/>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default CompareIndexes;