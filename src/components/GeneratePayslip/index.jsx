import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const GeneratePayslip = () => {
  const payslipRef = useRef();

  const downloadPDF = async () => {
    const element = payslipRef.current;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;

    const width = pageWidth - margin * 2;
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", margin, margin, width, height);
    pdf.save("payslip.pdf");
  };

  return (
    <div>
      <div ref={payslipRef} className="payslip-container">

        {/* HEADER */}
        <div className="payslip-header">
          <h4 className="fw-bold">Rajbhoomi Group </h4>
          <div>
            <p>Payslip No: <b>#PS4283</b></p>
            <p>Salary Month: <b>March 2026</b></p>
          </div>
        </div>

        {/* FROM TO */}
        <div className="row mb-4">
          <div className="col-md-6">
            <h5>From</h5>
            <p>Company:<b> Rajbhoomi Group</b></p>
            <p>Address : <b>Vande Mataram Marg, Mansarovar, Jaipur</b></p>
            <p>Email: <b>xyztech@gmail.com</b></p>
            <p>Phone: <b>987098345</b></p>
          </div>

          <div className="col-md-6">
            <h5>To</h5>
            <p><b>Anthony Lewis</b></p>
            <p><b>Web Designer</b></p>
            <p>Email: <b>xyztech@gmail.com</b></p>
            <p>Phone: <b>987098345</b> </p>
          </div>
        </div>

        <h4 className="text-center mb-3 fw-bold">
          Payslip for March 2026
        </h4>

        {/* TABLE */}
        <div className="payslip-table">
          <div className="column">
            <h5 >Earnings</h5>
            <p>Basic Salary <span>$3000</span></p>
            <p>HRA <span>$1000</span></p>
            <p>Allowance <span>$300</span></p>
            <p className="total">Total <span>$4300</span></p>
          </div>

          <div className="column">
            <h5>Deductions</h5>
            <p>TDS <span>$200</span></p>
            <p>PF <span>$300</span></p>
            <p>Loan <span>$50</span></p>
            <p className="total">Total <span>$700</span></p>
          </div>
        </div>

        <div className="net-salary">
          Net Salary: <b>$3600</b>
        </div>

      </div>
<div className="row">
            <div className="col-md-12  text-end">
              <button onClick={downloadPDF} className="primary-btn ms-auto">
        Download Payslip
      </button>
            </div>
          </div>
      
    </div>
  );
};

export default GeneratePayslip;