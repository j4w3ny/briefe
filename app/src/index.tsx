import {
  Config,
  DAppProvider,
  Hardhat,
  Polygon,
  useEthers,
} from '@usedapp/core';
import { getDefaultProvider } from 'ethers';
import { CssBaseline, createTheme, ThemeProvider } from '@mui/material';
import { Briefe__factory } from '@briefe/contract/typechain-types';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { lazy, StrictMode, Suspense, useEffect } from 'react';
import Chat from './pages/chat';
import RootLayout from './components/layout';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function BriefeApp() {
  const config: Config = {
    readOnlyChainId: Polygon.chainId,
    readOnlyUrls: {
      [Polygon.chainId]: getDefaultProvider('matic'),
      [Hardhat.chainId]: 'http://localhost:8545',
    },
  };
  const testConfig: Config = {
    readOnlyChainId: Hardhat.chainId,
    readOnlyUrls: {
      [Hardhat.chainId]: 'http://localhost:8545',
    },
  };

  return (
    <StrictMode>
      <DAppProvider config={testConfig}>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<RootLayout />}>
                <Route path="" element={<Home />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/launch" element={<Launch />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </DAppProvider>
    </StrictMode>
  );
}

function Home() {
  const nav = useNavigate();
  useEffect(() => {
    nav('/launch');
  });
  return <div>Loading...</div>;
}

function Launch() {
  return <>LOGIN REQUIRED</>;
}
createRoot(document.getElementById('app')!).render(<BriefeApp />);
export default BriefeApp;
