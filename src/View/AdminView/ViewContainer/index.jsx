import Lottie from 'lottie-react';
import { useEffect, useState } from 'react';
import { FaArrowLeftLong } from "react-icons/fa6";
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../../../assets/Loading.json';
import Button from '../../../components/Button';
import LargeModal from '../../../components/Modal/LargeModal';
import Table from '../../../components/Table';
import Wrapper from './style';


// const AddContainerModalContent = ({
//     palletData,
//     selectedPallets,
//     setSelectedPallets,
//     containerId,
//     createdAt
// }) => {

//     const toggleSelect = (pallet) => {
//         setSelectedPallets(prev =>
//             prev.includes(pallet.palletId)
//                 ? prev.filter(id => id !== pallet.palletId)
//                 : [...prev, pallet.palletId]
//         );
//     };

//     const handleSelectAll = () => {
//         if (selectedPallets.length === palletData.length) {
//             setSelectedPallets([]);
//         } else {
//             setSelectedPallets(palletData.map(p => p.palletId));
//         }
//     };

//     const palletHeader = ["__select__", "Pallet Id", "Pallet Name", "Quantity", "Exp Date", "Prod Date"];

//     return (
//         <>
//             <div className="container-header">
//                 <div className="container-row">
//                     <span className="container-label">Container ID:</span>
//                     <span className="container-value">{containerId}</span>
//                 </div>

//                 <div className="container-row">
//                     <span className="container-label">Created At:</span>
//                     <span className="container-value">{createdAt}</span>
//                 </div>
//             </div>

//             <Table
//                 headers={palletHeader}
//                 data={palletData}
//                 rowKey={(item) => item.palletId}
//                 isAllSelected={selectedPallets.length === palletData.length}
//                 handleSelectAll={handleSelectAll}
//                 renderRow={(pallet) => (
//                     <>
//                         <td>
//                             <input
//                                 type="checkbox"
//                                 className="checkbox"
//                                 checked={selectedPallets.includes(pallet.palletId)}
//                                 onChange={() => toggleSelect(pallet)}
//                             />
//                         </td>

//                         <td>{pallet.palletId}</td>
//                         <td className='pallet-name'>{pallet.palletName}</td>
//                         <td>{pallet.quantity}</td>
//                         <td>{pallet.expiryDate}</td>
//                         <td>{pallet.productionDate}</td>
//                     </>
//                 )}
//             />
//         </>
//     );
// };

