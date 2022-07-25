import { BriefeState } from '@briefe/contract/shared/Briefe';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
} from '@mui/material';
import { useContractFunction, useEthers } from '@usedapp/core';
import { briefe } from '../../../lib/ethers/Briefe';

export default function FirstLogin(props: DialogProps) {
  const { library } = useEthers();
  const { state, send } = useContractFunction(briefe, 'setState', {
    transactionName: 'Active',
  });

  return (
    <Dialog {...props}>
      <DialogTitle>First time here? Register to Briefe</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {`The requirement to use Briefe is that you need to register to Briefe first.
             Press "Comfirm" to send a "Active" transaction to the Briefe contract in order to processing the activation.`}
        </DialogContentText>
        <DialogActions>
          <Button
            color="primary"
            onClick={async () => {
              await send(BriefeState.Active);
              await library?.getSigner()?.signMessage('Login Into Briefe');
            }}
          >
            Comfirm
          </Button>
        </DialogActions>
        {(state.status === 'Fail') !== (state.status === 'Exception') && (
          <Alert severity="error">{state.errorMessage}</Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
