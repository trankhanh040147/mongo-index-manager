import PropTypes from "prop-types";
import React from "react";
import {Input, Label, Modal, ModalBody} from "reactstrap";

const SyncModal = ({
                       show, onStartSyncClick, onCloseClick,
                       optionMissingIndexes, setOptionMissingIndexes,
                       optionExtraIndexes, setOptionExtraIndexes
                   }) => {
    return (
        <Modal isOpen={show} toggle={onCloseClick} centered={true}>
            <ModalBody className="py-3 px-5">
                <div className="mb-3">
                    <Label className="form-label">Action on missing indexes:</Label>
                    <div>
                        <div className="form-check form-check-inline">
                            <Input
                                className="form-check-input"
                                type="radio"
                                name="missing"
                                id="missingForward"
                                value="true"
                                checked={optionMissingIndexes === 1}
                                onChange={() => setOptionMissingIndexes(1)}
                            />
                            <Label className="form-check-label" htmlFor="missingForward">Add to your database</Label>
                            {/*    todo: add warning */}
                        </div>
                        <div className="form-check form-check-inline">
                            <Input
                                className="form-check-input"
                                type="radio"
                                name="missing"
                                id="missingBack"
                                value="false"
                                checked={optionMissingIndexes === 2}
                                onChange={() => setOptionMissingIndexes(2)}
                            />
                            <Label className="form-check-label" htmlFor="missingBack">Remove from DRManager</Label>
                        </div>
                    </div>
                </div>
                <div className="mb-3">
                    <Label className="form-label">Action on extra indexes:</Label>
                    <div>
                        <div className="form-check form-check-inline">
                            <Input
                                className="form-check-input"
                                type="radio"
                                name="extra"
                                id="extraForward"
                                value="true"
                                checked={optionExtraIndexes === 1}
                                onChange={() => setOptionExtraIndexes(1)}
                            />
                            <Label className="form-check-label" htmlFor="extraForward">Remove from your database</Label>
                            {/*    todo: add warning */}
                        </div>
                        <div className="form-check form-check-inline">
                            <Input
                                className="form-check-input"
                                type="radio"
                                name="extra"
                                id="extraBack"
                                value="false"
                                checked={optionExtraIndexes === 2}
                                onChange={() => setOptionExtraIndexes(2)}
                            />
                            <Label className="form-check-label" htmlFor="extraBack">Add to DRManager</Label>
                        </div>
                    </div>
                </div>
                <div className="mt-2 text-center">
                    <lord-icon
                        src="/jsons/lordicon/gsqxdxog.json"
                        trigger="loop"
                        colors="primary:#ffc061,secondary:#ff7f41"
                        style={{width: "100px", height: "100px"}}
                    ></lord-icon>
                    <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
                        <h4>Start syncing...</h4>
                        <p className="text-muted mx-4 mb-0">
                            Are you sure you want to start syncing?
                        </p>
                    </div>
                </div>
                <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
                    <button
                        type="button"
                        className="btn w-sm btn-light"
                        data-bs-dismiss="modal"
                        onClick={onCloseClick}
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        className="btn w-sm btn-primary "
                        id="delete-record"
                        onClick={onStartSyncClick}
                    >
                        Yes, Let's go!
                    </button>
                </div>
            </ModalBody>
        </Modal>
    );
};

SyncModal.propTypes = {
    onCloseClick: PropTypes.func,
    onDeleteClick: PropTypes.func,
    show: PropTypes.any,
};

export default SyncModal;