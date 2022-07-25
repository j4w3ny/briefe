import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { Briefe } from '../typechain-types';
import { createHash } from 'crypto';

export enum BriefeState {
  Inactive = 0,
  Active = 1,
  Archive = 2,
}

enum BriefeStrategy {
  Allow = 0,
  Deny = 1,
}

describe('Briefe', () => {
  async function deployContract() {
    const Briefe = await ethers.getContractFactory('Briefe');
    const briefe = await Briefe.deploy();

    return { briefe };
  }

  describe('Account', () => {
    let briefe: Briefe;

    before(async () => {
      const { briefe: contract } = await loadFixture(deployContract);
      briefe = contract;
    });

    it('#register', async () => {
      const [sender, receiver] = await ethers.getSigners();
      await briefe.setState(BriefeState.Active);
      expect(await briefe.state(sender.address)).to.eq(BriefeState.Active);

      await briefe.connect(receiver).setState(BriefeState.Active);
      expect(await briefe.state(receiver.address)).to.eq(BriefeState.Active);
    });

    describe('#info', () => {
      it('state#Actived', async () => {
        const [sender, receiver] = await ethers.getSigners();
        expect(await briefe.state(sender.address)).to.eq(BriefeState.Active);
        expect(await briefe.state(receiver.address)).to.eq(BriefeState.Active);
      });

      it('state#Inactive', async () => {
        const [, , inactive] = await ethers.getSigners();
        expect(await briefe.state(inactive.address)).to.eq(
          BriefeState.Inactive
        );
      });

      it('updateState', async () => {
        const [, , inactive] = await ethers.getSigners();
        await briefe.connect(inactive).setState(BriefeState.Active);
        expect(await briefe.state(inactive.address)).to.eq(BriefeState.Active);
      });
    });

    describe('#strategy', () => {
      it('allow', async () => {
        const [sender, receiver, receiver2] = await ethers.getSigners();
        await briefe.setStrategty(BriefeStrategy.Allow);
        await briefe.addAllowOrBlockAddress(receiver.address);
        await briefe.addAllowOrBlockAddress(receiver2.address);
        expect(await briefe.strategy(sender.address)).to.eq(
          BriefeStrategy.Allow
        );
        expect(await briefe.getAllowOrBlockList(sender.address)).to.include(
          receiver.address
        );
      });
      it('switch to deny', async () => {
        const [sender] = await ethers.getSigners();
        await briefe.setStrategty(BriefeStrategy.Deny);
        expect(await briefe.strategy(sender.address)).to.eq(
          BriefeStrategy.Deny
        );
        expect(await briefe.getAllowOrBlockList(sender.address)).to.be.empty;
      });
      it('deny', async () => {
        const [sender, receiver, receiver2] = await ethers.getSigners();
        await briefe.addAllowOrBlockAddress(receiver.address);
        await briefe.addAllowOrBlockAddress(receiver2.address);
        expect(await briefe.strategy(sender.address)).to.eq(
          BriefeStrategy.Deny
        );
        expect(await briefe.getAllowOrBlockList(sender.address))
          .to.include(receiver.address)
          .include(receiver2.address);
      });
    });
  });
});
