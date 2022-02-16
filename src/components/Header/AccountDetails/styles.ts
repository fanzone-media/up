import styled from "styled-components";

export const StyledAccountDetailsModal = styled.div`
    position: absolute;
    width: 200px;
    right: 0;
    top: 0;
    margin: 70px 20px 0 0;
    z-index: 10;
    background-color: black;
    border-radius: 20px 20px 20px 20px;
    display: flex;
    flex-direction: column;
    padding: 10px;
    word-break: break-all;
`;

export const StyledAddressLabel = styled.h3`
    color: white;
    font-size: 30px;
`;

export const StyledDisconnectButton = styled.button`
    background-color: white;
    color: black;
    padding: 2px 5px 2px 5px;
    border-radius: 5px;
    width: max-content;
    margin: 20px auto 0 auto;
`;

export const StyledBalanceLabel = styled.p`
    color: white;
`;