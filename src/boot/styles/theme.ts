import { keyframes } from 'styled-components';

const theme = {
  animation: {
    cardrender: keyframes`
        0% { opacity: 0 },
        100% { opacity: 1 },
        `,
  },
  font: {
    family: {
      Karla: 'Karla',
    },
    weight: {
      light: 300,
      regular: 400,
      bold: 600,
      bolder: 700,
    },
  },
  screen: {
    xs: '(min-width: 480px)',
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
  },
};

export default theme;
