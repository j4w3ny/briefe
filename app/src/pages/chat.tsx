import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Drawer,
  IconButton,
} from '@mui/material';
import { Mail } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useCall, useEthers } from '@usedapp/core';
import { useNavigate } from 'react-router-dom';
import { BriefeState } from '@briefe/contract/shared/Briefe';
import { useAsync, useEffectOnce, useLocalStorage } from 'react-use';
import { briefe } from '../lib/ethers/Briefe';
import FirstLogin from '../components/chat/dialog/Login';
import { gun, initGun } from '../lib/chat/gun';

const drawerWidth = 240;
export default function Chat() {
  const { account, deactivate, library } = useEthers();
  const { value: state, error } =
    useCall(
      account && { contract: briefe, method: 'state', args: [account ?? ''] },
    ) ?? {};
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state && state?.[0] !== BriefeState.Active) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [state, error]);

  useEffect(() => {
    const user = gun.user();

    user.get('groups').once(() => {
      console.log('groups changed');
    });
    user.get('channels').once(() => {});
    // Fetch user private message
    // On-chain Data(getAllowOrBlockList) =>
    // Block Strategy => user("${receiver}").get('inbox').get('${receiver}').put(/* message */).filter
    // Allow Strategy => user("${receiver}").get('inbox').get('${receiver}').put(/* message */).filter
  });
  return (
    <Box
      sx={{
        display: 'flex',
      }}
    >
      <Drawer
        variant="permanent"
        sx={{
          width: { sm: drawerWidth, xs: '100%' },
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: { sm: drawerWidth, xs: '100%' },
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        TESTTTTT
      </Drawer>
      <ChatRoom />

      <FirstLogin
        open={open}
        onClose={() => {
          if (state?.[0] === BriefeState.Active) {
            setOpen(false);
          } else {
            deactivate();
            setOpen(false);
          }
        }}
      />
    </Box>
  );
}

function ChatRoom() {
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 3,
        display: {
          sm: 'block',
          xs: 'none',
        },
      }}
    >
      TESTTT
    </Box>
  );
}
