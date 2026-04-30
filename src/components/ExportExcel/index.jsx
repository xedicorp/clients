import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';

const ExportToExcel = ({
    data = [],
    columns = [],
    fileName = 'Export',
    sheetName = 'Sheet1',
    buttonText = 'Download Excel',
    className = 'custom-btn',
}) => {
    const handleExport = () => {
        if (!Array.isArray(data) || data.length === 0) {
            Swal.fire('No Data', 'Nothing to export', 'info');
            return;
        }

        if (!Array.isArray(columns) || columns.length === 0) {
            Swal.fire('No Columns', 'No column configuration provided', 'warning');
            return;
        }

        const excelData = data.map(row => {
            const formattedRow = {};
            columns.forEach(({ header, key, format }) => {
                formattedRow[header] =
                    typeof format === 'function'
                        ? format(row[key], row)
                        : row[key] ?? '';
            });
            return formattedRow;
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        const excelBuffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
        });

        const blob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        saveAs(blob, `${fileName}.xlsx`);
    };

    return (
        <button
            type="button"
            className="primary-btn"
            onClick={handleExport}
            disabled={!data.length}
        >
            {buttonText}
        </button>
    );
};

export default ExportToExcel;
