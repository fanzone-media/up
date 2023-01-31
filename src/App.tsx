import React from 'react';
import { ThemeProvider } from 'styled-components';
import './App.css';
import { theme } from './boot/styles';
import Routes from './routes';
import { ModalProvider } from './context/ModalProvider';
import { Web3Provider } from './boot/Web3Provider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Web3Provider>
        <ModalProvider>
          <div className="App">
            <Routes />
            <ToastContainer />
          </div>
        </ModalProvider>
      </Web3Provider>
    </ThemeProvider>
  );
};

export default App;
