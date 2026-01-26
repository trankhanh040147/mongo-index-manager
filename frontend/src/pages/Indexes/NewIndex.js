import React, {useEffect, useState} from 'react';
import {Modal, ModalHeader, ModalBody, Form, Row, Col, Card, CardBody, Label, Input, Button, Collapse} from 'reactstrap';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import './indexTable.css';

const NewIndex = ({modal, setModal, toggle, onSubmit, isEdit, index}) => {
    const [currentKeys, setCurrentKeys] = useState(index?.keys || [{field: "", value: 1}]);
    const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false);
    const [keyWeights, setKeyWeights] = useState({});
    
    useEffect(() => {
        const isTextIndex = index?.is_text === true || index?.options?.default_language || index?.options?.weights;
        const initialKeys = index?.keys || [{field: '', value: 1}];
        const keysWithTextValue = isTextIndex 
            ? initialKeys.map(key => ({...key, value: 'text'}))
            : initialKeys;
        setCurrentKeys(keysWithTextValue);
        if (index?.options?.weights && typeof index.options.weights === 'object') {
            setKeyWeights(index.options.weights);
        } else {
            setKeyWeights({});
        }
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
                value: Yup.mixed().required("Value is required")
            })
        )
            .test(
                'unique-fields',
                'Fields must be unique',
                (keys) => {
                    const fields = keys.map(key => key.field);
                    return new Set(fields).size === fields.length;
                }
            )
            .test(
                'text-index-values',
                'Text index keys must have value "text"',
                function(keys) {
                    if (this.parent.indexType === 'text') {
                        return keys.every(key => key.value === 'text');
                    }
                    return true;
                }
            )
            .min(1, "At least one key is required"),
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
        weights: Yup.mixed().nullable(),
    }).test('text-index-no-collation', 'Text indexes cannot have collation', function(values) {
        if (values.indexType === 'text' && values.collationEnabled) {
            return this.createError({ message: 'Text indexes cannot have collation enabled' });
        }
        return true;
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
            keys: (() => {
                const isTextIndex = getInitialIndexType() === 'text';
                const initialKeys = index?.keys || [{field: '', value: 1}];
                return isTextIndex 
                    ? initialKeys.map(key => ({...key, value: 'text'}))
                    : initialKeys;
            })(),
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
            weights: null,
        },
        validationSchema,
        onSubmit: (values) => {
            if (values.indexType === 'text') {
                const textFields = values.keys
                    .filter(key => key.field && key.field.trim() !== '')
                    .map(key => key.field);
                
                const weightsKeys = Object.keys(keyWeights);
                if (weightsKeys.length > 0) {
                    const missingFields = textFields.filter(field => !(field in keyWeights));
                    if (missingFields.length > 0) {
                        validation.setFieldError('weights', `All text fields must have weights. Missing: ${missingFields.join(', ')}`);
                        return;
                    }
                }
                values.weights = Object.keys(keyWeights).length > 0 ? keyWeights : null;
            } else {
                values.weights = null;
            }
            onSubmit(values, isEdit);
            validation.resetForm();
            setAdvancedOptionsOpen(false);
            setKeyWeights({});
            toggle();
        }
    });


    const addKeyField = () => {
        const indexType = validation.values.indexType || 'regular';
        const defaultValue = indexType === 'text' ? 'text' : 1;
        const newKeys = currentKeys.length > 0 ? [...currentKeys, {field: '', value: defaultValue}] : [{field: '', value: defaultValue}];
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
        const indexType = validation.values.indexType || 'regular';
        let finalValue = value;
        if (field === 'value' && indexType === 'text') {
            finalValue = 'text';
        }
        const newKeys = currentKeys.map((key, idx) => idx === index ? {...key, [field]: finalValue} : key);
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
                                        {validation.values.keys.map((key, keyIndex) => (
                                            <div key={keyIndex} className="d-flex align-items-center mb-2">
                                                <Input
                                                    type="text"
                                                    className="form-control me-2"
                                                    placeholder="Field"
                                                    value={key.field}
                                                    onChange={(e) => {
                                                        const oldField = key.field;
                                                        const newField = e.target.value;
                                                        handleKeyChange(keyIndex, 'field', newField);
                                                        // Update weights key if field name changed
                                                        if (oldField && oldField !== newField && keyWeights[oldField] !== undefined) {
                                                            const newWeights = {...keyWeights};
                                                            if (newField) {
                                                                newWeights[newField] = keyWeights[oldField];
                                                            }
                                                            delete newWeights[oldField];
                                                            setKeyWeights(newWeights);
                                                        }
                                                    }}
                                                    invalid={!!validation.errors.keys && !!validation.errors.keys[keyIndex] && validation.errors.keys[keyIndex].field && validation.touched.keys && validation.touched.keys[keyIndex]}
                                                />
                                                {validation.values.indexType !== 'text' && (
                                                    <select
                                                        className="form-control me-2"
                                                        value={key.value}
                                                        onChange={(e) => handleKeyChange(keyIndex, 'value', parseInt(e.target.value))}
                                                    >
                                                        <option value={1}>Ascending</option>
                                                        <option value={-1}>Descending</option>
                                                    </select>
                                                )}
                                                {validation.values.indexType === 'text' && key.field && (
                                                    <Input
                                                        type="number"
                                                        className="form-control me-2"
                                                        style={{width: '100px'}}
                                                        placeholder="Weight"
                                                        value={keyWeights[key.field] || ''}
                                                        onChange={(e) => {
                                                            const weight = e.target.value ? parseFloat(e.target.value) : undefined;
                                                            setKeyWeights(prev => {
                                                                const newWeights = {...prev};
                                                                if (weight !== undefined && !isNaN(weight)) {
                                                                    newWeights[key.field] = weight;
                                                                } else {
                                                                    delete newWeights[key.field];
                                                                }
                                                                return newWeights;
                                                            });
                                                        }}
                                                    />
                                                )}
                                                <Button color="danger" onClick={() => {
                                                    const fieldToRemove = key.field;
                                                    removeKeyField(keyIndex);
                                                    // Remove weight for deleted field
                                                    if (fieldToRemove && keyWeights[fieldToRemove] !== undefined) {
                                                        const newWeights = {...keyWeights};
                                                        delete newWeights[fieldToRemove];
                                                        setKeyWeights(newWeights);
                                                    }
                                                }}>
                                                    <i class="ri-subtract-line"></i>
                                                </Button>
                                            </div>
                                        ))}
                                        <Button color="primary" onClick={addKeyField}>
                                            <i class="ri-add-fill"></i>
                                        </Button>
                                        {validation.values.indexType === 'text' && (
                                            <small className="text-muted d-block mt-1">Enter weight for each text field (optional)</small>
                                        )}
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
                                                        setKeyWeights({});
                                                        const updatedKeys = currentKeys.map(key => ({...key, value: key.value === 'text' ? 1 : key.value}));
                                                        setCurrentKeys(updatedKeys);
                                                        validation.setFieldValue('keys', updatedKeys);
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
                                                        validation.setFieldValue('unique', false);
                                                        validation.setFieldValue('expireAfterSeconds', null);
                                                        const updatedKeys = currentKeys.map(key => ({...key, value: 'text'}));
                                                        setCurrentKeys(updatedKeys);
                                                        validation.setFieldValue('keys', updatedKeys);
                                                    }}
                                                />
                                                <Label className="form-check-label" htmlFor="indexTypeText">Text</Label>
                                            </div>
                                        </div>
                                        <small className="text-muted">Text indexes cannot have collation</small>
                                    </div>
                                    <div className="mb-3">
                                        <Label className="form-label">
                                            Is Unique
                                            {validation.values.indexType === 'text' && (
                                                <small className="text-muted ms-2">(Not available for text indexes)</small>
                                            )}
                                        </Label>
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
                                                    disabled={validation.values.indexType === 'text'}
                                                />
                                                <Label className="form-check-label" htmlFor="uniqueYes" style={validation.values.indexType === 'text' ? {opacity: 0.5} : {}}>Yes</Label>
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
                                                    disabled={validation.values.indexType === 'text'}
                                                />
                                                <Label className="form-check-label" htmlFor="uniqueNo" style={validation.values.indexType === 'text' ? {opacity: 0.5} : {}}>No</Label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <Label className="form-label" htmlFor="expire-after-input">
                                            Expire After Seconds
                                            {validation.values.indexType === 'text' && (
                                                <small className="text-muted ms-2">(Not available for text indexes)</small>
                                            )}
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
                                            disabled={validation.values.indexType === 'text'}
                                            style={validation.values.indexType === 'text' ? {opacity: 0.5} : {}}
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
                                setCurrentKeys([{field: '', value: validation.values.indexType === 'text' ? 'text' : 1}])
                                setAdvancedOptionsOpen(false);
                                setKeyWeights({});
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
