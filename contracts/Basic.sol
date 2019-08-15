
pragma solidity >=0.4.22 <0.6.0;
contract Basic {
    event Print(uint);
    function Multiply(uint input) public returns (uint) {
        emit Print(input * 7);
        return input * 7;
    }
}