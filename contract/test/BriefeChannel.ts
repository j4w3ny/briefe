import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect, should } from 'chai';
import { ethers } from 'hardhat';
import { Briefe, BriefeChannel, BriefeGroup } from '../typechain-types';
import { BriefeState } from './Briefe';

describe('BriefeChannel', () => {
  let channel: BriefeChannel;
  it('createChannel', async () => {
    const channelName = 'Test';
    const channelDesc = 'Test ~Unicode~';
    const BriefeChannel = await ethers.getContractFactory('BriefeChannel');
    const briefeChannel = await BriefeChannel.deploy(channelName, channelDesc);
    channel = briefeChannel;
  });

  it('get#name', async () => {
    expect(await channel.name()).to.equal('Test');
  });
  it('get#description', async () => {
    expect(await channel.description()).to.equal('Test ~Unicode~');
  });
  it('get#subscriberCount', async () => {
    expect(await channel.getSubscriberCount()).to.equal(0);
  });
  it('subscribe', async () => {
    const [, member] = await ethers.getSigners();
    await channel.connect(member).subscribe();
    expect(await channel.getSubscriberCount()).to.equal(1);
    expect(await channel.getSubscribers()).to.eql([member.address]);
  });

  it('unsubscribe', async () => {
    const [, member] = await ethers.getSigners();
    await channel.connect(member).unsubscribe();
    expect(await channel.getSubscriberCount()).to.equal(0);
    expect(await channel.getSubscribers()).to.eql([]);
  });

  it('kill channel', async () => {
    await channel.kill();
    await expect(channel.getSubscriberCount()).to.reverted;
  });
});
