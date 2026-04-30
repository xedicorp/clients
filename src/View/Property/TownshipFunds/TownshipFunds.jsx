import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../../../utilities/axiosInstance';
import API_ENDPOINTS from '../../../utilities/apiConfig';
import Swal from 'sweetalert2';
import './TownshipFunds.css';
import { FiX, FiTrash2, FiEdit2 } from "react-icons/fi";

export default function TownshipFunds() {
    const [funds, setFunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reserveFundId, setReserveFundId] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [fundName, setFundName] = useState('');
    const [amount, setAmount] = useState('');
    const currentDate = new Date();
    const [year, setYear] = useState(currentDate.getFullYear());
    const [month, setMonth] = useState(currentDate.getMonth() + 1);
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const townshipId = Number(params.get('townshipId'));
    const [editId, setEditId] = useState(null);
    const [reserveFundList, setReserveFundList] = useState([]);

    useEffect(() => {
        fetchReserveFunds(); // dropdown er jonno
        fetchFunds(); // table er jonno
    }, [townshipId]);

    const fetchReserveFunds = async () => {
        try {
            const res = await axiosInstance.get(
                API_ENDPOINTS.RESERVEFUND_LIST + '?townshipId=' + townshipId,
            );

            const list = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data?.value)
                  ? res.data.value
                  : [];

            setReserveFundList(list);
        } catch (error) {
            console.error('Failed loading reserve funds', error);

            Swal.fire('Error', 'Failed to load reserve funds', 'error');
        }
    };
    const handleSaveFund = async () => {
        if (!reserveFundId || !amount || !month) {
            Swal.fire('Validation', 'All fields required', 'warning');
            return;
        }

          const isAlreadyAdded = funds.some(
        (f) => f.reserveFundId == reserveFundId
        );

        if (isAlreadyAdded) {
            Swal.fire('Duplicate', 'This fund is already added', 'warning');
            return;
        }

        try {
            const payload = {
  reserveFundId: Number(reserveFundId),
  townshipId: Number(townshipId),
  month: Number(month),
  year: Number(year),
  targetAmount: Number(amount),
};

            await axiosInstance.post(
                API_ENDPOINTS.TOWNSHIP_FUNDS_SAVE,
                payload,
            );

            Swal.fire('Success', 'Fund added successfully', 'success');

            fetchFunds();

            setShowAddModal(false);
        } catch (error) {
            console.error(error);

            Swal.fire('Error', 'Save failed', 'error');
        }
    };
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    const fetchFunds = async () => {
        try {
            const res = await axiosInstance.get(
                `${API_ENDPOINTS.TOWNSHIP_FUNDS_LIST}?townshipId=${townshipId}`,
            );

            let list = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data?.value)
                  ? res.data.value
                  : [];

            // 🔥 fallback filter (jodi backend filter na kore)
            list = list.filter((f) => f.townshipId == townshipId);

            setFunds(list);
        } catch (error) {
            console.error('Failed loading funds', error);
            Swal.fire('Error', 'Failed to load funds', 'error');
        }
    };

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: 'Delete Fund?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes delete',
        });

        if (!confirm.isConfirmed) return;

        try {
            await axiosInstance.delete(
                `${API_ENDPOINTS.TOWNSHIP_FUNDS_DELETE}/${id}`,
            );

            Swal.fire('Deleted!', 'Fund removed', 'success');

            fetchFunds();
        } catch (error) {
            Swal.fire('Error', 'Delete failed', 'error');
        }
    };
    const handleEditClick = async (id) => {
        try {
            const res = await axiosInstance.get(
                `${API_ENDPOINTS.TOWNSHIP_FUNDS_GET_BY_ID}/${id}`,
            );

            const data = res.data;

            setEditId(data.id);
            setReserveFundId(data.reserveFundId);
            setMonth(data.month);
            setAmount(data.targetAmount);

            setShowEditModal(true);
        } catch (error) {
            console.error('Error loading fund', error);

            Swal.fire('Error', 'Failed to load fund details', 'error');
        }
    };
    const handleUpdateFund = async () => {
        try {
            const payload = {
                id: editId,
                reserveFundId: Number(reserveFundId),
                townshipId: Number(townshipId),
                month: Number(month),
                year: Number(year),
                targetAmount: Number(amount),
            };

            await axiosInstance.post(
                API_ENDPOINTS.TOWNSHIP_FUNDS_SAVE,
                payload,
            );

            Swal.fire('Success', 'Fund updated successfully', 'success');

            fetchFunds();

            setShowEditModal(false);
        } catch (error) {
            Swal.fire('Error', 'Update failed', 'error');
        }
    };
    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <h1 className="dashboard-title">Township Funds</h1>
                <div className="dashboard-header-actions">
                <button
                    className="primary-btn"
                    onClick={() => window.history.back()}
                >
                   Back
                </button>
                <button
                    className="primary-btn"
                    onClick={() => setShowAddModal(true)}
                >
                    Add Fund
                </button>
                </div>
                
            </div>

            {/* Table */}

            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Fund Name</th>
                            <th>Township</th>
                            <th>Month</th>
                            <th>Year</th>
                            <th>Target Amount</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {funds.map((f) => (
                            <tr key={f.id}>
                                <td>{f.reserveFundName}</td>

                                <td>{f.townshipName}</td>

                                <td>{months[f.month - 1]}</td>
                                <td>{f.year}</td>

                                <td>{f.targetAmount}</td>

                                <td className="d-flex gap-2">
                                    <button
                                        className="primary-btn"
                                        onClick={() => handleEditClick(f.id)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="primary-btn"
                                        onClick={() => handleDelete(f.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Fund Modal */}

            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        
                                    <div className="modal-header">
                                      <h3>Add Fund</h3>
                                      <button
                                        className="modal-close-btn"
                                        onClick={() => setShowAddModal(false)}
                                      >
                                        <FiX size={20} />
                                      </button>
                                    </div>
                        {/* Fund Name */}

                        <div className="form-group">
                            <label>Fund Name</label>

                            <select
                                className="form-control"
                                value={reserveFundId}
                                onChange={(e) =>
                                    setReserveFundId(e.target.value)
                                }
                            >
                                <option value="">Select Fund</option>

                                {reserveFundList.map((fund) => (
                                    <option key={fund.id} value={fund.id}>
                                        {fund.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Amount */}

                        <div className="form-group">
                            <label>Target Amount</label>

                            <input
                                type="number"
                                className="form-control"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>

                        {/* Month */}

                        <div className="form-group">
  <label>Month</label>

  <select
    value={month}
    onChange={(e) => setMonth(Number(e.target.value))}
    className="form-control"
  >
    <option value="">Select Month</option>

    {months.map((m, i) => {
      const monthValue = i + 1;

      // ❌ block past month (current year er jonno)
      if (year === currentDate.getFullYear() && monthValue < currentDate.getMonth() + 1) {
        return null;
      }

      return (
        <option key={i} value={monthValue}>
          {m}
        </option>
      );
    })}
  </select>
</div>

<div className="form-group">
  <label>Year</label>

  <select
    value={year}
    onChange={(e) => setYear(Number(e.target.value))}
    className="form-control"
  >
    {/* current year + next 5 years */}
    {[...Array(6)].map((_, i) => {
      const y = currentDate.getFullYear() + i;

      return (
        <option key={y} value={y}>
          {y}
        </option>
      );
    })}
  </select>
</div>

                        <div className="modal-actions gap-2">
                            <button
                                className="primary-btn"
                                onClick={() => setShowAddModal(false)}
                            >
                                Close
                            </button>

                            <button
                                className="primary-btn"
                                onClick={handleSaveFund}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                                      <h3>Edit Fund</h3>
                                      <button
                                        className="modal-close-btn"
                                        onClick={() => setShowEditModal(false)}
                                      >
                                        <FiX size={20} />
                                      </button>
                                    </div>

                        <div className="form-group">
                            <label>Fund Name</label>

                            <select
                                className="form-control"
                                value={reserveFundId}
                                onChange={(e) =>
                                    setReserveFundId(e.target.value)
                                }
                            >
                                <option value="">Select Fund</option>

                                {reserveFundList.map((fund) => (
                                    <option key={fund.id} value={fund.id}>
                                        {fund.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Amount</label>

                            <input
                                type="number"
                                className="form-control"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>


                        
                        <div className="form-group">
  <label>Month</label>

  <select
    value={month}
    onChange={(e) => setMonth(Number(e.target.value))}
    className="form-control"
  >
    <option value="">Select Month</option>

    {months.map((m, i) => {
      const monthValue = i + 1;

      // ❌ block past month (current year er jonno)
      if (year === currentDate.getFullYear() && monthValue < currentDate.getMonth() + 1) {
        return null;
      }

      return (
        <option key={i} value={monthValue}>
          {m}
        </option>
      );
    })}
  </select>
</div>

<div className="form-group">
  <label>Year</label>

  <select
    value={year}
    onChange={(e) => setYear(Number(e.target.value))}
    className="form-control"
  >
    {/* current year + next 5 years */}
    {[...Array(6)].map((_, i) => {
      const y = currentDate.getFullYear() + i;

      return (
        <option key={y} value={y}>
          {y}
        </option>
      );
    })}
  </select>
</div>

                        <div className="modal-actions gap-2">
                            <button
                                className="primary-btn"
                                onClick={() => setShowEditModal(false)}
                            >
                                Close
                            </button>

                            <button
                                className="primary-btn"
                                onClick={handleUpdateFund}
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
