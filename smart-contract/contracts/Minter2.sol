// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract Minter2 is ERC721URIStorage {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;
  // Contract global variables.
  uint256 public constant mintPrice = 30000000000000000; // 0.03 ETH.

  constructor() ERC721("Minter2", "MINTER2") {}

  function mint(string memory tokenURI) public payable {
    require(mintPrice <= msg.value, "Not enough CET sent.");
    _tokenIds.increment();

    uint256 newItemId = _tokenIds.current();

    _safeMint(msg.sender, newItemId);
    _setTokenURI(newItemId, tokenURI);
  }
}