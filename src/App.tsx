import React, { useEffect } from 'react';
import './App.css';
import Routes from './routes';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

function App() {
  useEffect(() => {});

  return (
    <div className="App">
      <Header />
      <Routes />
      <Footer />
    </div>
  );
}

export default App;
