import React from 'react';
import './indexTable.css';
import {Button} from "reactstrap"; // Import your CSS file here

const IndexTable = ({indexes, selectedIds, onToggleOne, onToggleAll, handleEdit, handleDelete}) => {
    const renderValueLabel = (value) => {
        switch (value) {
            case 1:
                return <i className="ri-arrow-right-up-fill ascending"></i>; // Add ascending class
            case -1:
                return <i className="ri-arrow-right-down-fill descending"></i>; // Add descending class
            default:
                return value;
        }
    };

    console.log("Render Indexes", indexes)

    return (
        <div className="table-responsive table-card mt-3 mb-1">
            <table className="align-middle table-nowrap table table-borderless" id="indexTable">
                <thead className="table-active text-muted">
                <tr>
                    <th scope="col" style={{width: "50px"}}>
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="checkAll"
                                checked={indexes && indexes.length > 0 && selectedIds.length === indexes.length}
                                onChange={onToggleAll}
                            />
                        </div>
                    </th>
                    <th className="sort" data-sort="name">Name</th>
                    <th className="sort" data-sort="key_signature">Key Signature</th>
                    <th className="sort" data-sort="keys">Keys</th>
                    <th className="sort" data-sort="is_unique">Is Unique</th>
                    <th className="sort" data-sort="expire_after_seconds">Expired After (s)</th>
                    <th className="sort" data-sort="collation">Collation</th>
                    <th className="sort" data-sort="text_index">Text Index</th>
                    <th className="sort" data-sort="created_date">Created Date</th>
                    <th className="sort" data-sort="action">Action</th>
                </tr>
                </thead>
                <tbody className="list form-check-all">
                {indexes && indexes.map((index) => (
                    <tr key={index.id}>
                        <th scope="row">
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="checkAll"
                                    value={index.id}
                                    checked={selectedIds.includes(index.id)}
                                    onChange={() => onToggleOne(index.id)}
                                />
                            </div>
                        </th>
                        <td className="name">{index.name}</td>
                        <td className="key_signature">{index.key_signature || ""}</td>
                        <td className="keys">
                            {index.keys.map((keyItem, idx) => (
                                <div key={idx}
                                     className={`key-item ${keyItem.value === 1 ? 'ascending' : keyItem.value === -1 ? 'descending' : ''}`}>
                                    <span className="field">{keyItem.field}</span>: {renderValueLabel(keyItem.value)}
                                </div>
                            ))}
                        </td>
                        <td className="is_unique">
                                <span
                                    className={`badge ${index.options.is_unique ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'} text-uppercase`}>
                                    {index.options.is_unique ? 'Yes' : 'No'}
                                </span>
                        </td>
                        <td className="expire_after_seconds">
                            {index.options.expire_after_seconds || ''}
                        </td>
                        <td className="collation">
                            {index.options.collation?.locale ? (
                                <span className="badge bg-info-subtle text-info">
                                    {index.options.collation.locale}
                                </span>
                            ) : (
                                <span className="text-muted">-</span>
                            )}
                        </td>
                        <td className="text_index">
                            {index.is_text === true || index.options.default_language || index.options.weights ? (
                                <div>
                                    {index.options.default_language && index.options.default_language !== 'none' && (
                                        <span className="badge bg-primary-subtle text-primary me-1">
                                            {index.options.default_language}
                                        </span>
                                    )}
                                    {index.options.default_language === 'none' && (
                                        <span className="badge bg-primary-subtle text-primary me-1">
                                            none
                                        </span>
                                    )}
                                    {index.options.weights && (
                                        <span className="badge bg-secondary-subtle text-secondary" title={JSON.stringify(index.options.weights)}>
                                            {Object.keys(index.options.weights).length} weight{Object.keys(index.options.weights).length !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <span className="text-muted">-</span>
                            )}
                        </td>
                        <td className="created_date">
                            {new Date(index.created_at).toLocaleDateString()}
                        </td>
                        <td>
                            <div className="d-flex gap-2">
                                <Button className="text-success"
                                        color="link"
                                        onClick={() => handleEdit(index)}>
                                    <i className="mdi mdi-pencil font-size-18"
                                       data-tooltip-id={`edit-tooltip-${index.id}`} data-tooltip-content="Edit"></i>
                                </Button>
                                <Button className="text-danger"
                                        color="link"
                                        onClick={() => handleDelete(index)}>
                                    <i className="mdi mdi-delete font-size-18"
                                       data-tooltip-id={`delete-tooltip-${index.id}`} data-tooltip-content="Delete"></i>
                                </Button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};


export default IndexTable;
