import React from 'react';
import styled from 'styled-components';

const ContentWrapper = styled.div`
    .content-section {
        margin-bottom: 24px;

        h3 {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 12px;
        }

        p {
            color: #6b7280;
            line-height: 1.6;
            margin-bottom: 12px;
        }

        .info-box {
            background: #f3f4f6;
            border-left: 4px solid #667eea;
            padding: 16px;
            border-radius: 8px;
            margin-top: 12px;

            .info-label {
                font-size: 12px;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
            }

            .info-value {
                font-size: 14px;
                color: #1f2937;
                font-weight: 500;
            }
        }

        .action-buttons {
            display: flex;
            gap: 12px;
            margin-top: 16px;

            button {
                flex: 1;
                padding: 12px 20px;
                border: none;
                border-radius: 8px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;

                &.primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;

                    &:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                    }
                }

                &.secondary {
                    background: #f3f4f6;
                    color: #374151;

                    &:hover {
                        background: #e5e7eb;
                    }
                }
            }
        }

        .file-upload {
            margin-top: 12px;

            input[type="file"] {
                display: none;
            }

            label {
                display: inline-block;
                padding: 12px 24px;
                background: #f3f4f6;
                border: 2px dashed #d1d5db;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                color: #6b7280;
                font-weight: 500;

                &:hover {
                    border-color: #667eea;
                    background: #eef2ff;
                    color: #667eea;
                }
            }
        }

        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 8px;

            &.pending {
                background: #fef3c7;
                color: #92400e;
            }

            &.completed {
                background: #d1fae5;
                color: #065f46;
            }

            &.in-progress {
                background: #dbeafe;
                color: #1e40af;
            }
        }
    }
`;

// Content for Initial Payment
export const InitialPaymentContent = ({ step }) => (
    <ContentWrapper>
        <div className="content-section">
            <h3>Initial Payment Details</h3>
            <p>Record the initial payment received from the client for this booking.</p>
            
            <div className="info-box">
                <div className="info-label">Payment Status</div>
                <div className="info-value">
                    <span className={`status-badge ${step?.status || 'pending'}`}>
                        {step?.status === 'completed' ? 'Payment Received' : 'Pending'}
                    </span>
                </div>
            </div>

            <div className="info-box" style={{ marginTop: '12px' }}>
                <div className="info-label">Amount</div>
                <div className="info-value">₹ 50,000</div>
            </div>

            <div className="action-buttons">
                <button className="primary">Update Payment</button>
                <button className="secondary">View Receipt</button>
            </div>
        </div>
    </ContentWrapper>
);

// Content for Loan Sanction Status
export const LoanSanctionContent = ({ step }) => (
    <ContentWrapper>
        <div className="content-section">
            <h3>Loan Sanction Status</h3>
            <p>Track the loan sanction status from the bank.</p>
            
            <div className="info-box">
                <div className="info-label">Current Status</div>
                <div className="info-value">
                    <span className={`status-badge ${step?.status || 'pending'}`}>
                        {step?.status === 'completed' ? 'Sanctioned' : 'Under Review'}
                    </span>
                </div>
            </div>

            <div className="info-box" style={{ marginTop: '12px' }}>
                <div className="info-label">Bank Name</div>
                <div className="info-value">HDFC Bank</div>
            </div>

            <div className="info-box" style={{ marginTop: '12px' }}>
                <div className="info-label">Loan Amount</div>
                <div className="info-value">₹ 25,00,000</div>
            </div>

            <div className="action-buttons">
                <button className="primary">Update Status</button>
                <button className="secondary">View Details</button>
            </div>
        </div>
    </ContentWrapper>
);

// Content for Upload Loan Documents
export const UploadLoanDocumentsContent = ({ step }) => (
    <ContentWrapper>
        <div className="content-section">
            <h3>Upload   Documents</h3>
            <p>Upload all   documents for   processing.</p>
            
            <div className="info-box">
                <div className="info-label">Documents Status</div>
                <div className="info-value">
                    <span className={`status-badge ${step?.status || 'pending'}`}>
                        {step?.status === 'completed' ? 'All Documents Uploaded' : 'Pending Upload'}
                    </span>
                </div>
            </div>

            <div className="file-upload">
                <input type="file" id="loan-docs" multiple />
                <label htmlFor="loan-docs">
                    📎 Choose Files to Upload
                </label>
            </div>

            <div className="action-buttons">
                <button className="primary">Upload Documents</button>
                <button className="secondary">View Uploaded</button>
            </div>
        </div>
    </ContentWrapper>
);

// Content for Dokit Signing
export const DokitSigningContent = ({ step }) => (
    <ContentWrapper>
        <div className="content-section">
            <h3>Dokit Signing</h3>
            <p>Complete the document signing process for the property booking.</p>
            
            <div className="info-box">
                <div className="info-label">Signing Status</div>
                <div className="info-value">
                    <span className={`status-badge ${step?.status || 'pending'}`}>
                        {step?.status === 'completed' ? 'Signed' : 'Awaiting Signature'}
                    </span>
                </div>
            </div>

            <div className="info-box" style={{ marginTop: '12px' }}>
                <div className="info-label">Documents to Sign</div>
                <div className="info-value">
                    <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                        <li>Sale Agreement</li>
                        <li>Payment Receipt</li>
                        <li>Terms & Conditions</li>
                    </ul>
                </div>
            </div>

            <div className="action-buttons">
                <button className="primary">Start Signing</button>
                <button className="secondary">Download Documents</button>
            </div>
        </div>
    </ContentWrapper>
);

// Generic content for other steps
export const GenericStepContent = ({ step }) => (
    <ContentWrapper>
        <div className="content-section">
            <h3>{step?.title || 'Step Details'}</h3>
            <p>Manage and track this step of the booking process.</p>
            
            <div className="info-box">
                <div className="info-label">Status</div>
                <div className="info-value">
                    <span className={`status-badge ${step?.status || 'pending'}`}>
                        {step?.status === 'completed' ? 'Completed' : 'In Progress'}
                    </span>
                </div>
            </div>

            {step?.completedAt && (
                <div className="info-box" style={{ marginTop: '12px' }}>
                    <div className="info-label">Completed At</div>
                    <div className="info-value">
                        {new Date(step.completedAt).toLocaleString()}
                    </div>
                </div>
            )}

            <div className="action-buttons">
                <button className="primary">Update Status</button>
                <button className="secondary">View Details</button>
            </div>
        </div>
    </ContentWrapper>
);
