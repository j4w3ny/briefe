import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
} from '@mui/material';
import { Mail, Menu } from '@mui/icons-material';
import {
  useState,
  useEffect,
  ReactNode,
  ReactElement,
  useCallback,
  createContext,
} from 'react';
import { useEthers, ChainId } from '@usedapp/core';
import { Outlet, useNavigate } from 'react-router-dom';
import { Wallet } from './Wallet';
import { useAsync, useEffectOnce } from 'react-use';
import { gun, initGun } from '../lib/chat/gun';
import { getMessages, sendMessage } from '../lib/chat/message';

const Title = createContext('Briefe');

export default function RootLayout() {
  const [open, setOpen] = useState(false);
  const { account, switchNetwork, library, chainId } = useEthers();
  const nav = useNavigate();

  useEffect(() => {
    const f = async () => {
      gun.user().recall({
        sessionStorage: true,
      });

      if (!gun.user().is) {
        const message =
          account &&
          (await library?.getSigner()?.signMessage('Login Into Briefe'));
        console.log('msg', message);

        await initGun(account!, message!);
      }
    };
    if (account) {
      nav('/chat');
      f();
    } else {
      nav('/launch');
    }
  }, [account]);

  useEffect(() => {
    if (chainId !== ChainId.Hardhat) switchNetwork(ChainId.Hardhat);
  }, [chainId]);
  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar
          position="fixed"
          sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}
        >
          <Toolbar>
            <Typography
              variant="h6"
              component="div"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              <Title.Consumer>{title => title}</Title.Consumer>
            </Typography>

            <Box sx={{ display: 'flex' }}>
              <IconButton>
                <Mail />
              </IconButton>

              <Button onClick={() => setOpen(true)}>
                {account
                  ? `${account.substring(0, 16)}...`
                  : 'Connect To Wallet'}
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        <Wallet
          open={open}
          onClose={() => {
            setOpen(false);
          }}
        />
      </Box>
      <Toolbar />
      <Outlet />
    </>
  );
}
