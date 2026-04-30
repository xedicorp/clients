import styled from 'styled-components';

const Wrapper = styled.div`
  @media print {
  .receipt-container {
    width: 800px !important;
    margin: 0 auto;
  }

  .receipt-title {
    letter-spacing: 0 !important;
  }

  .receipt-line {
    letter-spacing: 0 !important;
  }
}
  * {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
    .receipt-container {
        width: auto;
        padding: 30px 35px;
        border: 2px solid var(--primary-color);
        border-radius: 0px;
    }
        .receipt-container h1.re-title {
        font-size: 30px;
    font-weight: bold;
    margin-bottom: -35px;
        }
    .date-underline {
    width: 100px;
    display: block;
    border-bottom: 1px dashed #000;
    margin-left: 10px;
}
    .receipt-inner {
        min-height: auto;
    }

    .receipt-title {
        text-align: center;
        font-size: 32px;
        letter-spacing: 2px;
        margin-bottom: 30px;
        color: #2f3a46;
    }

    .receipt-line {
        font-size: 18px;
        line-height: 1.8;
        margin-bottom: 14px;
    }
        .receipt-line b {
    border-bottom: 1px solid #000;
    padding-bottom: 2px;
}

    .no-break {
        white-space: nowrap;
    }
    .download-btn {
        margin-top: 20px;
        padding: 10px 18px;
        font-size: 16px;
    }

    .amount-sign-row {
        margin-top: 40px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
    }

    .amount-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .amount-words {
        font-size: 18px;
    }

    .amount-number {
        font-size: 30px;
        font-weight: bold;
        color: #2f3a46;
    }

    .signature {
        font-size: 18px;
        text-align: right;
        min-width: 200px;
    }
`;

export default Wrapper;
