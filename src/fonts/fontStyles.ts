import { createGlobalStyle } from 'styled-components';
import KarlaRegular from './Karla-Regular.ttf';
import KarlaBold from './Karla-Bold.ttf';
import KarlaLight from './Karla-Light.ttf';

const FontStyles = createGlobalStyle`
    @font-face {
        font-family: 'Karla';
        font-display: swap;
        font-weight: 400;
        src: local('Karla'), url(${KarlaRegular}) format('truetype');
    }

    @font-face {
        font-family: 'Karla';
        font-display: swap;
        font-weight: 700;
        src: local('Karla'), url(${KarlaBold}) format('truetype');
    }
    
    @font-face {
        font-family: 'Karla';
        font-display: swap;
        font-weight: 300;
        src: local('Karla'), url(${KarlaLight}) format('truetype');
    }

    * {
        font-family: Karla, sans-serif;
        font-display: swap;
    }
`;

export default FontStyles;