function AdminViewContainer() {
    const { state } = useLocation();
    const po = state;

    // const [showContainerModal, setShowContainerModal] = useState(false);
    // const [palletData, setPalletData] = useState([]);
    // const [selectedPallets, setSelectedPallets] = useState([]);
    // const [newContainerId, setNewContainerId] = useState("");
    // const [newCreatedAt, setNewCreatedAt] = useState("");
    const [containerData, setContainerData] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [editContainer, setEditContainer] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("spendwise_token");

                if (token === "demo-token") {
                    const containerDemoData = (await import("../../../mock/containerData")).default;
                    // const palletDemoData = (await import("../../../mock/palletData")).default;

                    setContainerData(
                        containerDemoData.map(c => ({
                            ...c,
                            items: c.items.map(p => ({
                                palletId: p.palletId,
                                palletName: p.palletName,
                                quantity: p.quantity,
                                expiryDate: p.expiryDate,
                                productionDate: p.productionDate
                            }))
                        }))
                    );

                    // setPalletData(palletDemoData);
                }
            } catch (err) {
                toast.error('Failed to fetch Container data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);




    // const handleAddContainer = () => {
    //     setEditContainer(null);
    //     setNewContainerId("CONT-" + Math.floor(Math.random() * 1000000));
    //     setNewCreatedAt(new Date().toISOString().split("T")[0]);
    //     setSelectedPallets([]);
    //     setShowContainerModal(true);
    // };



    // const handleEditContainer = (container) => {
    //     setEditContainer(container);
    //     setNewContainerId(container.containerId);
    //     setNewCreatedAt(container.createdAt);
    //     setSelectedPallets(container.items.map(i => i.palletId));
    //     setShowContainerModal(true);
    // };



    // const handleDeletePallet = (containerId, palletId) => {
    //     Swal.fire({
    //         title: "Are you sure?",
    //         text: "This pallet will be deleted!",
    //         icon: "warning",
    //         showCancelButton: true,
    //         confirmButtonColor: "var(--primary-color)",
    //         cancelButtonColor: "#df364c",
    //         confirmButtonText: "Yes",
    //     }).then((result) => {
    //         if (result.isConfirmed) {
    //             setContainerData(prev =>
    //                 prev.map(c =>
    //                     c.containerId === containerId
    //                         ? { ...c, items: c.items.filter(p => p.palletId !== palletId) }
    //                         : c
    //                 )
    //             );
    //             toast.success("Pallet Deleted Successfully!");
    //         }
    //     });
    // }


    //     const handleSaveContainer = async () => {
    //     if (selectedPallets.length === 0) {
    //         toast.error("Please select at least one pallet");
    //         return;
    //     }

    //     const selectedItems = palletData
    //         .filter(p => selectedPallets.includes(p.palletId))
    //         .map(p => ({
    //             palletId: p.palletId,
    //             palletName: p.palletName,
    //             quantity: p.quantity,
    //             expiryDate: p.expiryDate,
    //             productionDate: p.productionDate
    //         }));

    //     try {
    //         const token = localStorage.getItem("spendwise_token");

    //         if (editContainer) {
    //             // ⭐ EDIT API
    //             await axios.put(
    //                 `https://your-api.com/containers/${editContainer.containerId}`,
    //                 {
    //                     containerId: editContainer.containerId,
    //                     createdAt: newCreatedAt,
    //                     items: selectedItems
    //                 },
    //                 {
    //                     headers: {
    //                         Authorization: `Bearer ${token}`,
    //                     },
    //                 }
    //             );

    //             toast.success("Container updated!");
    //         } else {
    //             // ⭐ ADD API
    //             await axios.post(
    //                 "https://your-api.com/containers",
    //                 {
    //                     containerId: newContainerId,
    //                     createdAt: newCreatedAt,
    //                     items: selectedItems,
    //                 },
    //                 {
    //                     headers: {
    //                         Authorization: `Bearer ${token}`,
    //                     },
    //                 }
    //             );

    //             toast.success("Container added!");
    //         }

    //         setShowContainerModal(false);

    //     } catch (err) {
    //         toast.error(err.response?.data?.message || "API failed");
    //     }
    // };



    // const handleSaveContainer = () => {
    //     if (selectedPallets.length === 0) {
    //         toast.error("Please select at least one pallet");
    //         return;
    //     }

    //     const selectedItems = palletData
    //         .filter(p => selectedPallets.includes(p.palletId))
    //         .map(p => ({
    //             palletId: p.palletId,
    //             palletName: p.palletName,
    //             quantity: p.quantity,
    //             expiryDate: p.expiryDate,
    //             productionDate: p.productionDate
    //         }));


    //     if (editContainer) {
    //         setContainerData(prev =>
    //             prev.map(c =>
    //                 c.containerId === editContainer.containerId
    //                     ? { ...c, items: selectedItems }
    //                     : c
    //             )
    //         );
    //         toast.success("Container updated!");
    //     } else {
    //         const newContainer = {
    //             containerId: newContainerId,
    //             createdAt: newCreatedAt,
    //             items: selectedItems,
    //         };
    //         setContainerData(prev => [...prev, newContainer]);
    //         toast.success("Container added successfully!");
    //     }

    //     setShowContainerModal(false);
    // };



    const containerHeader = ["Pallet Code", "Pallet Name", "Quantity", "Expiry Date", "Production Date"];



    return (
        <Wrapper>
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-container">
                        <Lottie animationData={Loading} loop autoplay />
                    </div>
                </div>
            )}

            <div className="header">
                <Button variant="neutral" onClick={() => navigate(-1)}>
                    <FaArrowLeftLong style={{ marginRight: "8px", fontSize: "16px" }} />
                    Back
                </Button>
                <h2>Container List</h2>
            </div>

            <div className="container-header">
                <div className="container-row">
                    <span className="container-label">PO Code:</span>
                    <span className="container-value">{po?.poNumber}</span>
                </div>
                <div className="container-row">
                    <span className="container-label">PO Date:</span>
                    <span className="container-value">{po?.date}</span>
                </div>

                {/* <div className="container-id-row">
                    <Button variant='primary' onClick={handleAddContainer}>
                        Add Container
                    </Button>
                </div> */}
            </div>

            <div className="container-list-scroll">
                <div className="container-cards">
                    {containerData.map((container) => (
                        <div className="container-card" key={container.containerId}>
                            <div className="container-header">
                                <div className="container-row">
                                    <span className="container-label">Container ID:</span>
                                    <span className="container-value">{container.containerId}</span>
                                </div>
                                <div className="container-row">
                                    <span className="container-label">Created At:</span>
                                    <span className="container-value">{container.createdAt}</span>
                                </div>

                                {/* <div className="container-id-row">
                                    <Button
                                        variant="secondary"
                                        onClick={() => handleEditContainer(container)}
                                    >
                                        Edit
                                    </Button>
                                </div> */}
                            </div>

                            <Table
                                headers={containerHeader}
                                data={container.items || []}
                                rowKey={(item) => item.palletId}
                                emptyMessage="No pallets in this container."
                                renderRow={(pallet) => (
                                    <>
                                        <td>{pallet.palletId}</td>
                                        <td className='pallet-name'>{pallet.palletName}</td>
                                        <td>{pallet.quantity}</td>
                                        <td>{pallet.expiryDate}</td>
                                        <td>{pallet.productionDate}</td>
                                        {/* <td>
                                            <Button
                                                variant="danger"
                                                onClick={() =>
                                                    handleDeletePallet(container.containerId, pallet.palletId)
                                                }
                                            >
                                                Delete
                                            </Button>
                                        </td> */}
                                    </>
                                )}
                            />
                        </div>
                    ))}
                </div>
            </div>



            {/* <LargeModal
                title={editContainer ? "Edit Container" : "Add Container"}
                show={showContainerModal}
                onClose={() => setShowContainerModal(false)}
                actions={
                    <>
                        <Button variant="neutral" onClick={() => setShowContainerModal(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleSaveContainer}>
                            {editContainer ? "Save Changes" : "Save"}
                        </Button>
                    </>
                }
            >
                <AddContainerModalContent
                    palletData={palletData}
                    selectedPallets={selectedPallets}
                    setSelectedPallets={setSelectedPallets}
                    containerId={newContainerId}
                    createdAt={newCreatedAt}
                />
            </LargeModal> */}

            <ToastContainer position="top-right" autoClose={2500} theme="dark" limit={3} />
        </Wrapper>
    );
}

export default AdminViewContainer;
