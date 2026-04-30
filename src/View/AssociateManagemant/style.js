import styled from 'styled-components';

const Wrapper = styled.div`
    .associate-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px 20px 20px;
        border-radius: 12px;
    }

    .associate-title h2 {
        margin: 0;
        color: #1e293b;
        font-size: 22px;
        font-weight: 600;
        margin-bottom: 8px;
        }
    

    .associate-subtitle {
        margin: 0;
        color: #64748b;
        font-size: 14px;
        font-weight: 500;
    }

    .associate-btns {
        display: flex;
        gap: 16px;
        flex-direction: row;
    }

    .associate-form {
        padding: 20px;
        display: grid;
        grid-template-columns: repeat(3, minmax(250px, 1fr));
        gap: 24px;
        align-items: start;
    }

    .associate-documents {
        padding: 20px;
        display: grid;
      grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
        gap: 30px;
    }   

    .associate-add-btn {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
    }
   
`;

export default Wrapper;
