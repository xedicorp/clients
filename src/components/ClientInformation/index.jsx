import React, { useState } from 'react';
import { ClientInfoContainer, FormGroup, Label, Input, Row, Col } from './style';

const ClientInformation = ({ onDataChange, initialData = {} }) => {
  const [clientData, setClientData] = useState({
    applicationName: initialData.applicationName || '',
    fatherMotherCo: initialData.fatherMotherCo || '',
    address: initialData.address || '',
    mobileNo: initialData.mobileNo || '',
    aadharCard: initialData.aadharCard || '',
    panCard: initialData.panCard || '',
    ...initialData
  });

  const handleInputChange = (field, value) => {
    const updatedData = {
      ...clientData,
      [field]: value
    };
    setClientData(updatedData);
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  const formatMobileNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Limit to 10 digits
    return digits.slice(0, 10);
  };

  const formatAadhar = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Limit to 12 digits and format as XXXX-XXXX-XXXX
    const formatted = digits.slice(0, 12);
    return formatted.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3').slice(0, 14);
  };

  const formatPAN = (value) => {
    // Convert to uppercase and limit to 10 characters
    return value.toUpperCase().slice(0, 10);
  };

  return (
    <ClientInfoContainer>
      <Row>
        <Col>
          <FormGroup>
            <Label>Application Name *</Label>
            <Input
              type="text"
              value={clientData.applicationName}
              onChange={(e) => handleInputChange('applicationName', e.target.value)}
              placeholder="Enter applicant name"
              required
            />
          </FormGroup>
        </Col>
        <Col>
          <FormGroup>
            <Label>Father/Mother/Husband/CO *</Label>
            <Input
              type="text"
              value={clientData.fatherMotherCo}
              onChange={(e) => handleInputChange('fatherMotherCo', e.target.value)}
              placeholder="Enter Father/Mother/Husband/CO name"
              required
            />
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col>
          <FormGroup>
            <Label>Mobile Number *</Label>
            <Input
              type="tel"
              value={clientData.mobileNo}
              onChange={(e) => handleInputChange('mobileNo', formatMobileNumber(e.target.value))}
              placeholder="Enter 10-digit mobile number"
              maxLength="10"
              required
            />
          </FormGroup>
        </Col>
        <Col>
          <FormGroup>
            <Label>Address *</Label>
            <Input
              type="text"
              value={clientData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter complete address"
              required
            />
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col>
          <FormGroup>
            <Label>Aadhar Card *</Label>
            <Input
              type="text"
              value={clientData.aadharCard}
              onChange={(e) => handleInputChange('aadharCard', formatAadhar(e.target.value))}
              placeholder="XXXX-XXXX-XXXX"
              maxLength="14"
              required
            />
          </FormGroup>
        </Col>
        <Col>
          <FormGroup>
            <Label>PAN Card *</Label>
            <Input
              type="text"
              value={clientData.panCard}
              onChange={(e) => handleInputChange('panCard', formatPAN(e.target.value))}
              placeholder="ABCDE1234F"
              maxLength="10"
              required
            />
          </FormGroup>
        </Col>
      </Row>
    </ClientInfoContainer>
  );
};

export default ClientInformation;