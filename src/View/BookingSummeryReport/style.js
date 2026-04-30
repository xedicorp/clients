import styled from 'styled-components';

const Wrapper = styled.div`
   .summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.summary-field {
  display: flex;
  flex-direction: column;
}


.summary-value {
    font-weight: 500;
    font-size: 15px;
    padding-left: 15px;
    margin-top: 5px;
}
   
`;

export default Wrapper;
