import React from 'react';
import {Container} from 'reactstrap';

// import Components
import BreadCrumb from '../../Components/Common/BreadCrumb';

import TileBoxs from './TileBoxs';
import OtherWidgets from './OtherWidgets';
import ChartMapWidgets from './Chart&MapWidgets';

const Widgets = () => {
    document.title = "Widgets | DRManager - React Admin & Dashboard Template";
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Widgets" pageTitle="DRManager"/>
                    {/* Tile Boxs Widgets */}
                    <TileBoxs/>

                    {/* Other Widgets */}
                    <OtherWidgets dataColors='["--vz-success", "--vz-danger"]'/>


                    {/* Chart & Map Widgets */}
                    <ChartMapWidgets/>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default Widgets;
