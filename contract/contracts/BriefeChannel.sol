// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title BriefeChannel
contract BriefeChannel is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    // ==== Ownable contract override start ====
    function transferOwnership(address) public pure override {
        revert("BriefeChannel: cannot transfer ownership");
    }

    function renounceOwnership() public pure override {
        revert("BriefeChannel: cannot renounce ownership");
    }

    // ==== Ownable contract override end ====

    string public description;
    string public name;
    EnumerableSet.AddressSet private subscriber;

    constructor(string memory _name, string memory _description) payable {
        description = _description;
        name = _name;
    }

    function subscribe() public {
        require(msg.sender != owner(), "You can't subscribe yourself");
        subscriber.add(msg.sender);
    }

    function unsubscribe() public {
        require(msg.sender != owner(), "You can't unsubscribe yourself");
        subscriber.remove(msg.sender);
    }

    function getSubscribers() public view onlyOwner returns (address[] memory) {
        return subscriber.values();
    }

    function getSubscriberCount() public view returns (uint256) {
        return subscriber.length();
    }

    function kill() public payable onlyOwner {
        selfdestruct(payable(owner()));
    }
}
