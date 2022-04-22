import { createGlobalStyle } from 'styled-components';
import { theme } from '../boot/styles';
import KarlaRegular from './Karla-Regular.ttf';
import KarlaBold from './Karla-Bold.ttf';
import KarlaLight from './Karla-Light.ttf';

const FontStyles = createGlobalStyle`
    @font-face {
        font-family: '${theme.font.family.Karla}';
        font-display: swap;
        font-weight: ${theme.font.weight.regular};
        src: local('${theme.font.family.Karla}'), url(${KarlaRegular}) format('truetype');
    }

    @font-face {
        font-family: '${theme.font.family.Karla}';
        font-display: swap;
        font-weight: ${theme.font.weight.bolder};
        src: local('${theme.font.family.Karla}'), url(${KarlaBold}) format('truetype');
    }
    
    @font-face {
        font-family: '${theme.font.family.Karla}';
        font-display: swap;
        font-weight: ${theme.font.weight.light};
        src: local('${theme.font.family.Karla}'), url(${KarlaLight}) format('truetype');
    }

    * {
        font-family: '${theme.font.family.Karla}', sans-serif;
        font-display: swap;
    }
`;

export default FontStyles;
