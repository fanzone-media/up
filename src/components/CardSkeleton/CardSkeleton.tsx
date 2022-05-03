import styled, { keyframes } from 'styled-components';

export const loading = keyframes`
    to {
        background-position: 350% 0, 1em calc(100% - 4em), 1em calc(100% - 2em), 0;
    }
`;

export const CardSkeleton = styled.div`
    animation: ${loading} 1.5s infinite;
    background-repeat: no-repeat;
    border-radius: 0.625em;
    min-height: 17em;
    width: 100%;
    background-image: linear-gradient(90deg, #43434300 0, #434343ba 50%, #43434300 100%),
    linear-gradient(#4b4b4b 40px,transparent 0), linear-gradient(#4b4b4b 40px,transparent 0), linear-gradient(#212121 100%,transparent 0);
    background-size: 200px 100%, 150px 15px, 170px 12px, 100% 100%;
    background-position: -150% 0, 1em calc(100% - 4em), 1em calc(100% - 2em), 0;
}`;
