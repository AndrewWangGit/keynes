// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract House is Ownable  {
    uint constant MIN_TIME = 1 days;
    uint constant MAX_TIME = 30 days;

    struct Auction {
        address owner;
        address nftAddress;
        uint tokenId;
        uint endTime;
        uint minPrice;
        uint amount;
        bool settled;
    }

    struct Bid {
        address bidder;
        uint amount;
    }

    uint public auctionId;
    address payable withdrawAddress;

    mapping(uint => Auction) public auctions;
    mapping(uint => Bid) public highestBid;

    constructor() {
        withdrawAddress = payable(msg.sender);
        auctionId = 0;
    }

    event NewAuction(
        address owner,
        uint auctionId,
        address _nftAddress,
        uint _tokenId,
        uint endTime,
        uint _minPrice,
        uint fee,
        bool finished
    );

    event NewBid(uint auctionId, address bidder, uint newBid);

    event UpdateFee(uint auctionId, uint newFee);

    function getMoney() public payable {}

    function createNewAuction(
        address _nftAddress,
        uint _tokenId,
        uint _duration,
        uint _minPrice
    ) public payable returns (address, uint, uint) {
        require(
            _duration >= MIN_TIME && _duration <= MAX_TIME,
            "Auctions must be between 1 and 30 days."
        );
        require(
            msg.value >= 0.001 ether,
            "Minimum listing price is 0.001 ether."
        );
        // require(address(this) == IERC721(_nftAddress).getApproved(_tokenId), "You must give permission to this contract!");
        uint endTime = _duration + block.timestamp;
        auctions[auctionId] = Auction(
            msg.sender,
            _nftAddress,
            _tokenId,
            endTime,
            _minPrice,
            msg.value,
            false
        );
        auctionId++;
        withdrawAddress.transfer(msg.value);
        emit NewAuction(
            msg.sender,
            auctionId - 1,
            _nftAddress,
            _tokenId,
            endTime,
            _minPrice,
            msg.value,
            false
        );
        return (msg.sender, auctionId - 1, endTime);
    }

    function addAmtToAuction(uint _auctionId) public payable {
        require(
            msg.value >= 0.001 ether,
            "Minimum price amount increase is 0.001 ether."
        );
        Auction storage auction = auctions[_auctionId];
        uint newFee = auction.amount + msg.value;
        auction.amount = newFee;
        withdrawAddress.transfer(msg.value);

        emit UpdateFee(_auctionId, newFee);
    }

    function placeBid(uint _auctionId) public payable {
        require(
            msg.value >= auctions[_auctionId].minPrice,
            "Auction price must be at least the minimum price."
        );
        require(
            msg.value > highestBid[_auctionId].amount,
            "You must bid more than the previous person!"
        );

        if (highestBid[_auctionId].amount == 0) {
            highestBid[_auctionId] = Bid(msg.sender, msg.value);
        } else {
            payable(highestBid[_auctionId].bidder).transfer(
                highestBid[_auctionId].amount
            );
            highestBid[_auctionId].bidder = msg.sender;
            highestBid[_auctionId].amount = msg.value;
        }

        emit NewBid(_auctionId, msg.sender, msg.value);
    }

    function settleAuction(uint _auctionId) public {
        Auction memory finishedAuction = auctions[_auctionId];
        Bid memory winningBid = highestBid[_auctionId];

        require(!finishedAuction.settled, "Auction already settled!");
        require(
            finishedAuction.endTime <= block.timestamp,
            "Auction not over!"
        );

        if (
            address(this) !=
            IERC721(finishedAuction.nftAddress).getApproved(
                finishedAuction.tokenId
            )
        ) {
            payable(winningBid.bidder).transfer(winningBid.amount);
            return;
        }

        if (winningBid.amount != 0) {
            IERC721(finishedAuction.nftAddress).safeTransferFrom(
                finishedAuction.owner,
                winningBid.bidder,
                finishedAuction.tokenId
            );
            payable(finishedAuction.owner).transfer(winningBid.amount);
        }

        IERC721(finishedAuction.nftAddress).approve(
            address(0x0),
            finishedAuction.tokenId
        );
        auctions[_auctionId].settled = true;
    }

    function getContractBalance() public view returns (uint) {
        return address(this).balance;
    }
}
