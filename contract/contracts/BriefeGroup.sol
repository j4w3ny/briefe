// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Multicall.sol";

interface EBriefeGroup {
    enum Visitable {
        Private,
        Public
    }

    enum MemberState {
        Left,
        // Requested to join the group.
        Requested,
        // Accepted to join the group.
        Joined,
        // Rejected/Block user request.
        Blocked
    }

    event Exit(address _address);
    event Kill(address _channel);
    event MemberStateUpdate(address _address, MemberState _state);
}

/// @title BriefeGroup - private chatting room
contract BriefeGroup is
    Ownable,
    AccessControlEnumerable,
    EBriefeGroup,
    Multicall
{
    // ==== Ownable contract override start ====

    function renounceOwnership() public pure override {
        revert(
            "BriefeGroup: cannot renounce ownership. If you want to dismiss the entire group please call 'kill' function"
        );
    }

    // ==== Ownable contract override end ====

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant MEMBER_ROLE = keccak256("MEMBER");

    struct Member {
        string name;
        MemberState state;
    }

    struct GroupConfig {
        Visitable visitable;
    }

    string public name;
    string public description;
    mapping(address => Member) public members;
    GroupConfig public config;

    // Create a new Group
    // Note: Not safe since we cannot verify Briefe contract at the moment.
    constructor(string memory _name, string memory _description) {
        name = _name;
        description = _description;
        _setRoleAdmin(DEFAULT_ADMIN_ROLE, ADMIN_ROLE);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function setVisitable(Visitable _visitable) public onlyOwner {
        config.visitable = _visitable;
    }

    function requestJoin(string memory nameInGroup) public {
        require(
            msg.sender != owner(),
            "Owner can't request join your own group"
        );
        require(
            members[msg.sender].state != MemberState.Requested,
            "You have already requested to join this group"
        );
        require(
            members[msg.sender].state != MemberState.Joined,
            "You have already joined this group"
        );
        require(
            members[msg.sender].state != MemberState.Blocked,
            "You have been blocked from this group, please contact with admin"
        );

        // Request nickname from parent Briefe contract
        members[msg.sender].name = nameInGroup;
        members[msg.sender].state = MemberState.Requested;

        if (config.visitable == Visitable.Public) {
            members[msg.sender].state = MemberState.Joined;
        }

        emit MemberStateUpdate(msg.sender, members[msg.sender].state);
    }

    function setMemberState(address _address, MemberState _state)
        public
        onlyRole(ADMIN_ROLE)
    {
        require(
            members[_address].state != _state,
            "User already in the given state"
        );
        members[_address].state = _state;
        emit MemberStateUpdate(_address, _state);
    }

    // Exit a group
    function exit() public {
        require(msg.sender != owner(), "Only members can exit");
        require(
            members[msg.sender].state == MemberState.Joined,
            "You have not joined this group"
        );
        _exitMember(msg.sender);
    }

    function _exitMember(address _address) private {
        delete members[_address];
        emit Exit(_address);
    }

    /**
     * @dev Remove all members in the group and kill itself.
     * Only available to the owner.
     */
    function kill() public payable onlyOwner {
        delete members[owner()];
        emit Kill(address(this));
        selfdestruct(payable(owner()));
    }
}
