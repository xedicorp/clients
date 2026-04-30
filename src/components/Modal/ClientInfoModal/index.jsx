import React from 'react';
import { 
  ModalOverlay, 
  ModalContainer, 
  ModalHeader, 
  ModalTitle, 
  CloseButton,
  ModalBody, 
  InfoSection,
  InfoRow,
  InfoLabel,
  InfoValue,
  ModalFooter,
  ActionButton
} from './style';

const ClientInfoModal = ({ show, onClose, clientData, bookingData }) => {
  if (!show) return null;

  const handleClose = () => {
    onClose();
  };

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Client Information</ModalTitle>
          <CloseButton onClick={handleClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          {/* Booking Reference */}
          {bookingData && (
            <InfoSection>
              <h4>Booking Reference</h4>
              <InfoRow>
                <InfoLabel>Booking ID:</InfoLabel>
                <InfoValue>#{bookingData.id}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Township:</InfoLabel>
                <InfoValue>{bookingData.township || 'N/A'}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Plot:</InfoLabel>
                <InfoValue>{bookingData.plotNumber || 'N/A'} ({bookingData.plotSize || 'N/A'})</InfoValue>
              </InfoRow>
            </InfoSection>
          )}

          {/* Client Information */}
          <InfoSection>
            <h4>Personal Information</h4>
            <InfoRow>
              <InfoLabel>Application Name:</InfoLabel>
              <InfoValue>{clientData?.applicationName || bookingData?.clientName || 'N/A'}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Father/Mother/Husband/CO:</InfoLabel>
              <InfoValue>{clientData?.fatherMotherCo || 'N/A'}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Mobile Number:</InfoLabel>
              <InfoValue>{clientData?.mobileNo || bookingData?.clientMobile || 'N/A'}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Email Address:</InfoLabel>
              <InfoValue>{clientData?.clientEmail || bookingData?.clientEmail || 'N/A'}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Address:</InfoLabel>
              <InfoValue>{clientData?.address || 'N/A'}</InfoValue>
            </InfoRow>
          </InfoSection>

          {/* Identity Documents */}
          <InfoSection>
            <h4>Identity Documents</h4>
            <InfoRow>
              <InfoLabel>Aadhaar Card:</InfoLabel>
              <InfoValue>{clientData?.aadharCard || 'N/A'}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>PAN Card:</InfoLabel>
              <InfoValue>{clientData?.panCard || 'N/A'}</InfoValue>
            </InfoRow>
            {(clientData?.hasAadharFile || clientData?.hasPanFile) && (
              <InfoRow>
                <InfoLabel>Uploaded Documents:</InfoLabel>
                <InfoValue>
                  {clientData?.hasAadharFile && <span style={{ color: '#28a745', marginRight: '10px' }}>✓ Aadhaar File</span>}
                  {clientData?.hasPanFile && <span style={{ color: '#28a745' }}>✓ PAN File</span>}
                </InfoValue>
              </InfoRow>
            )}
          </InfoSection>

          {/* Additional Information */}
          {(!clientData || Object.keys(clientData).length === 0) && (
            <InfoSection>
              <div style={{ 
                textAlign: 'center', 
                color: '#666', 
                fontStyle: 'italic',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '48px', height: '48px', margin: '0 auto 10px' }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>Detailed client information is not available for this booking.</p>
                <p>This information is collected when sending bookings for draft preparation.</p>
              </div>
            </InfoSection>
          )}
        </ModalBody>
        
        <ModalFooter>
          <ActionButton onClick={handleClose}>
            Close
          </ActionButton>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ClientInfoModal;