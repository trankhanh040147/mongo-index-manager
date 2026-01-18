import React from 'react';
import {Link} from 'react-router-dom';
import {Col, Row} from 'reactstrap';
import PropTypes from 'prop-types';

const MyBreadCrumb = ({items}) => {
    return (
        <React.Fragment>
            <Row>
                <Col xs={12}>
                    <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                        <h4 className="mb-sm-0">
                            {items.length > 0 ? items[items.length - 1].label : ""}
                        </h4>

                        <div className="page-title-right">
                            <ol className="breadcrumb m-0">
                                {items.map((item, index) => (
                                    <li key={index} className={`breadcrumb-item ${item.active ? 'active' : ''}`}>
                                        {item.active ? (
                                            item.label
                                        ) : (
                                            <Link to={item.path}>{item.label}</Link>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </Col>
            </Row>
        </React.Fragment>
    );
};

MyBreadCrumb.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            path: PropTypes.string,
            active: PropTypes.bool,
        })
    ).isRequired,
};

export default MyBreadCrumb;
