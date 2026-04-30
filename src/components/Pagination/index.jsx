import React from "react";
import PropTypes from "prop-types";
import Wrapper from "./style";

const Pagination = ({ page, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <Wrapper>
            <div className="pagination simple">
                <button
                    className="nav-btn"
                    disabled={page === 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    Previous
                </button>

                <div className="page-info">
                    Page {page} of {totalPages}
                </div>

                <button
                    className="nav-btn"
                    disabled={page === totalPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    Next
                </button>
            </div>
        </Wrapper>
    );
};

Pagination.propTypes = {
    page: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired
};

export default Pagination;
