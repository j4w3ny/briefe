import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Briefe, BriefeGroup } from '../typechain-types';
import { BriefeState } from './Briefe';

enum GroupMemberState {
  Left = 0,
  Requested = 1,
  Joined = 2,
  Blocked = 3,
}

enum GroupVisitable {
  Private = 0,
  Public = 1,
}
describe('BriefeGroup', () => {
  let briefe: Briefe;

  async function deployContract() {
    const Briefe = await ethers.getContractFactory('Briefe');
    const briefe = await Briefe.deploy();

    return { briefe };
  }

  before(async () => {
    const { briefe: contract } = await loadFixture(deployContract);
    briefe = contract;

    // Setup briefe contract and accounts
    const [, member, member2] = await ethers.getSigners();
    await briefe.setState(BriefeState.Active);
    await briefe.connect(member).setState(BriefeState.Active);
    await briefe.connect(member2).setState(BriefeState.Active);
  });

  describe('Group Action', () => {
    let privateGroup: BriefeGroup;
    let publicGroup: BriefeGroup;

    describe('basic', () => {
      async function createPrivateGroup() {
        const groupName = 'Test';
        const groupDesc = 'Test';
        const BriefeGroup = await ethers.getContractFactory('BriefeGroup');
        const briefeGroup = await BriefeGroup.deploy(groupName, groupDesc);
        return briefeGroup;
      }
      it('createGroup#Private', async () => {
        const newGroup = await createPrivateGroup();
        expect(await newGroup.config()).to.equal(GroupVisitable.Private);

        privateGroup = newGroup;
      });

      it('createGroup#Public', async () => {
        const newGroup = await createPrivateGroup();
        await newGroup.setVisitable(GroupVisitable.Public);
        expect(await newGroup.config()).to.equal(GroupVisitable.Public);

        publicGroup = newGroup;
      });

      it('joinGroup#Private', async () => {
        const [, member] = await ethers.getSigners();
        const memberName = await briefe.nickname(member.address);

        await expect(privateGroup.connect(member).requestJoin(memberName))
          .to.emit(privateGroup, 'MemberStateUpdate')
          .withArgs(member.address, GroupMemberState.Requested);

        await privateGroup.setMemberState(
          member.address,
          GroupMemberState.Joined
        );
        expect(await privateGroup.members(member.address)).to.eqls([
          memberName,
          GroupMemberState.Joined,
        ]);
      });

      it('joinGroup#Public', async () => {
        const [, member] = await ethers.getSigners();
        const memberName = await briefe.nickname(member.address);

        await publicGroup.connect(member).requestJoin(memberName);
        expect(await publicGroup.members(member.address)).to.eqls(['', 2]);
      });

      it('leaveGroup', async () => {
        const [, member] = await ethers.getSigners();
        const memberName = await briefe.nickname(member.address);
        expect(await privateGroup.members(member.address)).to.eqls([
          memberName,
          GroupMemberState.Joined,
        ]);

        await privateGroup.connect(member).exit();
        expect(await privateGroup.members(member.address)).to.eql([
          memberName,
          GroupMemberState.Left,
        ]);
      });
    });

    describe('Admin', () => {
      before(async () => {
        const [, member] = await ethers.getSigners();
        const memberName = await briefe.nickname(member.address);
        await privateGroup.connect(member).requestJoin(memberName);
        await privateGroup.setMemberState(
          member.address,
          GroupMemberState.Joined
        );
      });
      it('blockMember', async () => {
        const [, member] = await ethers.getSigners();
        const memberName = await briefe.nickname(member.address);

        expect(await privateGroup.members(member.address)).to.eqls([
          memberName,
          GroupMemberState.Joined,
        ]);

        await privateGroup.setMemberState(
          member.address,
          GroupMemberState.Blocked
        );
        expect(await privateGroup.members(member.address)).to.eql([
          memberName,
          GroupMemberState.Blocked,
        ]);
      });

      it('unblockMember', async () => {
        const [, member] = await ethers.getSigners();
        const memberName = await briefe.nickname(member.address);

        expect(await privateGroup.members(member.address)).to.eqls([
          memberName,
          GroupMemberState.Blocked,
        ]);

        await privateGroup.setMemberState(
          member.address,
          GroupMemberState.Joined
        );
        expect(await privateGroup.members(member.address)).to.eql([
          memberName,
          GroupMemberState.Joined,
        ]);
      });

      it('kill group', async () => {
        const ke = await (await privateGroup.kill()).wait();
        const address = ke.events?.find((v) => v.event === 'Kill')?.address;
        expect(address).equal(privateGroup.address);
        await expect(privateGroup.config()).to.be.rejectedWith();
      });
    });
  });
});
