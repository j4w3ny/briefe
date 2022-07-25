import Gun, { ISEAPair } from 'gun';
import { gun } from './gun';
import SEA from 'gun/sea';
type Message = {
  to: string;
  content: string;
  timestamp: number;
};

export async function sendMessage(recvPubKey: string, msg: Message) {
  console.log(gun);
  const keypair = (gun.user()._ as any).sea as ISEAPair;
  const passphrase = await SEA.secret(recvPubKey, keypair);
  const encryptedMsg = await SEA.encrypt(msg, passphrase!);
  console.log(encryptedMsg);
  return encryptedMsg;
}

export async function getMessages(message: string, senderPubKey: string) {
  const keypair = (gun.user()._ as any).sea as ISEAPair;
  const passphrase = await SEA.secret(senderPubKey, keypair);
  const msg = await SEA.decrypt(message, passphrase!);
  console.log(msg);
}
