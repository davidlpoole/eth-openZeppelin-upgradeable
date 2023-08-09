// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "hardhat/console.sol";

contract VendingMachineV3 is Initializable {
    // these state variables and their values
    // will be preserved forever, regardless of upgrading
    uint public numSodas;
    address public owner;
    mapping(address => uint) public purchases;

    function initialize(uint _numSodas) public initializer {
        numSodas = _numSodas;
        owner = msg.sender;
    }

    function resupplySodas(uint amount) public onlyOwner {
        numSodas += amount;
    }

    function getPurchases(address customer) public view returns (uint) {
        return purchases[customer];
    }

    function purchaseSoda() public payable {
        require(numSodas > 0, "There's no stock left!");
        require(msg.value >= 1000 wei, "You must pay 1000 wei for a soda!");
        numSodas--;
        purchases[msg.sender] += 1;
    }

    function withdrawProfits() public onlyOwner {
        require(address(this).balance > 0, "Profits must be greater than 0 in order to withdraw!");
        (bool sent,) = owner.call{value: address(this).balance}("");
        require(sent, "Failed to send ether");
    }

    function setNewOwner(address _newOwner) public onlyOwner {
        owner = _newOwner;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }
}