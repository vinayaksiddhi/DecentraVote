// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VotingSystem
 * @dev Decentralized voting system smart contract.
 * Candidates:
 *  1: Rahul
 *  2: Priya
 *  3: Aman
 */
contract VotingSystem {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    address public owner;
    bool public votingOpen;
    uint256 public votingDeadline;
    uint256 public candidateCount;

    mapping(uint256 => Candidate) public candidates;
    mapping(address => bool) public hasVoted;

    event VoteCast(address indexed voter, uint256 indexed candidateId);
    event VotingClosed(uint256 closedAt);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyWhileOpen() {
        require(votingOpen, "Voting is currently closed");
        require(block.timestamp < votingDeadline, "Voting deadline has passed");
        _;
    }

    /**
     * @notice Constructor initializes the voting system with a set duration and 3 candidates.
     * @param _durationInSeconds Duration for voting in seconds (e.g. 86400 for 24 hours, 3600 for 1 hour).
     */
    constructor(uint256 _durationInSeconds) {
        require(_durationInSeconds > 0, "Duration must be greater than 0");
        owner = msg.sender;
        votingOpen = true;
        votingDeadline = block.timestamp + _durationInSeconds;

        _addCandidate(1, "Rahul");
        _addCandidate(2, "Priya");
        _addCandidate(3, "Aman");
    }

    function _addCandidate(uint256 _id, string memory _name) private {
        candidates[_id] = Candidate({
            id: _id,
            name: _name,
            voteCount: 0
        });
        candidateCount++;
    }

    /**
     * @notice Cast a vote for a candidate by candidateId.
     * @param _candidateId The ID of the candidate (1, 2, or 3).
     */
    function vote(uint256 _candidateId) external onlyWhileOpen {
        require(!hasVoted[msg.sender], "You have already voted");
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate ID");

        hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount++;

        emit VoteCast(msg.sender, _candidateId);
    }

    /**
     * @notice Close voting manually before the deadline (Only owner).
     */
    function closeVoting() external onlyOwner {
        require(votingOpen, "Voting is already closed");
        votingOpen = false;
        emit VotingClosed(block.timestamp);
    }

    /**
     * @notice Get vote count for a specific candidate.
     * @param _candidateId The ID of the candidate.
     */
    function getCandidateVotes(uint256 _candidateId) external view returns (uint256) {
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate ID");
        return candidates[_candidateId].voteCount;
    }
}
