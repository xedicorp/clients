import React from "react";
import PropTypes from "prop-types";
import TableWrapper from "./style";

const Table = ({
    headers,
    data,
    renderRow,
    emptyMessage = "No records found.",
    isAllSelected,
    handleSelectAll,
    rowKey
}) => {
    return (
        <TableWrapper className="table-responsive">
            <table className="table">
                <thead>
                    <tr>
                        {headers.map((header, idx) => (
                            <th key={idx}>
                                {header === "__select__" ? (
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                    />
                                ) : (
                                    header
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {data.length === 0 ? (
                        <tr className="no-data-row">
                            <td colSpan={headers.length}>{emptyMessage}</td>
                        </tr>
                    ) : (
                        data.map((item, index) => (
                            <tr key={rowKey ? rowKey(item) : index}>
                                {renderRow(item, index)}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </TableWrapper>
    );
};

Table.propTypes = {
    headers: PropTypes.arrayOf(PropTypes.string).isRequired,
    data: PropTypes.array.isRequired,
    renderRow: PropTypes.func.isRequired,
    emptyMessage: PropTypes.string,
    isAllSelected: PropTypes.bool,
    handleSelectAll: PropTypes.func,
    rowKey: PropTypes.func
};

export default Table;
