import {
    Button,
    Card,
    CardBody,
    Col,
    Form,
    FormFeedback,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalHeader,
    Row
} from "reactstrap";
import React from "react";

const NewCollection = ({modal, setModal, toggle, validation}) => {
    return (
        <Modal
            isOpen={modal}
            toggle={toggle}
            centered
            size="lg"
            className="border-0"
            modalClassName='modal fade zoomIn'
        >
            <ModalHeader className="p-3 bg-info-subtle" toggle={toggle}>
                Create Collection
            </ModalHeader>
            <Form className="tablelist-form"
                  onSubmit={(e) => {
                      e.preventDefault();
                      validation.handleSubmit();
                      return false;
                  }}>
                <ModalBody className="modal-body">
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardBody>
                                    <div className="mb-3">
                                        <Label className="form-label" htmlFor="Database-title-input">
                                            Collection Name</Label>
                                        <Input type="text" className="form-control"
                                               id="collection"
                                               name="collection"
                                               value={validation.values.collection}
                                               onChange={validation.handleChange}
                                               onBlur={validation.handleBlur}
                                               invalid={validation.touched.collection && !!validation.errors.collection}
                                               placeholder="Enter collection name"/>
                                        {validation.touched.collection && validation.errors.collection ? (
                                            <FormFeedback>{validation.errors.collection}</FormFeedback>
                                        ) : null}
                                    </div>
                                </CardBody>

                            </Card>
                        </Col>
                    </Row>

                </ModalBody>
                <div className="modal-footer">
                    <div className="hstack gap-2 justify-content-end">
                        <Button
                            type="button"
                            onClick={() => {
                                setModal(false);
                            }}
                            className="btn-light"
                        >Close</Button>
                        <button type="submit" className="btn btn-success"
                                id="add-btn">Add Collection
                        </button>
                    </div>
                </div>
            </Form>
        </Modal>
    )
}

export default NewCollection;