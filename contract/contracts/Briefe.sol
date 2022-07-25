// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Multicall.sol";

interface EBriefe {
    enum State {
        Inactive,
        Active,
        Archived
    }

    enum Strategy {
        Allow,
        Deny
    }
    event CreateGroup(address group);
    event CreateChannel(address channel);
}

/// @title Briefe - private message contract
contract Briefe is EBriefe, Multicall {
    using EnumerableSet for EnumerableSet.AddressSet;

    mapping(address => string) public nickname;
    mapping(address => Strategy) public strategy;
    mapping(address => State) public state;
    mapping(address => EnumerableSet.AddressSet) private allowOrBlockList;

    /**
     * @dev Check if the sender  has activated the contract.
     */
    modifier requiredSenderActivated() {
        require(
            state[msg.sender] == State.Active,
            "Only active users can use this contract"
        );
        _;
    }

    function getAllowOrBlockList(address _address)
        public
        view
        returns (address[] memory)
    {
        return allowOrBlockList[_address].values();
    }

    function getAllowOrBlockListCount(address _address)
        public
        view
        returns (uint256)
    {
        return allowOrBlockList[_address].length();
    }

    function setState(State _state) public {
        state[msg.sender] = _state;
    }

    function setNickName(string memory _name) public requiredSenderActivated {
        nickname[msg.sender] = _name;
    }

    // Block one address.
    function addAllowOrBlockAddress(address _address)
        public
        requiredSenderActivated
    {
        require(_address != msg.sender, "You can't block/allow yourself");
        allowOrBlockList[msg.sender].add(_address);
    }

    // Set user's strategy
    function setStrategty(Strategy _strategy) public {
        strategy[msg.sender] = _strategy;

        while (allowOrBlockList[msg.sender].length() != 0) {
            allowOrBlockList[msg.sender].remove(
                allowOrBlockList[msg.sender].at(0)
            );
        }

        assert(allowOrBlockList[msg.sender].length() == 0);
    }
}
