import Gun, { ISEAPair } from 'gun';
import 'gun/sea';
import pify from 'pify';
import { useState } from 'react';
export const gun = new Gun({ peers: ['http://localhost:8765/gun'] });

export async function initGun(account: string, password: string) {
  const user = gun.user();
  const ack = await new Promise<boolean>(resolved => {
    user.auth(account, password, ack => {
      if ('err' in ack) {
        resolved(false);
      } else {
        resolved(true);
      }
    });
  });
  if (!ack) {
    const cb = await new Promise<boolean>(resolved => {
      user.create(account, password, ack => {
        if ('err' in ack) {
          resolved(false);
        } else {
          resolved(true);
        }
      });
    });
    return cb;
  }
  return ack;
}
