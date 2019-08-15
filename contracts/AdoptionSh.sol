pragma solidity >=0.4.22 <0.6.0;

contract AdoptionSh {
  // address类型指向的是以太坊地址，存储为20个字节的值
  // 定义了一个固定长度16为的数组，也就是16个领养宠物的人对应的以太坊地址
  address[16] public adopters;

  // 领养宠物
  function adopt() public {
    uint petId = 8;
    address adopter = 0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c;
    adopters[petId] = adopter;
  }

  // 获取领养人
  // 确保返回类型是adopters指定的类型->address[16]
  function getAdopters() public view returns(address[16] memory) {
    return adopters;
  }
}