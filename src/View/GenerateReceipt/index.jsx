import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Wrapper from "./style";



const GenerateReceipt = ({ data, copyType }) => {
    const receiptRef = useRef();
    const customerRef = useRef();
  const officeRef = useRef();
    const paymentModes = [
  { value: "1", label: "Bank Transfer" },
  { value: "2", label: "Cheque" },
  { value: "4", label: "UPI" },
  { value: "5", label: "NEFT/RTGS" },
  { value: "6", label: "Demand Draft" },
];

const paymentMethodLabel =  paymentModes.find(p => p.value === String(data?.receiptMethod))?.label || "N/A";

  const downloadPDF = async () => {
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const margin = 20;
    const slipHeight = 150;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const slipWidth = pageWidth - margin * 2;

    // Customer Copy
    const canvas1 = await html2canvas(customerRef.current, { scale: 2, useCORS: true });
    const imgData1 = canvas1.toDataURL("image/png");
    pdf.addImage(imgData1, "PNG", margin, margin, slipWidth, slipHeight);

    // Office Copy (new page)
    pdf.addPage();
    const canvas2 = await html2canvas(officeRef.current, { scale: 2, useCORS: true });
    const imgData2 = canvas2.toDataURL("image/png");
    pdf.addImage(imgData2, "PNG", margin, margin, slipWidth, slipHeight);

    pdf.save("receipt.pdf");
  };


    return (
        <Wrapper>
  <div ref={customerRef} className="receipt-container">
    <div className="">
      <h1 className="re-title">Receipt</h1>
      <div className="receipt-header">
        <h1>{data.townshipName}</h1>
        <p>RERA registration no. {data.reraNo}</p>
        <p>{data.townshipAddress}</p>
      </div>

      <div className="receipt-meta">
        <span>No. <b>{data.id}</b></span>
        <div className="d-flex">
          <span className="date">Date : </span>
          <span className="date-underline">{data?.receiptDate
              ? new Date(data.receiptDate).toLocaleDateString("en-GB")
              : "N/A"}</span>
        </div>
        
      </div>

      <div className="receipt-body">

        <p>
          RECEIVED with thanks from <b style={{ minWidth: "300px" }}>{data.clientName}</b>
          W/o, S/o, D/o <b style={{ minWidth: "300px" }}>{data.relativeName}</b>
        </p>

        <p>
          Resident of <b style={{ minWidth: "300px" }}>{data.clientAddress}</b>
          having Aadhaar No. <b style={{ minWidth: "300px" }}>{data.aadharNo}</b>
        </p>

        <p>
          A sum of Rupees <b style={{ minWidth: "400px" }}>{data.amountInWords}</b>
        </p>

        <p>
          Payment Method Vide <b style={{ minWidth: "200px" }}>{paymentMethodLabel}</b>
          bearing Ref no <b style={{ minWidth: "200px" }}>{data.transactionId}</b>
        </p>

        <p>
          dated <b style={{ minWidth: "200px" }}>
            {data?.receiptDate
              ? new Date(data.receiptDate).toLocaleDateString("en-GB")
              : "N/A"}
          </b> of <b style={{ minWidth: "300px" }}>{data?.bankName || "N/A"}</b>
        </p>

        <p>
          Purpose: Receipt of payment as a token of keenness for booking of
          <b> Plot</b> bearing No. <b style={{ minWidth: "200px" }}>{data.plotNo}</b>
          in the </p>
          <p>scheme at <b style={{ minWidth: "200px" }}>{data.townshipName}</b>,
          <b style={{ minWidth: "200px" }}>{data.townshipAddress}</b> having RERA registration
          number <b style={{ minWidth: "200px" }}>{data.reraNo}</b>.
        </p>

      </div>

      <div className="receipt-bottom">

        <div className="amount-box">
          Rs. <b>{data.amount} /-</b>
        </div>

        <div className="signature-area">
          <p>For ACPL {data.townshipName} Collection Account</p>
          <div className="signature-line"></div>
          <span>Authorised Signature</span>
        </div>

      </div>

      <div className="receipt-footer">
        <p>Receipt is valid to realisation of Cheque.</p>
        <p>
          This is not a cash receipt and this receipt acknowledges that the
          amount mentioned has been received as keenness money only and will be applied towards the booking of the 
          specified plot in {data.townshipName} scheme. This reciept does not imply final sale and is subject to the 
          terms and conditions of the plot booking agreement.
        </p>
      </div>
      <h6 className="ms-auto d-flex justify-content-end fw-bold">Customer Copy</h6>

    </div>
  </div>
  <div ref={officeRef} className="receipt-container mt-3">
    <div className="">
      <h1 className="re-title">Receipt</h1>
      <div className="receipt-header">
        <h1>{data.townshipName}</h1>
        <p>RERA registration no. {data.reraNo}</p>
        <p>{data.townshipAddress}</p>
      </div>

      <div className="receipt-meta">
        <span>No. <b>{data.id}</b></span>
        <div className="d-flex">
          <span className="date">Date : </span>
          <span className="date-underline">{data?.receiptDate
              ? new Date(data.receiptDate).toLocaleDateString("en-GB")
              : "N/A"}</span>
        </div>
        
      </div>

      <div className="receipt-body">

        <p>
          RECEIVED with thanks from <b style={{ minWidth: "300px" }}>{data.clientName}</b>
          W/o, S/o, D/o <b style={{ minWidth: "300px" }}>{data.relativeName}</b>
        </p>

        <p>
          Resident of <b style={{ minWidth: "300px" }}>{data.clientAddress}</b>
          having Aadhaar No. <b style={{ minWidth: "300px" }}>{data.aadharNo}</b>
        </p>

        <p>
          A sum of Rupees <b style={{ minWidth: "400px" }}>{data.amountInWords}</b>
        </p>

        <p>
          Payment Method Vide <b style={{ minWidth: "200px" }}>{paymentMethodLabel}</b>
          bearing Ref no <b style={{ minWidth: "200px" }}>{data.transactionId}</b>
        </p>

        <p>
          dated <b style={{ minWidth: "200px" }}>
            {data?.receiptDate
              ? new Date(data.receiptDate).toLocaleDateString("en-GB")
              : "N/A"}
          </b> of <b style={{ minWidth: "300px" }}>{data?.bankName || "N/A"}</b>
        </p>

        <p>
          Purpose: Receipt of payment as a token of keenness for booking of
          <b> Plot</b> bearing No. <b style={{ minWidth: "200px" }}>{data.plotNo}</b>
          in the </p>
          <p>scheme at <b style={{ minWidth: "200px" }}>{data.townshipName}</b>,
          <b style={{ minWidth: "200px" }}>{data.townshipAddress}</b> having RERA registration
          number <b style={{ minWidth: "200px" }}>{data.reraNo}</b>.
        </p>

      </div>

      <div className="receipt-bottom">

        <div className="amount-box">
          Rs. <b>{data.amount} /-</b>
        </div>

        <div className="signature-area">
          <p>For ACPL {data.townshipName} Collection Account</p>
          <div className="signature-line"></div>
          <span>Authorised Signature</span>
        </div>

      </div>

      <div className="receipt-footer">
        <p>Receipt is valid to realisation of Cheque.</p>
        <p>
          This is not a cash receipt and this receipt acknowledges that the
          amount mentioned has been received as keenness money only and will be applied towards the booking of the 
          specified plot in {data.townshipName} scheme. This reciept does not imply final sale and is subject to the 
          terms and conditions of the plot booking agreement.
        </p>
      </div>
      <h6 className="ms-auto d-flex justify-content-end fw-bold">Office Copy</h6>

    </div>
  </div>

  <button onClick={downloadPDF} className="primary-btn mt-3 ms-auto">
    Download Receipt
  </button>
</Wrapper>
    );
}

export default GenerateReceipt