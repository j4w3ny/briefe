import {
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { useEthers, Polygon, ChainId } from '@usedapp/core';
import { useNavigate } from 'react-router-dom';
import { gun, initGun } from '../lib/chat/gun';
interface WalletProps {
  open: boolean;
  onClose: () => void;
}
export function Wallet({ open, onClose }: WalletProps) {
  const {
    activateBrowserWallet,
    account,
    deactivate,
    error,
    switchNetwork,
    library,
  } = useEthers();
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{account ? 'Connect to wallet' : 'Wallet'}</DialogTitle>
      <DialogContent>
        {account ? (
          <Typography>Connected wallet: {account}</Typography>
        ) : (
          <Button
            onClick={async () => {
              activateBrowserWallet();
            }}
          >
            Connect To Metamask
          </Button>
        )}
        {account && (
          <Button
            onClick={() => {
              deactivate();
              gun.user().leave();
            }}
          >
            Deactivate
          </Button>
        )}
        {error && <Typography>{error.name}</Typography>}
      </DialogContent>
    </Dialog>
  );
}
