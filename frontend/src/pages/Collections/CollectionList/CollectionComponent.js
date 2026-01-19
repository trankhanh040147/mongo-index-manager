import React from 'react';
import {Button, Card, CardBody, Col, Row} from 'reactstrap';
import {Link, useNavigate} from 'react-router-dom';
import {useDispatch} from "react-redux";
import {collectionActions} from "../../../slices/collection/reducer";

const CollectionComponent = ({collectionLists}) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    return (
        <Row>
            {/* boy: check trước nếu collection list rỗng thì return trước nè*/}
            {((collectionLists ? collectionLists.records : []) || []).map((item, key) => (
                <Col xl={3} md={4} sm={6} key={key}>
                    <Card>
                        <CardBody>
                            <Row className="g-1 mb-3">
                                <Col className="col-12">
                                    <img
                                        src="/img/collection.png"
                                        alt=""
                                        className="img-fluid rounded"
                                    />
                                </Col>
                            </Row>
                            <Button className="float-end"
                                    onClick={() => {
                                        dispatch(collectionActions.setCollection(item.collection))
                                        navigate("/indexes")
                                    }}
                            >
                                View Indexes <i className="ri-arrow-right-line align-bottom"></i>
                            </Button>
                            <h5 className="mb-0 fs-16">
                                <Link to="#!" className="text-body">
                                    {item.collection} <span
                                    className="badge bg-success-subtle text-success">{item.total_indexes}</span>
                                </Link>
                            </h5>
                        </CardBody>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default CollectionComponent;
