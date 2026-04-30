import styled from 'styled-components';

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 0;
`;

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

export const ModalBody = styled.div`
  padding: 24px;
`;

export const InfoSection = styled.div`
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  h4 {
    margin: 0 0 16px 0;
    color: #333;
    font-size: 16px;
    font-weight: 600;
    padding-bottom: 8px;
    border-bottom: 2px solid #e9ecef;
  }
`;

export const InfoRow = styled.div`
  display: flex;
  margin-bottom: 12px;
  align-items: flex-start;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const InfoLabel = styled.div`
  font-weight: 500;
  color: #555;
  min-width: 180px;
  font-size: 14px;
`;

export const InfoValue = styled.div`
  color: #333;
  font-size: 14px;
  flex: 1;
  word-break: break-word;
  
  &:empty::after {
    content: 'N/A';
    color: #999;
    font-style: italic;
  }
`;

export const ModalFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  background-color: #f8f9fa;
  border-radius: 0 0 12px 12px;
`;

export const ActionButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #5a6268;
  }
`;