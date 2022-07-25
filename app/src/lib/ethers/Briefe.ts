import { Briefe__factory, Briefe } from '@briefe/contract/typechain-types';
import { Contract } from 'ethers';

export const briefe = new Contract(
  '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  Briefe__factory.abi,
) as Briefe;
