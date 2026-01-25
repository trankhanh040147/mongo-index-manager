import React, {useEffect, useState} from 'react';
import {Modal, ModalHeader, ModalBody, Form, Row, Col, Card, CardBody, Label, Input, Button, Collapse} from 'reactstrap';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import './indexTable.css';

const NewIndex = ({modal, setModal, toggle, onSubmit, isEdit, index}) => {
    const [currentKeys, setCurrentKeys] = useState(index?.keys || [{field: "", value: 1}]);
    const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false);
    
    useEffect(() => {
        setCurrentKeys(index?.keys || [{field: '', value: 1}]);
    }, [index, modal]);

    // MongoDB language code validation (ISO 639-1 two-letter codes + "none")
    const isValidMongoDBLanguage = (value) => {
        if (!value || value.trim() === '') return true; // Optional field
        if (value === 'none') return true;
        // ISO 639-1 two-letter codes
        const iso6391Pattern = /^[a-z]{2}$/;
        return iso6391Pattern.test(value.toLowerCase());
    };

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
        indexType: Yup.string().oneOf(['regular', 'text'], "Index type must be regular or text").default('regular'),
        // Collation fields
        collationEnabled: Yup.boolean().default(false),
        collationLocale: Yup.string().when(['collationEnabled', 'indexType'], {
            is: (collationEnabled, indexType) => collationEnabled && indexType === 'regular',
            then: (schema) => schema.required("Locale is required when collation is enabled"),
            otherwise: (schema) => schema.nullable()
        }),
        collationStrength: Yup.number().integer().min(1).max(5).nullable(),
        collationCaseLevel: Yup.boolean().nullable(),
        collationCaseFirst: Yup.string().oneOf(['upper', 'lower', ''], "Case first must be 'upper', 'lower', or empty").nullable(),
        collationNumericOrdering: Yup.boolean().nullable(),
        // Text index fields
        defaultLanguage: Yup.string().test('mongodb-language', 'Must be a valid MongoDB language code (ISO 639-1 two-letter code) or "none"', function(value) {
            if (!value || value.trim() === '') return true; 
            if (!isValidMongoDBLanguage(value)) {
                return this.createError({ message: 'Must be a valid MongoDB language code (ISO 639-1 two-letter code like "en", "fr", "de") or "none"' });
            }
            return true;
        }).nullable(),
        weights: Yup.string().test('valid-json', 'Weights must be valid JSON', function(value) {
            if (!value || value.trim() === '') return true;
            try {
                const parsed = JSON.parse(value);
                if (typeof parsed !== 'object' || Array.isArray(parsed)) {
                    return this.createError({ message: 'Weights must be a JSON object' });
                }
                return true;
            } catch (e) {
                return this.createError({ message: 'Invalid JSON format' });
            }
        }).nullable(),
    }).test('text-index-no-collation', 'Text indexes cannot have collation', function(values) {
        if (values.indexType === 'text' && values.collationEnabled) {
            return this.createError({ message: 'Text indexes cannot have collation enabled' });
        }
        return true;
    }).test('weights-contain-all-text-fields', 'All text fields in keys must be present in weights map', function(values) {
        if (values.indexType !== 'text' || !values.weights || values.weights.trim() === '') {
            return true;
        }
        
        try {
            const weights = JSON.parse(values.weights);
            if (typeof weights !== 'object' || Array.isArray(weights)) {
                return true;
            }
            
            // Get all text fields from keys
            const textFields = values.keys
                .filter(key => key.field && key.field.trim() !== '')
                .map(key => key.field);
            
            // Check if all text fields are in weights map
            const missingFields = textFields.filter(field => !(field in weights));
            
            if (missingFields.length > 0) {
                return this.createError({ 
                    message: `All text fields must be present in weights map. Missing: ${missingFields.join(', ')}` 
                });
            }
            
            return true;
        } catch (e) {
            return true;
        }
    });


    // Determine index type from existing index
    const getInitialIndexType = () => {
        if (index?.is_text === true) {
            return 'text';
        }
        if (index?.options?.default_language || index?.options?.weights) {
            return 'text';
        }
        return 'regular';
    };

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: index?.name || '',
            unique: index?.options?.is_unique || false,
            keys: index?.keys || [{field: '', value: 1}],
            expireAfterSeconds: index?.options?.expire_after_seconds || null,
            indexType: getInitialIndexType(),
            // Collation fields
            collationEnabled: !!index?.options?.collation,
            collationLocale: index?.options?.collation?.locale || '',
            collationStrength: index?.options?.collation?.strength || null,
            collationCaseLevel: index?.options?.collation?.case_level || false,
            collationCaseFirst: index?.options?.collation?.case_first || '',
            collationNumericOrdering: index?.options?.collation?.numeric_ordering || false,
            // Text index fields
            defaultLanguage: index?.options?.default_language === 'none' ? '' : (index?.options?.default_language || ''),
            weights: index?.options?.weights ? JSON.stringify(index.options.weights, null, 2) : '',
        },
        validationSchema,
        onSubmit: (values) => {
            onSubmit(values, isEdit);
            validation.resetForm();
            setAdvancedOptionsOpen(false);
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
                                        <Label className="form-label">Index Type</Label>
                                        <div>
                                            <div className="form-check form-check-inline">
                                                <Input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="indexType"
                                                    id="indexTypeRegular"
                                                    value="regular"
                                                    checked={validation.values.indexType === 'regular'}
                                                    onChange={() => {
                                                        validation.setFieldValue('indexType', 'regular');
                                                        validation.setFieldValue('defaultLanguage', '');
                                                        validation.setFieldValue('weights', '');
                                                    }}
                                                />
                                                <Label className="form-check-label" htmlFor="indexTypeRegular">Regular</Label>
                                            </div>
                                            <div className="form-check form-check-inline">
                                                <Input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="indexType"
                                                    id="indexTypeText"
                                                    value="text"
                                                    checked={validation.values.indexType === 'text'}
                                                    onChange={() => {
                                                        validation.setFieldValue('indexType', 'text');
                                                        validation.setFieldValue('collationEnabled', false);
                                                        validation.setFieldValue('collationLocale', '');
                                                    }}
                                                />
                                                <Label className="form-check-label" htmlFor="indexTypeText">Text</Label>
                                            </div>
                                        </div>
                                        <small className="text-muted">Text indexes cannot have collation</small>
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
                                            value={validation.values.expireAfterSeconds || ''}
                                            onChange={validation.handleChange}
                                            placeholder="Enter expiry time in seconds (optional)"
                                            invalid={!!validation.errors.expireAfterSeconds && validation.touched.expireAfterSeconds}
                                        />
                                        {validation.errors.expireAfterSeconds && validation.touched.expireAfterSeconds && (
                                            <div className="text-danger">{validation.errors.expireAfterSeconds}</div>
                                        )}
                                    </div>

                                    {/* Advanced Options Section */}
                                    <div className="mb-3">
                                        <Button
                                            type="button"
                                            color="link"
                                            className="text-decoration-none p-0"
                                            onClick={() => setAdvancedOptionsOpen(!advancedOptionsOpen)}
                                        >
                                            <i className={`ri-arrow-${advancedOptionsOpen ? 'down' : 'right'}-s-line me-1`}></i>
                                            Advanced Options
                                        </Button>
                                        <Collapse isOpen={advancedOptionsOpen}>
                                            <div className="mt-3 p-3 border rounded">
                                                {validation.values.indexType === 'regular' && (
                                                    <div className="mb-3">
                                                        <div className="form-check mb-3">
                                                            <Input
                                                                type="checkbox"
                                                                id="collationEnabled"
                                                                checked={validation.values.collationEnabled}
                                                                onChange={(e) => {
                                                                    validation.setFieldValue('collationEnabled', e.target.checked);
                                                                    if (!e.target.checked) {
                                                                        validation.setFieldValue('collationLocale', '');
                                                                        validation.setFieldValue('collationStrength', null);
                                                                        validation.setFieldValue('collationCaseLevel', false);
                                                                        validation.setFieldValue('collationCaseFirst', '');
                                                                        validation.setFieldValue('collationNumericOrdering', false);
                                                                    }
                                                                }}
                                                            />
                                                            <Label className="form-check-label" htmlFor="collationEnabled">
                                                                Enable Collation
                                                            </Label>
                                                        </div>
                                                        <small className="text-muted d-block mb-2">
                                                            Collation determines how strings are compared and sorted
                                                        </small>
                                                        {validation.values.collationEnabled && (
                                                            <>
                                                                <div className="mb-3">
                                                                    <Label className="form-label" htmlFor="collationLocale">
                                                                        Locale <span className="text-danger">*</span>
                                                                    </Label>
                                                                    <Input
                                                                        type="text"
                                                                        id="collationLocale"
                                                                        name="collationLocale"
                                                                        value={validation.values.collationLocale}
                                                                        onChange={validation.handleChange}
                                                                        placeholder="e.g., en, fr, de"
                                                                        invalid={!!validation.errors.collationLocale && validation.touched.collationLocale}
                                                                    />
                                                                    {validation.errors.collationLocale && validation.touched.collationLocale && (
                                                                        <div className="text-danger">{validation.errors.collationLocale}</div>
                                                                    )}
                                                                    <small className="text-muted">Common locales: en, fr, de, es, it, ru, zh</small>
                                                                </div>
                                                                <div className="mb-3">
                                                                    <Label className="form-label" htmlFor="collationStrength">
                                                                        Strength (1-5)
                                                                    </Label>
                                                                    <Input
                                                                        type="number"
                                                                        id="collationStrength"
                                                                        name="collationStrength"
                                                                        min="1"
                                                                        max="5"
                                                                        value={validation.values.collationStrength || ''}
                                                                        onChange={validation.handleChange}
                                                                        placeholder="1-5 (optional)"
                                                                        invalid={!!validation.errors.collationStrength && validation.touched.collationStrength}
                                                                    />
                                                                    {validation.errors.collationStrength && validation.touched.collationStrength && (
                                                                        <div className="text-danger">{validation.errors.collationStrength}</div>
                                                                    )}
                                                                </div>
                                                                <div className="mb-3">
                                                                    <div className="form-check">
                                                                        <Input
                                                                            type="checkbox"
                                                                            id="collationCaseLevel"
                                                                            checked={validation.values.collationCaseLevel}
                                                                            onChange={(e) => validation.setFieldValue('collationCaseLevel', e.target.checked)}
                                                                        />
                                                                        <Label className="form-check-label" htmlFor="collationCaseLevel">
                                                                            Case Level
                                                                        </Label>
                                                                    </div>
                                                                </div>
                                                                <div className="mb-3">
                                                                    <Label className="form-label" htmlFor="collationCaseFirst">
                                                                        Case First
                                                                    </Label>
                                                                    <Input
                                                                        type="select"
                                                                        id="collationCaseFirst"
                                                                        name="collationCaseFirst"
                                                                        value={validation.values.collationCaseFirst}
                                                                        onChange={validation.handleChange}
                                                                    >
                                                                        <option value="">None</option>
                                                                        <option value="upper">Upper</option>
                                                                        <option value="lower">Lower</option>
                                                                    </Input>
                                                                </div>
                                                                <div className="mb-3">
                                                                    <div className="form-check">
                                                                        <Input
                                                                            type="checkbox"
                                                                            id="collationNumericOrdering"
                                                                            checked={validation.values.collationNumericOrdering}
                                                                            onChange={(e) => validation.setFieldValue('collationNumericOrdering', e.target.checked)}
                                                                        />
                                                                        <Label className="form-check-label" htmlFor="collationNumericOrdering">
                                                                            Numeric Ordering
                                                                        </Label>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}

                                                {validation.values.indexType === 'text' && (
                                                    <div>
                                                        <div className="mb-3">
                                                            <Label className="form-label" htmlFor="defaultLanguage">
                                                                Default Language
                                                            </Label>
                                                            <Input
                                                                type="text"
                                                                id="defaultLanguage"
                                                                name="defaultLanguage"
                                                                value={validation.values.defaultLanguage}
                                                                onChange={validation.handleChange}
                                                                placeholder="e.g., english, french, spanish"
                                                                invalid={!!validation.errors.defaultLanguage && validation.touched.defaultLanguage}
                                                            />
                                                            {validation.errors.defaultLanguage && validation.touched.defaultLanguage && (
                                                                <div className="text-danger">{validation.errors.defaultLanguage}</div>
                                                            )}
                                                            <small className="text-muted">Language for text index (optional)</small>
                                                        </div>
                                                        <div className="mb-3">
                                                            <Label className="form-label" htmlFor="weights">
                                                                Weights (JSON)
                                                            </Label>
                                                            <Input
                                                                type="textarea"
                                                                id="weights"
                                                                name="weights"
                                                                rows="4"
                                                                value={validation.values.weights}
                                                                onChange={validation.handleChange}
                                                                placeholder='{"field1": 10, "field2": 5}'
                                                                invalid={!!validation.errors.weights && validation.touched.weights}
                                                            />
                                                            {validation.errors.weights && validation.touched.weights && (
                                                                <div className="text-danger">{validation.errors.weights}</div>
                                                            )}
                                                            <small className="text-muted">JSON object with field names and numeric weights (optional)</small>
                                                        </div>
                                                    </div>
                                                )}

                                                {validation.errors.indexType && validation.touched.indexType && (
                                                    <div className="text-danger mb-2">{validation.errors.indexType}</div>
                                                )}
                                            </div>
                                        </Collapse>
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
                                setAdvancedOptionsOpen(false);
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
