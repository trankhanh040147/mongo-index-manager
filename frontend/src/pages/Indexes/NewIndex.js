import React, {useEffect, useState} from 'react';
import {Modal, ModalHeader, ModalBody, Form, Row, Col, Card, CardBody, Label, Input, Button} from 'reactstrap';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import './indexTable.css';

const NewIndex = ({modal, setModal, toggle, onSubmit, isEdit, index}) => {
    const [currentKeys, setCurrentKeys] = useState(index?.keys || [{field: "", value: 1}]);
    useEffect(() => {
        setCurrentKeys(index?.keys || [{field: '', value: 1}]);
    }, [index, modal]);

    const validationSchema = Yup.object({
        unique: Yup.boolean().default(false),
        keys: Yup.array().of(
            Yup.object().shape({
                // field: Yup.string().required("Field is required").min(1, "Field is required"), // Update field validation
                value: Yup.number().oneOf([1, -1], "Value must be 1 or -1").required("Value is required")
            })
        )
            .test(
                'unique-fields',
                'Fields must be unique',
                (keys) => {
                    const fields = keys.map(key => key.field);
                    return new Set(fields).size === fields.length;
                }
            ).min(1, "At least one key is required"),
        expireAfterSeconds: Yup.number().integer().min(0, "Expire after seconds must be a non-negative integer").nullable(),
    });


    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: index?.name || '',
            unique: index?.options?.is_unique || false,
            keys: index?.keys || [{field: '', value: 1}],
            expireAfterSeconds: index?.options?.expire_after_seconds || null,
        },
        validationSchema,
        onSubmit: (values) => {
            onSubmit(values, isEdit);
            validation.resetForm();
            toggle();
        }
    });


    const addKeyField = () => {
        const newKeys = currentKeys.length > 0 ? [...currentKeys, {field: '', value: 1}] : [{field: '', value: 1}];
        setCurrentKeys(newKeys);
        validation.setFieldValue('keys', newKeys);
        let valKeys = validation.getFieldProps('keys');
        console.log("valKeys: ", valKeys.value)
    };

    const removeKeyField = (index) => {
        const newKeys = currentKeys.filter((_, idx) => idx !== index);
        setCurrentKeys(newKeys);
        validation.setFieldValue('keys', newKeys);
        let valKeys = validation.getFieldProps('keys');
        console.log("valKeys: ", valKeys.value)
    };

    const handleKeyChange = (index, field, value) => {
        const newKeys = currentKeys.map((key, idx) => idx === index ? {...key, [field]: value} : key);
        setCurrentKeys(newKeys);
        validation.setFieldValue('keys', newKeys);
    };

    console.log("selected index: ", index)

    return (
        <Modal
            isOpen={modal}
            toggle={toggle}
            centered
            size="lg"
            className="border-0"
            modalClassName="modal fade zoomIn"
        >
            <ModalHeader className="p-3 bg-info-subtle" toggle={toggle}>
                {isEdit ? "Edit Index" : "Create Index"}
            </ModalHeader>
            <Form className="tablelist-form"
                  onSubmit={(e) => {
                      e.preventDefault();
                      validation.handleSubmit();
                      return false;
                  }}
            >
                <ModalBody className="modal-body">
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardBody>
                                    <div className="mb-3">
                                        <Label className="form-label" htmlFor="index-name-input">
                                            Index Name
                                        </Label>
                                        <Input
                                            type="text"
                                            className="form-control"
                                            id="index-name"
                                            name="name"
                                            value={validation.values.name}
                                            onChange={validation.handleChange}
                                            placeholder="Enter index name"
                                            invalid={!!validation.errors.name && validation.touched.name}
                                        />
                                        {validation.errors.name && validation.touched.name && (
                                            <div className="text-danger">{validation.errors.name}</div>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <Label className="form-label">Keys</Label>
                                        {validation.values.keys.map((key, index) => (
                                            <div key={index} className="d-flex align-items-center mb-2">
                                                <Input
                                                    type="text"
                                                    className="form-control me-2"
                                                    placeholder="Field"
                                                    value={key.field}
                                                    onChange={(e) => handleKeyChange(index, 'field', e.target.value)}
                                                    // onChange={validation.handleChange}
                                                    invalid={!!validation.errors.keys && !!validation.errors.keys[index] && validation.errors.keys[index].field && validation.touched.keys && validation.touched.keys[index]}
                                                />
                                                <select
                                                    className="form-control me-2"
                                                    value={key.value}
                                                    onChange={(e) => handleKeyChange(index, 'value', parseInt(e.target.value))}
                                                >
                                                    <option value={1}>Ascending</option>
                                                    <option value={-1}>Descending</option>
                                                </select>
                                                <Button color="danger" onClick={() => removeKeyField(index)}>
                                                    <i class="ri-subtract-line"></i>
                                                </Button>
                                            </div>
                                        ))}
                                        <Button color="primary" onClick={addKeyField}>
                                            <i class="ri-add-fill"></i>
                                        </Button>
                                        {validation.errors.keys && validation.touched.keys && (
                                            <div className="text-danger">{validation.errors.keys}</div>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <Label className="form-label">Is Unique</Label>
                                        <div>
                                            <div className="form-check form-check-inline">
                                                <Input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="unique"
                                                    id="uniqueYes"
                                                    value="true"
                                                    checked={validation.values.unique === true}
                                                    onChange={() => validation.setFieldValue('unique', true)}
                                                />
                                                <Label className="form-check-label" htmlFor="uniqueYes">Yes</Label>
                                            </div>
                                            <div className="form-check form-check-inline">
                                                <Input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="unique"
                                                    id="uniqueNo"
                                                    value="false"
                                                    checked={validation.values.unique === false}
                                                    onChange={() => validation.setFieldValue('unique', false)}
                                                />
                                                <Label className="form-check-label" htmlFor="uniqueNo">No</Label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <Label className="form-label" htmlFor="expire-after-input">
                                            Expire After Seconds
                                        </Label>
                                        <Input
                                            type="number"
                                            className="form-control"
                                            id="expire-after"
                                            name="expireAfterSeconds"
                                            value={validation.values.expireAfterSeconds}
                                            onChange={validation.handleChange}
                                            placeholder="Enter expiry time in seconds (optional)"
                                            invalid={!!validation.errors.expireAfterSeconds && validation.touched.expireAfterSeconds}
                                        />
                                        {validation.errors.expireAfterSeconds && validation.touched.expireAfterSeconds && (
                                            <div className="text-danger">{validation.errors.expireAfterSeconds}</div>
                                        )}
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
                                // reset all
                                toggle()
                                validation.resetForm();
                                setCurrentKeys([{field: '', value: 1}])
                            }
                            }
                            className="btn-light"
                        >
                            Close
                        </Button>
                        <Button type="submit" className="btn btn-success" id="add-btn">
                            {isEdit ? "Update Index" : "Add Index"}
                        </Button>
                    </div>
                </div>
            </Form>
        </Modal>
    );
};

export default NewIndex;
