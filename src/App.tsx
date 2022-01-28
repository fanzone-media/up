import React, { useEffect } from 'react';
import './App.css';
import Routes from './routes';
import { useAppDispatch } from './boot/store';
import { fetchAllProfiles } from './features/profiles';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

function App() {
  const addresses = [
    '0x5C604ce30001Bf97D72471adA70dFDf3dC21C0e4',
    '0x6166ED6bf03ccBC9c8AD7b1C8EBf42B835e86082',
  ];

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchAllProfiles(addresses));
  });

  return (
    <div className="App">
      <Header />
      <Routes />
      <Footer />
    </div>
  );
}

export default App;
