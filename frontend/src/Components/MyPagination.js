import {Col, Row} from "reactstrap";
import {Link} from "react-router-dom";
import React from "react";

const MyPagination = ({paging, currentPage, handlePageChange}) => {
    return (
        <Row className="g-0 text-center text-sm-start align-items-center mb-4">
            <Col sm={6}>
                <div>
                    <p className="mb-sm-0 text-muted">
                        Showing <span className="fw-semibold">
                        {paging.total > 0 ? (paging.page - 1) * paging.limit + 1 : 0}
                      </span> to <span className="fw-semibold">
                        {paging.total > 0 ? Math.min(paging.page * paging.limit, paging.total) : 0}
                      </span> of <span className="fw-semibold text-decoration-underline">
                        {paging.total ?? 0}
                      </span> entries
                    </p>
                </div>
            </Col>

            <Col sm={6}>
                <ul className="pagination pagination-separated justify-content-center justify-content-sm-end mb-sm-0">
                    <li className={`page-item ${paging.page === 1 ? 'disabled' : ''}`}>
                        <Link to="#" className="page-link"
                              onClick={() => handlePageChange(currentPage - 1)}>Previous
                        </Link>
                    </li>
                    {[...Array(paging.totalPages)].map((_, index) => (
                        <li key={index}
                            className={`page-item ${paging.page === index + 1 ? 'active' : ''}`}>
                            <Link to="#" className="page-link"
                                  onClick={() => handlePageChange(index + 1)}>{index + 1}
                            </Link>
                        </li>
                    ))}
                    <li className={`page-item ${paging.page === paging.totalPages ? 'disabled' : ''}`}>
                        <Link to="#" className="page-link"
                              onClick={() => handlePageChange(currentPage + 1)}>Next
                        </Link>
                    </li>
                </ul>
            </Col>
        </Row>
    )
}

export default MyPagination