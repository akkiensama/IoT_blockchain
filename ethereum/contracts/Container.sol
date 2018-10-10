pragma solidity ^0.4.24;

contract Container{
    address public owner;

    bytes32[] public actHashHead;
    bytes32[] public actHashTail;

    bytes32[] public sensorHashHead;
    bytes32[] public sensorHashTail;

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner(){
        require(msg.sender == owner, "only owner could call this function");
        _;
    }

    function pushActHash(bytes32 head, bytes32 tail) public onlyOwner {
        actHashHead.push(head);
        actHashTail.push(tail);
    }

    function pushSensorHash(bytes32 head, bytes32 tail) public onlyOwner {
        sensorHashHead.push(head);
        sensorHashTail.push(tail);
    }

    function getActHash(uint index) public view returns(bytes32, bytes32){
        return (actHashHead[index], actHashTail[index]);
    }

    function getSensorHash(uint index) public view returns(bytes32, bytes32){
        return (sensorHashHead[index], sensorHashTail[index]);
    }

}

