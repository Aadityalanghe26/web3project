import { expect } from "chai";
import { ethers } from "hardhat";
import { CertiChain } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("CertiChain Contract", function () {
  let certichain: CertiChain;
  let owner: HardhatEthersSigner;
  let issuer: HardhatEthersSigner;
  let student: HardhatEthersSigner;
  let unauthorizedUser: HardhatEthersSigner;
  let ISSUER_ROLE: string;

  beforeEach(async function () {
    [owner, issuer, student, unauthorizedUser] = await ethers.getSigners();

    const CertiChainFactory = await ethers.getContractFactory("CertiChain");
    certichain = await CertiChainFactory.deploy();
    await certichain.waitForDeployment();

    ISSUER_ROLE = await certichain.ISSUER_ROLE();

    // Grant ISSUER_ROLE to issuer signer
    await certichain.grantRole(ISSUER_ROLE, issuer.address);
  });

  describe("Deployment & Roles", function () {
    it("Should assign DEFAULT_ADMIN_ROLE and ISSUER_ROLE to deployer", async function () {
      const DEFAULT_ADMIN_ROLE = await certichain.DEFAULT_ADMIN_ROLE();
      expect(await certichain.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await certichain.hasRole(ISSUER_ROLE, owner.address)).to.be.true;
    });

    it("Should successfully grant ISSUER_ROLE to another address", async function () {
      expect(await certichain.hasRole(ISSUER_ROLE, issuer.address)).to.be.true;
    });
  });

  describe("Issuing Certificates", function () {
    it("Should allow ISSUER_ROLE to issue a valid certificate", async function () {
      const tx = await certichain.connect(issuer).issueCertificate(
        "Alice Smith",
        student.address,
        "Full-Stack Web3 Development",
        "CertiChain Academy",
        "bafybeic1234567890abcdef"
      );

      const receipt = await tx.wait();
      expect(receipt).to.not.be.null;

      const certId = "CERT-2026-000001";
      const cert = await certichain.getCertificate(certId);

      expect(cert.certificateId).to.equal(certId);
      expect(cert.studentName).to.equal("Alice Smith");
      expect(cert.studentAddress).to.equal(student.address);
      expect(cert.courseName).to.equal("Full-Stack Web3 Development");
      expect(cert.issuerName).to.equal("CertiChain Academy");
      expect(cert.ipfsCid).to.equal("bafybeic1234567890abcdef");
      expect(cert.isValid).to.be.true;
      expect(cert.exists).to.be.true;

      const isValid = await certichain.verifyCertificate(certId);
      expect(isValid).to.be.true;
    });

    it("Should auto-increment certificate IDs sequentially", async function () {
      await certichain.connect(issuer).issueCertificate(
        "Alice Smith",
        student.address,
        "Course 1",
        "Academy",
        "cid1"
      );

      await certichain.connect(issuer).issueCertificate(
        "Bob Jones",
        student.address,
        "Course 2",
        "Academy",
        "cid2"
      );

      const cert1 = await certichain.getCertificate("CERT-2026-000001");
      const cert2 = await certichain.getCertificate("CERT-2026-000002");

      expect(cert1.studentName).to.equal("Alice Smith");
      expect(cert2.studentName).to.equal("Bob Jones");
    });

    it("Should revert if caller does not have ISSUER_ROLE", async function () {
      await expect(
        certichain.connect(unauthorizedUser).issueCertificate(
          "Charlie Brown",
          student.address,
          "Blockchain Security",
          "CertiChain Academy",
          "bafybeic999"
        )
      ).to.be.revertedWithCustomError(certichain, "AccessControlUnauthorizedAccount");
    });

    it("Should revert if studentName is empty", async function () {
      await expect(
        certichain.connect(issuer).issueCertificate(
          "",
          student.address,
          "Course",
          "Issuer",
          "cid"
        )
      ).to.be.revertedWith("CertiChain: studentName empty");
    });

    it("Should revert if studentAddress is zero address", async function () {
      await expect(
        certichain.connect(issuer).issueCertificate(
          "Student",
          ethers.ZeroAddress,
          "Course",
          "Issuer",
          "cid"
        )
      ).to.be.revertedWith("CertiChain: invalid student address");
    });

    it("Should revert if ipfsCid is empty", async function () {
      await expect(
        certichain.connect(issuer).issueCertificate(
          "Student",
          student.address,
          "Course",
          "Issuer",
          ""
        )
      ).to.be.revertedWith("CertiChain: ipfsCid empty");
    });
  });

  describe("Revoking Certificates", function () {
    beforeEach(async function () {
      await certichain.connect(issuer).issueCertificate(
        "Alice Smith",
        student.address,
        "Web3 Security",
        "CertiChain Academy",
        "cid123"
      );
    });

    it("Should allow issuer to revoke an issued certificate", async function () {
      const certId = "CERT-2026-000001";
      await certichain.connect(issuer).revokeCertificate(certId);

      const cert = await certichain.getCertificate(certId);
      expect(cert.isValid).to.be.false;

      const isValid = await certichain.verifyCertificate(certId);
      expect(isValid).to.be.false;
    });

    it("Should revert when non-issuer tries to revoke", async function () {
      const certId = "CERT-2026-000001";
      await expect(
        certichain.connect(unauthorizedUser).revokeCertificate(certId)
      ).to.be.revertedWithCustomError(certichain, "AccessControlUnauthorizedAccount");
    });

    it("Should revert when revoking a non-existent certificate", async function () {
      await expect(
        certichain.connect(issuer).revokeCertificate("CERT-2026-999999")
      ).to.be.revertedWith("CertiChain: certificate not found");
    });

    it("Should revert when revoking an already revoked certificate", async function () {
      const certId = "CERT-2026-000001";
      await certichain.connect(issuer).revokeCertificate(certId);

      await expect(
        certichain.connect(issuer).revokeCertificate(certId)
      ).to.be.revertedWith("CertiChain: already revoked");
    });
  });
});
