import { createGlobalStyle } from 'styled-components';
import KarlaRegular from './Karla-Regular.ttf';
import KarlaBold from './Karla-Bold.ttf';

const FontStyles = createGlobalStyle`
    @font-face {
        font-family: 'Karla';
        font-weight: 400;
        src: local('Karla'), url(${KarlaRegular}) format('truetype');
    }

    @font-face {
        font-family: 'Karla';
        font-weight: 700;
        src: local('Karla'), url(${KarlaBold}) format('truetype');
    }

    * {
        font-family: Karla, sans-serif;
    }
`;

export default FontStyles;
