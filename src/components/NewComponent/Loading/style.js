import styled from "styled-components";


const Wrapper = styled.div`
    && .loading-overlay {
        position: fixed;
        inset: 0;
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: background 0.3s ease;
    }

   
`

export default Wrapper;