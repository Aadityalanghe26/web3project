// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CertiChain
 * @notice Decentralized certificate issuance and verification platform.
 * @dev Uses OpenZeppelin AccessControl for role-based permissions.
 */
contract CertiChain is AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    struct Certificate {
        string certificateId;   // e.g. CERT-2026-000001
        string studentName;
        address studentAddress;
        string courseName;
        string issuerName;
        uint256 issueDate;       // unix timestamp
        string ipfsCid;          // web3.storage CID of the PDF
        bool isValid;
        bool exists;
    }

    // certificateId => Certificate
    mapping(string => Certificate) private _certificates;

    // Sequential counter for generating certificate IDs
    uint256 private _counter;

    // Events
    event CertificateIssued(
        string indexed certificateId,
        address indexed studentAddress,
        address indexed issuer,
        uint256 issueDate
    );

    event CertificateRevoked(
        string indexed certificateId,
        address indexed revokedBy
    );

    /**
     * @dev Grants DEFAULT_ADMIN_ROLE and ISSUER_ROLE to the deployer.
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
    }

    /**
     * @notice Issue a new certificate.
     * @param studentName     Full name of the student.
     * @param studentAddress  Ethereum address of the student.
     * @param courseName      Name of the completed course / program.
     * @param issuerName      Name of the issuing institution.
     * @param ipfsCid         IPFS CID of the certificate PDF.
     * @return certificateId  Human-readable ID in format CERT-{YEAR}-{000001}.
     */
    function issueCertificate(
        string calldata studentName,
        address studentAddress,
        string calldata courseName,
        string calldata issuerName,
        string calldata ipfsCid
    ) external onlyRole(ISSUER_ROLE) returns (string memory certificateId) {
        require(bytes(studentName).length > 0, "CertiChain: studentName empty");
        require(studentAddress != address(0), "CertiChain: invalid student address");
        require(bytes(courseName).length > 0, "CertiChain: courseName empty");
        require(bytes(issuerName).length > 0, "CertiChain: issuerName empty");
        require(bytes(ipfsCid).length > 0, "CertiChain: ipfsCid empty");

        _counter++;
        uint256 year = _getYear(block.timestamp);
        certificateId = _buildCertId(year, _counter);

        _certificates[certificateId] = Certificate({
            certificateId: certificateId,
            studentName: studentName,
            studentAddress: studentAddress,
            courseName: courseName,
            issuerName: issuerName,
            issueDate: block.timestamp,
            ipfsCid: ipfsCid,
            isValid: true,
            exists: true
        });

        emit CertificateIssued(certificateId, studentAddress, msg.sender, block.timestamp);
    }

    /**
     * @notice Revoke an existing certificate.
     * @param certificateId  The certificate to revoke.
     */
    function revokeCertificate(string calldata certificateId)
        external
        onlyRole(ISSUER_ROLE)
    {
        Certificate storage cert = _certificates[certificateId];
        require(cert.exists, "CertiChain: certificate not found");
        require(cert.isValid, "CertiChain: already revoked");

        cert.isValid = false;

        emit CertificateRevoked(certificateId, msg.sender);
    }

    /**
     * @notice Retrieve full certificate data.
     * @param certificateId  The certificate ID to look up.
     */
    function getCertificate(string calldata certificateId)
        external
        view
        returns (Certificate memory)
    {
        require(_certificates[certificateId].exists, "CertiChain: certificate not found");
        return _certificates[certificateId];
    }

    /**
     * @notice Verify whether a certificate is valid (exists and not revoked).
     * @param certificateId  The certificate ID to verify.
     * @return valid         True if exists and not revoked.
     */
    function verifyCertificate(string calldata certificateId)
        external
        view
        returns (bool valid)
    {
        Certificate storage cert = _certificates[certificateId];
        return cert.exists && cert.isValid;
    }

    // ─── Internal helpers ────────────────────────────────────────────────────

    function _buildCertId(uint256 year, uint256 counter)
        internal
        pure
        returns (string memory)
    {
        return string(
            abi.encodePacked("CERT-", _uintToString(year), "-", _padSix(counter))
        );
    }

    function _getYear(uint256 timestamp) internal pure returns (uint256) {
        // Simplified on-chain year calculation
        uint256 secondsInYear = 365 days;
        return 1970 + (timestamp / secondsInYear);
    }

    function _uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) { digits++; temp /= 10; }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function _padSix(uint256 value) internal pure returns (string memory) {
        string memory s = _uintToString(value);
        bytes memory b = bytes(s);
        if (b.length >= 6) return s;
        bytes memory padded = new bytes(6);
        uint256 pad = 6 - b.length;
        for (uint256 i = 0; i < pad; i++) padded[i] = "0";
        for (uint256 i = 0; i < b.length; i++) padded[pad + i] = b[i];
        return string(padded);
    }
}
