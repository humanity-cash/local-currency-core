import chai from "chai";
import chaiHttp from "chai-http";
import { describe, it, beforeAll, beforeEach, afterAll } from "@jest/globals";
import { getApp } from "../server";
import {
  setupContracts,
  newBusinessData,
  createDummyEvent,
  createFakeUser,
  processDwollaSandboxSimulations,
  createFundingSourceForTest,
} from "./utils";
import { codes } from "../utils/http";
import { log } from "../utils";
import { IAPINewUser } from "../types";
import {
  createSignature,
  getDwollaResourceFromLocation,
} from "../service/digital-banking/DwollaUtils";
import { DwollaEvent } from "../service/digital-banking/DwollaTypes";
import { mockDatabase } from "./setup/setup-db-integration";
import {
  DwollaTransferService,
  AppNotificationService,
} from "src/database/service";

import {
  expectBusiness,
  expectFundingSource,
  expectIDeposit,
  expectITransferEvent,
  expectIWallet,
  expectIWithdrawal,
} from "./expect";
import { getUser } from "src/service/AuthService";

const expect = chai.expect;
chai.use(chaiHttp);
const server = getApp();

describe("Operator endpoints test", () => {
  const user1: IAPINewUser = createFakeUser();
  const user2: IAPINewUser = createFakeUser();
  const business1: IAPINewUser = createFakeUser(true);
  const business2: IAPINewUser = createFakeUser(true);
  const business3: IAPINewUser = createFakeUser(true);
  let dwollaIdUser1: string,
    dwollaIdUser1Business: string,
    dwollaIdUser2: string,
    dwollaIdBusiness1: string,
    dwollaIdBusiness2: string,
    dwollaIdBusiness3: string;

  beforeAll(async () => {
    await mockDatabase.init();
    await setupContracts();
  });

  afterAll(async (): Promise<void> => {
    await mockDatabase.stop();
  });

  describe("POST /users (create user)", () => {
    beforeEach(async (): Promise<void> => {
      if (mockDatabase.isConnectionOpen()) return;
      await mockDatabase.openNewMongooseConnection();
    });

    it("it should create personal user1 and store the returned address, HTTP 201", (done) => {
      chai
        .request(server)
        .post("/users")
        .send(user1)
        .then((res) => {
          expect(res).to.have.status(codes.CREATED);
          expect(res).to.be.json;
          dwollaIdUser1 = res.body.customer.dwollaId;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should post a supported webhook event for user1 and successfully process it, HTTP 202", async (): Promise<void> => {
      const event: DwollaEvent = createDummyEvent(
        "customer_created",
        dwollaIdUser1,
        dwollaIdUser1
      );
      const signature = createSignature(
        process.env.WEBHOOK_SECRET,
        JSON.stringify(event)
      );
      const res = await chai
        .request(server)
        .post("/webhook")
        .set({ "X-Request-Signature-SHA-256": signature })
        .send(event);
      expect(res).to.have.status(codes.ACCEPTED);
      await createFundingSourceForTest(dwollaIdUser1);
      const u = await getUser(dwollaIdUser1);
      expect(u.data.customer.walletAddress).to.exist;

      log(`Test only - created funding source for ${dwollaIdUser1}`);
    });

    it("it should add business verification for user1 ,HTTP 202", async (): Promise<void> => {
      const res1 = await chai
        .request(server)
        .post(`/users/${dwollaIdUser1}/business`)
        .send({
          business: newBusinessData(),
        });
      expect(res1.body.data.business.dwollaId).to.exist;
      dwollaIdUser1Business = res1.body.data.business.dwollaId;
    });

    it("it should post a supported webhook event for user1(business) and successfully process it, HTTP 202", async (): Promise<void> => {
      const event: DwollaEvent = createDummyEvent(
        "customer_created",
        dwollaIdUser1Business,
        dwollaIdUser1Business
      );
      const signature = createSignature(
        process.env.WEBHOOK_SECRET,
        JSON.stringify(event)
      );
      const res = await chai
        .request(server)
        .post("/webhook")
        .set({ "X-Request-Signature-SHA-256": signature })
        .send(event);
      expect(res).to.have.status(codes.ACCEPTED);
      await createFundingSourceForTest(dwollaIdUser1Business);
      const user1Business = await getUser(dwollaIdUser1Business);
      log(`Test only - created funding source for ${dwollaIdUser1Business}`);
      expect(user1Business.data.business.walletAddress).to.exist;
    });

    it("it should create personal user2 and store the returned address, HTTP 201", (done) => {
      chai
        .request(server)
        .post("/users")
        .send(user2)
        .then((res) => {
          expect(res).to.have.status(codes.CREATED);
          expect(res).to.be.json;
          dwollaIdUser2 = res.body.customer.dwollaId;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should post a supported webhook event for user2 and successfully process it, HTTP 202", async (): Promise<void> => {
      const event: DwollaEvent = createDummyEvent(
        "customer_created",
        dwollaIdUser2,
        dwollaIdUser2
      );
      const signature = createSignature(
        process.env.WEBHOOK_SECRET,
        JSON.stringify(event)
      );
      const res = await chai
        .request(server)
        .post("/webhook")
        .set({ "X-Request-Signature-SHA-256": signature })
        .send(event);
      expect(res).to.have.status(codes.ACCEPTED);
      await createFundingSourceForTest(dwollaIdUser2);
      log(`Test only - created funding source for ${dwollaIdUser2}`);
    });

    it("it should create business1 and store the returned address, HTTP 201", (done) => {
      chai
        .request(server)
        .post("/users")
        .send(business1)
        .then((res) => {
          expect(res).to.have.status(codes.CREATED);
          expect(res).to.be.json;
          dwollaIdBusiness1 = res.body.business.dwollaId;
          done();
        })
        .catch((err) => {
          log(JSON.stringify(err, null, 2));

          done(err);
        });
    });

    it("it should post a supported webhook event for business1 and successfully process it, HTTP 202", async (): Promise<void> => {
      const event: DwollaEvent = createDummyEvent(
        "customer_created",
        dwollaIdBusiness1,
        dwollaIdBusiness1
      );
      const signature = createSignature(
        process.env.WEBHOOK_SECRET,
        JSON.stringify(event)
      );
      const res = await chai
        .request(server)
        .post("/webhook")
        .set({ "X-Request-Signature-SHA-256": signature })
        .send(event);
      expect(res).to.have.status(codes.ACCEPTED);
      await createFundingSourceForTest(dwollaIdBusiness1);
      const u = await getUser(dwollaIdBusiness1);
      expect(u.data.business?.walletAddress).to.exist;
      log(`Test only - created funding source for ${dwollaIdBusiness1}`);
    });

    it("it should fail to create user2 twice, HTTP 500", (done) => {
      chai
        .request(server)
        .post("/users")
        .send(user2)
        .then((res) => {
          expect(res).to.have.status(codes.SERVER_ERROR);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should fail to create a new user with invalid body, HTTP 400", (done) => {
      chai
        .request(server)
        .post("/users")
        .send({ test: "junk body" })
        .then((res) => {
          expect(res).to.have.status(codes.BAD_REQUEST);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("POST /users/:userId/deposit (deposit for user)", () => {
    beforeEach(async (): Promise<void> => {
      if (mockDatabase.isConnectionOpen()) return;
      await mockDatabase.openNewMongooseConnection();
    });

    afterEach(async (): Promise<void> => {
      await processDwollaSandboxSimulations();
    });

    it("it should return HTTP 400 with invalid body", (done) => {
      chai
        .request(server)
        .post(`/users/${dwollaIdUser1}/deposit`)
        .send({ banana: "99.99" })
        .then((res) => {
          expect(res).to.have.status(codes.BAD_REQUEST);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should return HTTP 404 with Solidity reversion (user doesn't exist)", (done) => {
      chai
        .request(server)
        // eslint-disable-next-line spellcheck/spell-checker
        .post(`/users/userthatdoesntexist/deposit`)
        .send({ amount: "1.0" })
        .then((res) => {
          expect(res).to.have.status(codes.NOT_FOUND);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should deposit $4.44 to user1, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${dwollaIdUser1}/deposit`)
        .send({ amount: "4.44" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          expectIWallet(res.body);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should deposit $11.11 to user2, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${dwollaIdUser2}/deposit`)
        .send({ amount: "11.11" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          expectIWallet(res.body);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should deposit $22.22 again to user2, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${dwollaIdUser2}/deposit`)
        .send({ amount: "22.22" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          expectIWallet(res.body);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should deposit $33.33 again to user2, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${dwollaIdUser2}/deposit`)
        .send({ amount: "33.33" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          expectIWallet(res.body);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should deposit $999.99 business1, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${dwollaIdBusiness1}/deposit`)
        .send({ amount: "999.99" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          expectIWallet(res.body);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("GET /users/:userId/deposit (get deposits(s) for user)", () => {
    beforeEach(async (): Promise<void> => {
      if (mockDatabase.isConnectionOpen()) return;
      await mockDatabase.openNewMongooseConnection();
    });

    afterEach(async (): Promise<void> => {
      await processDwollaSandboxSimulations();
    });

    it("it should return HTTP 404 with Solidity reversion (user doesn't exist)", (done) => {
      chai
        .request(server)
        .get(`/users/fakeUser123/deposit`)
        .send()
        .then((res) => {
          expect(res).to.have.status(codes.NOT_FOUND);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should process a webhook for a customer_transfer_created event for user1's deposits, HTTP 202", async (): Promise<void> => {
      const deposits: DwollaTransferService.IDwollaTransferDBItem[] = (
        await DwollaTransferService.getByUserId(dwollaIdUser1)
      )?.filter((element) => element.type == "DEPOSIT");
      log(`Deposits for user1 are ${JSON.stringify(deposits, null, 2)}`);

      for (let i = 0; i < deposits?.length; i++) {
        const event: DwollaEvent = createDummyEvent(
          "customer_transfer_created",
          deposits[i].fundingTransferId,
          dwollaIdUser1,
          "transfers"
        );
        const signature = createSignature(
          process.env.WEBHOOK_SECRET,
          JSON.stringify(event)
        );
        const res = await chai
          .request(server)
          .post("/webhook")
          .set({ "X-Request-Signature-SHA-256": signature })
          .send(event);
        expect(res).to.have.status(codes.ACCEPTED);
      }
    });

    it("it should process a webhook for a customer_bank_transfer_created event for user1's deposits, HTTP 202", async (): Promise<void> => {
      const deposits: DwollaTransferService.IDwollaTransferDBItem[] = (
        await DwollaTransferService.getByUserId(dwollaIdUser1)
      )?.filter((element) => element.type == "DEPOSIT");

      log(`Deposits for user1 are ${JSON.stringify(deposits, null, 2)}`);

      for (let i = 0; i < deposits?.length; i++) {
        const fundingTransfer = await getDwollaResourceFromLocation(
          process.env.DWOLLA_BASE_URL +
            "transfers/" +
            deposits[i].fundingTransferId
        );
        log(
          `**** TEST **** customer_bank_transfer_created event for deposit for user ${dwollaIdUser1} with funding transfer ${deposits[i].fundingTransferId}...`
        );

        const fundedTransferLink =
          fundingTransfer?.body?._links["funded-transfer"]?.href;
        log(
          `**** TEST **** customer_bank_transfer_created event for deposit for user ${dwollaIdUser1} with funded transfer ${fundedTransferLink}...`
        );

        const fundedTransfer = await getDwollaResourceFromLocation(
          fundedTransferLink
        );
        log(JSON.stringify(fundedTransfer));

        const event: DwollaEvent = createDummyEvent(
          "customer_bank_transfer_created",
          fundedTransfer.body?.id,
          dwollaIdUser1,
          "transfers"
        );
        const signature = createSignature(
          process.env.WEBHOOK_SECRET,
          JSON.stringify(event)
        );
        const res = await chai
          .request(server)
          .post("/webhook")
          .set({ "X-Request-Signature-SHA-256": signature })
          .send(event);
        expect(res).to.have.status(codes.ACCEPTED);
      }
    });

    it("it should process a webhook for a customer_transfer_completed event for user1's deposits, HTTP 202", async (): Promise<void> => {
      const deposits: DwollaTransferService.IDwollaTransferDBItem[] = (
        await DwollaTransferService.getByUserId(dwollaIdUser1)
      )?.filter((element) => element.type == "DEPOSIT");
      log(`Deposits for user1 are ${JSON.stringify(deposits, null, 2)}`);

      for (let i = 0; i < deposits?.length; i++) {
        const event: DwollaEvent = createDummyEvent(
          "customer_transfer_completed",
          deposits[i].fundingTransferId,
          dwollaIdUser1,
          "transfers"
        );
        const signature = createSignature(
          process.env.WEBHOOK_SECRET,
          JSON.stringify(event)
        );
        const res = await chai
          .request(server)
          .post("/webhook")
          .set({ "X-Request-Signature-SHA-256": signature })
          .send(event);
        expect(res).to.have.status(codes.ACCEPTED);
      }
    });

    it("it should process a webhook for a customer_bank_transfer_completed event for user1's deposits, HTTP 202", async (): Promise<void> => {
      const deposits: DwollaTransferService.IDwollaTransferDBItem[] = (
        await DwollaTransferService.getByUserId(dwollaIdUser1)
      )?.filter((element) => element.type == "DEPOSIT");

      log(`Deposits for user1 are ${JSON.stringify(deposits, null, 2)}`);

      for (let i = 0; i < deposits?.length; i++) {
        const fundingTransfer = await getDwollaResourceFromLocation(
          process.env.DWOLLA_BASE_URL +
            "transfers/" +
            deposits[i].fundingTransferId
        );
        log(
          `**** TEST **** customer_bank_transfer_completed event for deposit for user ${dwollaIdUser1} with funding transfer ${deposits[i].fundingTransferId}...`
        );

        const fundedTransferLink =
          fundingTransfer?.body?._links["funded-transfer"]?.href;
        log(
          `**** TEST **** customer_bank_transfer_completed event for deposit for user ${dwollaIdUser1} with funded transfer ${fundedTransferLink}...`
        );

        const fundedTransfer = await getDwollaResourceFromLocation(
          fundedTransferLink
        );
        log(JSON.stringify(fundedTransfer));

        const event: DwollaEvent = createDummyEvent(
          "customer_bank_transfer_completed",
          fundedTransfer.body?.id,
          dwollaIdUser1,
          "transfers"
        );
        const signature = createSignature(
          process.env.WEBHOOK_SECRET,
          JSON.stringify(event)
        );
        const res = await chai
          .request(server)
          .post("/webhook")
          .set({ "X-Request-Signature-SHA-256": signature })
          .send(event);
        expect(res).to.have.status(codes.ACCEPTED);
      }
    });

    it("it should process a webhook for a customer_transfer_created event for user2's deposits, HTTP 202", async (): Promise<void> => {
      const deposits: DwollaTransferService.IDwollaTransferDBItem[] = (
        await DwollaTransferService.getByUserId(dwollaIdUser2)
      )?.filter((element) => element.type == "DEPOSIT");

      log(`Deposits for user2 are ${JSON.stringify(deposits, null, 2)}`);

      for (let i = 0; i < deposits?.length; i++) {
        const event: DwollaEvent = createDummyEvent(
          "customer_transfer_created",
          deposits[i].fundingTransferId,
          dwollaIdUser2,
          "transfers"
        );
        const signature = createSignature(
          process.env.WEBHOOK_SECRET,
          JSON.stringify(event)
        );
        const res = await chai
          .request(server)
          .post("/webhook")
          .set({ "X-Request-Signature-SHA-256": signature })
          .send(event);
        expect(res).to.have.status(codes.ACCEPTED);
      }
    });

    it("it should process a webhook for a customer_bank_transfer_created event for user2's deposits, HTTP 202", async (): Promise<void> => {
      const deposits: DwollaTransferService.IDwollaTransferDBItem[] = (
        await DwollaTransferService.getByUserId(dwollaIdUser2)
      )?.filter((element) => element.type == "DEPOSIT");
      log(`Deposits for user2 are ${JSON.stringify(deposits, null, 2)}`);

      for (let i = 0; i < deposits?.length; i++) {
        const fundingTransfer = await getDwollaResourceFromLocation(
          process.env.DWOLLA_BASE_URL +
            "transfers/" +
            deposits[i].fundingTransferId
        );
        log(
          `**** TEST **** customer_bank_transfer_created event for deposit for user ${dwollaIdUser2} with funding transfer ${deposits[i].fundingTransferId}...`
        );

        const fundedTransferLink =
          fundingTransfer?.body?._links["funded-transfer"]?.href;
        log(
          `**** TEST **** customer_bank_transfer_created event for deposit for user ${dwollaIdUser2} with funded transfer ${fundedTransferLink}...`
        );

        const fundedTransfer = await getDwollaResourceFromLocation(
          fundedTransferLink
        );

        const event: DwollaEvent = createDummyEvent(
          "customer_bank_transfer_created",
          fundedTransfer.body?.id,
          dwollaIdUser2,
          "transfers"
        );
        const signature = createSignature(
          process.env.WEBHOOK_SECRET,
          JSON.stringify(event)
        );
        const res = await chai
          .request(server)
          .post("/webhook")
          .set({ "X-Request-Signature-SHA-256": signature })
          .send(event);
        expect(res).to.have.status(codes.ACCEPTED);
      }
    });

    it("it should process a webhook for a customer_transfer_completed event for user2's deposits, HTTP 202", async (): Promise<void> => {
      const deposits: DwollaTransferService.IDwollaTransferDBItem[] = (
        await DwollaTransferService.getByUserId(dwollaIdUser2)
      )?.filter((element) => element.type == "DEPOSIT");

      log(`Deposits for user2 are ${JSON.stringify(deposits, null, 2)}`);

      for (let i = 0; i < deposits?.length; i++) {
        const event: DwollaEvent = createDummyEvent(
          "customer_transfer_completed",
          deposits[i].fundingTransferId,
          dwollaIdUser2,
          "transfers"
        );
        const signature = createSignature(
          process.env.WEBHOOK_SECRET,
          JSON.stringify(event)
        );
        const res = await chai
          .request(server)
          .post("/webhook")
          .set({ "X-Request-Signature-SHA-256": signature })
          .send(event);
        expect(res).to.have.status(codes.ACCEPTED);
      }
    });

    it("it should process a webhook for a customer_bank_transfer_completed event for user2's deposits, HTTP 202", async (): Promise<void> => {
      const deposits: DwollaTransferService.IDwollaTransferDBItem[] = (
        await DwollaTransferService.getByUserId(dwollaIdUser2)
      )?.filter((element) => element.type == "DEPOSIT");
      log(`Deposits for user2 are ${JSON.stringify(deposits, null, 2)}`);

      for (let i = 0; i < deposits?.length; i++) {
        const fundingTransfer = await getDwollaResourceFromLocation(
          process.env.DWOLLA_BASE_URL +
            "transfers/" +
            deposits[i].fundingTransferId
        );
        log(
          `**** TEST **** customer_bank_transfer_completed event for deposit for user ${dwollaIdUser2} with funding transfer ${deposits[i].fundingTransferId}...`
        );

        const fundedTransferLink =
          fundingTransfer?.body?._links["funded-transfer"]?.href;
        log(
          `**** TEST **** customer_bank_transfer_completed event for deposit for user ${dwollaIdUser2} with funded transfer ${fundedTransferLink}...`
        );

        const fundedTransfer = await getDwollaResourceFromLocation(
          fundedTransferLink
        );

        const event: DwollaEvent = createDummyEvent(
          "customer_bank_transfer_completed",
          fundedTransfer.body?.id,
          dwollaIdUser2,
          "transfers"
        );
        const signature = createSignature(
          process.env.WEBHOOK_SECRET,
          JSON.stringify(event)
        );
        const res = await chai
          .request(server)
          .post("/webhook")
          .set({ "X-Request-Signature-SHA-256": signature })
          .send(event);
        expect(res).to.have.status(codes.ACCEPTED);
      }
    });

    it("it should process a webhook for a customer_transfer_created event for business1's deposits, HTTP 202", async (): Promise<void> => {
      const deposits: DwollaTransferService.IDwollaTransferDBItem[] = (
        await DwollaTransferService.getByUserId(dwollaIdBusiness1)
      )?.filter((element) => element.type == "DEPOSIT");

      log(`Deposits for business1 are ${JSON.stringify(deposits, null, 2)}`);

      for (let i = 0; i < deposits?.length; i++) {
        const event: DwollaEvent = createDummyEvent(
          "customer_transfer_created",
          deposits[i].fundingTransferId,
          dwollaIdBusiness1,
          "transfers"
        );
        const signature = createSignature(
          process.env.WEBHOOK_SECRET,
          JSON.stringify(event)
        );
        const res = await chai
          .request(server)
          .post("/webhook")
          .set({ "X-Request-Signature-SHA-256": signature })
          .send(event);
        expect(res).to.have.status(codes.ACCEPTED);
      }
    });

    it("it should process a webhook for a customer_bank_transfer_created event for business1's deposits, HTTP 202", async (): Promise<void> => {
      const deposits: DwollaTransferService.IDwollaTransferDBItem[] = (
        await DwollaTransferService.getByUserId(dwollaIdBusiness1)
      )?.filter((element) => element.type == "DEPOSIT");
      log(`Deposits for business1 are ${JSON.stringify(deposits, null, 2)}`);

      for (let i = 0; i < deposits?.length; i++) {
        const fundingTransfer = await getDwollaResourceFromLocation(
          process.env.DWOLLA_BASE_URL +
            "transfers/" +
            deposits[i].fundingTransferId
        );
        log(
          `**** TEST **** customer_bank_transfer_created event for deposit for user ${dwollaIdBusiness1} with funding transfer ${deposits[i].fundingTransferId}...`
        );

        const fundedTransferLink =
          fundingTransfer?.body?._links["funded-transfer"]?.href;
        log(
          `**** TEST **** customer_bank_transfer_created event for deposit for user ${dwollaIdBusiness1} with funded transfer ${fundedTransferLink}...`
        );

        const fundedTransfer = await getDwollaResourceFromLocation(
          fundedTransferLink
        );

        const event: DwollaEvent = createDummyEvent(
          "customer_bank_transfer_created",
          fundedTransfer.body?.id,
          dwollaIdBusiness1,
          "transfers"
        );
        const signature = createSignature(
          process.env.WEBHOOK_SECRET,
          JSON.stringify(event)
        );
        const res = await chai
          .request(server)
          .post("/webhook")
          .set({ "X-Request-Signature-SHA-256": signature })
          .send(event);
        expect(res).to.have.status(codes.ACCEPTED);
      }
    });

    it("it should process a webhook for a customer_transfer_completed event for business1's deposits, HTTP 202", async (): Promise<void> => {
      const deposits: DwollaTransferService.IDwollaTransferDBItem[] = (
        await DwollaTransferService.getByUserId(dwollaIdBusiness1)
      )?.filter((element) => element.type == "DEPOSIT");

      log(`Deposits for business1 are ${JSON.stringify(deposits, null, 2)}`);

      for (let i = 0; i < deposits?.length; i++) {
        const event: DwollaEvent = createDummyEvent(
          "customer_transfer_completed",
          deposits[i].fundingTransferId,
          dwollaIdBusiness1,
          "transfers"
        );
        const signature = createSignature(
          process.env.WEBHOOK_SECRET,
          JSON.stringify(event)
        );
        const res = await chai
          .request(server)
          .post("/webhook")
          .set({ "X-Request-Signature-SHA-256": signature })
          .send(event);
        expect(res).to.have.status(codes.ACCEPTED);
      }
    });

    it("it should process a webhook for a customer_bank_transfer_completed event for business1's deposits, HTTP 202", async (): Promise<void> => {
      const deposits: DwollaTransferService.IDwollaTransferDBItem[] = (
        await DwollaTransferService.getByUserId(dwollaIdBusiness1)
      )?.filter((element) => element.type == "DEPOSIT");
      log(`Deposits for business1 are ${JSON.stringify(deposits, null, 2)}`);

      for (let i = 0; i < deposits?.length; i++) {
        const fundingTransfer = await getDwollaResourceFromLocation(
          process.env.DWOLLA_BASE_URL +
            "transfers/" +
            deposits[i].fundingTransferId
        );
        log(
          `**** TEST **** customer_bank_transfer_completed event for deposit for user ${dwollaIdBusiness1} with funding transfer ${deposits[i].fundingTransferId}...`
        );

        const fundedTransferLink =
          fundingTransfer?.body?._links["funded-transfer"]?.href;
        log(
          `**** TEST **** customer_bank_transfer_completed event for deposit for user ${dwollaIdBusiness1} with funded transfer ${fundedTransferLink}...`
        );

        const fundedTransfer = await getDwollaResourceFromLocation(
          fundedTransferLink
        );

        const event: DwollaEvent = createDummyEvent(
          "customer_bank_transfer_completed",
          fundedTransfer.body?.id,
          dwollaIdBusiness1,
          "transfers"
        );
        const signature = createSignature(
          process.env.WEBHOOK_SECRET,
          JSON.stringify(event)
        );
        const res = await chai
          .request(server)
          .post("/webhook")
          .set({ "X-Request-Signature-SHA-256": signature })
          .send(event);
        expect(res).to.have.status(codes.ACCEPTED);
      }
    });

    it("it should return 1 deposit for user1, HTTP 200", (done) => {
      chai
        .request(server)
        .get(`/users/${dwollaIdUser1}/deposit`)
        .send()
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          expect(res.body.length).to.equal(1);
          expectIDeposit(res.body[0]);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should return 3 deposits for user2, HTTP 200", (done) => {
      chai
        .request(server)
        .get(`/users/${dwollaIdUser2}/deposit`)
        .send()
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          expect(res.body.length).to.equal(3);
          for (let i = 0; i < res.body.length; i++) {
            expectIDeposit(res.body[i]);
          }
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("POST /users/:userId/withdraw (withdraw for user)", () => {
    beforeEach(async (): Promise<void> => {
      if (mockDatabase.isConnectionOpen()) return;
      await mockDatabase.openNewMongooseConnection();
    });

    afterEach(async (): Promise<void> => {
      await processDwollaSandboxSimulations();
    });

    it("it should return HTTP 400 with invalid body", (done) => {
      chai
        .request(server)
        .post(`/users/${dwollaIdUser1}/withdraw`)
        .send({ banana: "99.99" })
        .then((res) => {
          expect(res).to.have.status(codes.BAD_REQUEST);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should return HTTP 422 (negative withdrawal)", (done) => {
      chai
        .request(server)
        .post(`/users/${dwollaIdUser1}/withdraw`)
        .send({ amount: "-1.0" })
        .then((res) => {
          expect(res).to.have.status(codes.UNPROCESSABLE);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should return HTTP 422 (zero value withdrawal)", (done) => {
      chai
        .request(server)
        .post(`/users/${dwollaIdUser1}/withdraw`)
        .send({ amount: "0" })
        .then((res) => {
          expect(res).to.have.status(codes.UNPROCESSABLE);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should fail to withdraw from user2 because their balance is above $5.00, HTTP 422", (done) => {
      chai
        .request(server)
        .post(`/users/${dwollaIdUser2}/withdraw`)
        .send({ amount: "1.11" })
        .then((res) => {
          expect(res).to.have.status(codes.UNPROCESSABLE);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should withdraw from user1 for $3.33, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${dwollaIdUser1}/withdraw`)
        .send({ amount: "3.33" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          expectIWallet(res.body);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should withdraw again from user1 for $1.11, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${dwollaIdUser1}/withdraw`)
        .send({ amount: "1.11" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          expectIWallet(res.body);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should withdraw from business1 for $888.88, even though their balance is above the threshold, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${dwollaIdBusiness1}/withdraw`)
        .send({ amount: "888.88" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          expectIWallet(res.body);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should process a webhook for a customer_transfer_created event for user1's withdrawals, HTTP 202", async (): Promise<void> => {
      const withdrawals: DwollaTransferService.IDwollaTransferDBItem[] = (
        await DwollaTransferService.getByUserId(dwollaIdUser1)
      )?.filter((element) => element.type == "WITHDRAWAL");
      log(`Withdrawals for user1 are ${JSON.stringify(withdrawals, null, 2)}`);

      for (let i = 0; i < withdrawals?.length; i++) {
        const event: DwollaEvent = createDummyEvent(
          "customer_transfer_created",
          withdrawals[i].fundedTransferId,
          dwollaIdUser1,
          "transfers"
        );
        const signature = createSignature(
          process.env.WEBHOOK_SECRET,
          JSON.stringify(event)
        );
        chai
          .request(server)
          .post("/webhook")
          .set({ "X-Request-Signature-SHA-256": signature })
          .send(event)
          .then((res) => {
            expect(res).to.have.status(codes.ACCEPTED);
          });
      }
    });

    it("it should process a webhook for a customer_bank_transfer_created event for user1's withdrawals, HTTP 202", async (): Promise<void> => {
      const withdrawals: DwollaTransferService.IDwollaTransferDBItem[] = (
        await DwollaTransferService.getByUserId(dwollaIdUser1)
      )?.filter((element) => element.type == "WITHDRAWAL");
      log(`Withdrawals for user1 are ${JSON.stringify(withdrawals, null, 2)}`);

      for (let i = 0; i < withdrawals?.length; i++) {
        const fundedTransfer = await getDwollaResourceFromLocation(
          process.env.DWOLLA_BASE_URL +
            "transfers/" +
            withdrawals[i].fundedTransferId
        );
        log(
          `**** TEST **** customer_bank_transfer_created event for withdrawal for user ${dwollaIdUser1} with funding transfer ${withdrawals[i].fundedTransferId}...`
        );

        const fundingTransferLink =
          fundedTransfer?.body?._links["funding-transfer"]?.href;
        log(
          `**** TEST **** customer_bank_transfer_created event for withdrawal for user ${dwollaIdUser1} with funded transfer ${fundingTransferLink}...`
        );

        const fundingTransfer = await getDwollaResourceFromLocation(
          fundingTransferLink
        );

        const event: DwollaEvent = createDummyEvent(
          "customer_bank_transfer_created",
          fundingTransfer.body?.id,
          dwollaIdUser1,
          "transfers"
        );
        const signature = createSignature(
          process.env.WEBHOOK_SECRET,
          JSON.stringify(event)
        );
        const res = await chai
          .request(server)
          .post("/webhook")
          .set({ "X-Request-Signature-SHA-256": signature })
          .send(event);
        expect(res).to.have.status(codes.ACCEPTED);
      }
    });

    it("it should process a webhook for a customer_transfer_completed event for user1's withdrawals, HTTP 202", async (): Promise<void> => {
      const withdrawals: DwollaTransferService.IDwollaTransferDBItem[] = (
        await DwollaTransferService.getByUserId(dwollaIdUser1)
      )?.filter((element) => element.type == "WITHDRAWAL");
      log(`Withdrawals for user1 are ${JSON.stringify(withdrawals, null, 2)}`);

      for (let i = 0; i < withdrawals?.length; i++) {
        const event: DwollaEvent = createDummyEvent(
          "customer_transfer_completed",
          withdrawals[i].fundedTransferId,
          dwollaIdUser1,
          "transfers"
        );
        const signature = createSignature(
          process.env.WEBHOOK_SECRET,
          JSON.stringify(event)
        );
        chai
          .request(server)
          .post("/webhook")
          .set({ "X-Request-Signature-SHA-256": signature })
          .send(event)
          .then((res) => {
            expect(res).to.have.status(codes.ACCEPTED);
          });
      }
    });

    it("it should process a webhook for a customer_bank_transfer_created event for user1's withdrawals, HTTP 202", async (): Promise<void> => {
      const withdrawals: DwollaTransferService.IDwollaTransferDBItem[] = (
        await DwollaTransferService.getByUserId(dwollaIdUser1)
      )?.filter((element) => element.type == "WITHDRAWAL");
      log(`Withdrawals for user1 are ${JSON.stringify(withdrawals, null, 2)}`);

      for (let i = 0; i < withdrawals?.length; i++) {
        const fundedTransfer = await getDwollaResourceFromLocation(
          process.env.DWOLLA_BASE_URL +
            "transfers/" +
            withdrawals[i].fundedTransferId
        );
        log(
          `**** TEST **** customer_bank_transfer_completed event for withdrawal for user ${dwollaIdUser1} with funded transfer ${withdrawals[i].fundedTransferId}...`
        );

        const fundingTransferLink =
          fundedTransfer?.body?._links["funding-transfer"]?.href;
        log(
          `**** TEST **** customer_bank_transfer_completed event for withdrawal for user ${dwollaIdUser1} with funding transfer ${fundingTransferLink}...`
        );

        const fundingTransfer = await getDwollaResourceFromLocation(
          fundingTransferLink
        );

        const event: DwollaEvent = createDummyEvent(
          "customer_bank_transfer_completed",
          fundingTransfer.body?.id,
          dwollaIdUser1,
          "transfers"
        );
        const signature = createSignature(
          process.env.WEBHOOK_SECRET,
          JSON.stringify(event)
        );
        const res = await chai
          .request(server)
          .post("/webhook")
          .set({ "X-Request-Signature-SHA-256": signature })
          .send(event);
        expect(res).to.have.status(codes.ACCEPTED);
      }
    });

    it("it should process a webhook for a customer_transfer_created event for user2's withdrawals, HTTP 202", async (): Promise<void> => {
      const withdrawals: DwollaTransferService.IDwollaTransferDBItem[] = (
        await DwollaTransferService.getByUserId(dwollaIdUser2)
      )?.filter((element) => element.type == "WITHDRAWAL");
      log(`Withdrawals for user2 are ${JSON.stringify(withdrawals, null, 2)}`);

      for (let i = 0; i < withdrawals?.length; i++) {
        const event: DwollaEvent = createDummyEvent(
          "customer_transfer_created",
          withdrawals[i].fundedTransferId,
          dwollaIdUser2,
          "transfers"
        );
        const signature = createSignature(
          process.env.WEBHOOK_SECRET,
          JSON.stringify(event)
        );
        chai
          .request(server)
          .post("/webhook")
          .set({ "X-Request-Signature-SHA-256": signature })
          .send(event)
          .then((res) => {
            expect(res).to.have.status(codes.ACCEPTED);
          });
      }
    });

    it("it should process a webhook for a customer_bank_transfer_created event for user2's withdrawals, HTTP 202", async (): Promise<void> => {
      const withdrawals: DwollaTransferService.IDwollaTransferDBItem[] = (
        await DwollaTransferService.getByUserId(dwollaIdUser2)
      )?.filter((element) => element.type == "WITHDRAWAL");
      log(`Withdrawals for user2 are ${JSON.stringify(withdrawals, null, 2)}`);

      for (let i = 0; i < withdrawals?.length; i++) {
        const fundedTransfer = await getDwollaResourceFromLocation(
          process.env.DWOLLA_BASE_URL +
            "transfers/" +
            withdrawals[i].fundedTransferId
        );
        log(
          `**** TEST **** customer_bank_transfer_created event for deposit for user ${dwollaIdUser2} with funding transfer ${withdrawals[i].fundedTransferId}...`
        );

        const fundingTransferLink =
          fundedTransfer?.body?._links["funding-transfer"]?.href;
        log(
          `**** TEST **** customer_bank_transfer_created event for deposit for user ${dwollaIdUser2} with funded transfer ${fundingTransferLink}...`
        );

        const fundingTransfer = await getDwollaResourceFromLocation(
          fundingTransferLink
        );

        const event: DwollaEvent = createDummyEvent(
          "customer_bank_transfer_created",
          fundingTransfer.body?.id,
          dwollaIdUser2,
          "transfers"
        );
        const signature = createSignature(
          process.env.WEBHOOK_SECRET,
          JSON.stringify(event)
        );
        const res = await chai
          .request(server)
          .post("/webhook")
          .set({ "X-Request-Signature-SHA-256": signature })
          .send(event);
        expect(res).to.have.status(codes.ACCEPTED);
      }
    });

    it("it should process a webhook for a customer_transfer_completed event for user2's withdrawals, HTTP 202", async (): Promise<void> => {
      const withdrawals: DwollaTransferService.IDwollaTransferDBItem[] = (
        await DwollaTransferService.getByUserId(dwollaIdUser2)
      )?.filter((element) => element.type == "WITHDRAWAL");
      log(`Withdrawals for user2 are ${JSON.stringify(withdrawals, null, 2)}`);

      for (let i = 0; i < withdrawals?.length; i++) {
        const event: DwollaEvent = createDummyEvent(
          "customer_transfer_completed",
          withdrawals[i].fundedTransferId,
          dwollaIdUser2,
          "transfers"
        );
        const signature = createSignature(
          process.env.WEBHOOK_SECRET,
          JSON.stringify(event)
        );
        chai
          .request(server)
          .post("/webhook")
          .set({ "X-Request-Signature-SHA-256": signature })
          .send(event)
          .then((res) => {
            expect(res).to.have.status(codes.ACCEPTED);
          });
      }
    });

    it("it should process a webhook for a customer_bank_transfer_completed event for user2's deposits, HTTP 202", async (): Promise<void> => {
      const deposits: DwollaTransferService.IDwollaTransferDBItem[] = (
        await DwollaTransferService.getByUserId(dwollaIdUser2)
      )?.filter((element) => element.type == "WITHDRAWAL");
      log(`Withdrawals for user2 are ${JSON.stringify(deposits, null, 2)}`);

      for (let i = 0; i < deposits?.length; i++) {
        const fundedTransfer = await getDwollaResourceFromLocation(
          process.env.DWOLLA_BASE_URL +
            "transfers/" +
            deposits[i].fundedTransferId
        );
        log(
          `**** TEST **** customer_bank_transfer_completed event for deposit for user ${dwollaIdUser2} with funding transfer ${deposits[i].fundedTransferId}...`
        );

        const fundingTransferLink =
          fundedTransfer?.body?._links["funding-transfer"]?.href;
        log(
          `**** TEST **** customer_bank_transfer_completed event for deposit for user ${dwollaIdUser2} with funding transfer ${fundingTransferLink}...`
        );

        const fundingTransfer = await getDwollaResourceFromLocation(
          fundingTransferLink
        );

        const event: DwollaEvent = createDummyEvent(
          "customer_bank_transfer_completed",
          fundingTransfer.body?.id,
          dwollaIdUser2,
          "transfers"
        );
        const signature = createSignature(
          process.env.WEBHOOK_SECRET,
          JSON.stringify(event)
        );
        const res = await chai
          .request(server)
          .post("/webhook")
          .set({ "X-Request-Signature-SHA-256": signature })
          .send(event);
        expect(res).to.have.status(codes.ACCEPTED);
      }
    });

    it("it should process a webhook for a customer_transfer_created event for business1's withdrawals, HTTP 202", async (): Promise<void> => {
      const withdrawals: DwollaTransferService.IDwollaTransferDBItem[] = (
        await DwollaTransferService.getByUserId(dwollaIdBusiness1)
      )?.filter((element) => element.type == "WITHDRAWAL");
      log(
        `Withdrawals for business1 are ${JSON.stringify(withdrawals, null, 2)}`
      );

      for (let i = 0; i < withdrawals?.length; i++) {
        const event: DwollaEvent = createDummyEvent(
          "customer_transfer_created",
          withdrawals[i].fundedTransferId,
          dwollaIdBusiness1,
          "transfers"
        );
        const signature = createSignature(
          process.env.WEBHOOK_SECRET,
          JSON.stringify(event)
        );
        chai
          .request(server)
          .post("/webhook")
          .set({ "X-Request-Signature-SHA-256": signature })
          .send(event)
          .then((res) => {
            expect(res).to.have.status(codes.ACCEPTED);
          });
      }
    });

    it("it should process a webhook for a customer_bank_transfer_created event for business1's withdrawals, HTTP 202", async (): Promise<void> => {
      const withdrawals: DwollaTransferService.IDwollaTransferDBItem[] = (
        await DwollaTransferService.getByUserId(dwollaIdBusiness1)
      )?.filter((element) => element.type == "WITHDRAWAL");
      log(
        `Withdrawals for business1 are ${JSON.stringify(withdrawals, null, 2)}`
      );

      for (let i = 0; i < withdrawals?.length; i++) {
        const fundedTransfer = await getDwollaResourceFromLocation(
          process.env.DWOLLA_BASE_URL +
            "transfers/" +
            withdrawals[i].fundedTransferId
        );
        log(
          `**** TEST **** customer_bank_transfer_created event for withdrawal for user ${dwollaIdBusiness1} with funded transfer ${withdrawals[i].fundedTransferId}...`
        );

        const fundingTransferLink =
          fundedTransfer?.body?._links["funding-transfer"]?.href;
        log(
          `**** TEST **** customer_bank_transfer_created event for withdrawal for user ${dwollaIdBusiness1} with funding transfer ${fundingTransferLink}...`
        );

        const fundingTransfer = await getDwollaResourceFromLocation(
          fundingTransferLink
        );

        const event: DwollaEvent = createDummyEvent(
          "customer_bank_transfer_created",
          fundingTransfer.body?.id,
          dwollaIdBusiness1,
          "transfers"
        );
        const signature = createSignature(
          process.env.WEBHOOK_SECRET,
          JSON.stringify(event)
        );
        const res = await chai
          .request(server)
          .post("/webhook")
          .set({ "X-Request-Signature-SHA-256": signature })
          .send(event);
        expect(res).to.have.status(codes.ACCEPTED);
      }
    });

    it("it should process a webhook for a customer_transfer_completed event for business1's withdrawals, HTTP 202", async (): Promise<void> => {
      const withdrawals: DwollaTransferService.IDwollaTransferDBItem[] = (
        await DwollaTransferService.getByUserId(dwollaIdBusiness1)
      )?.filter((element) => element.type == "WITHDRAWAL");
      log(
        `Withdrawals for business1 are ${JSON.stringify(withdrawals, null, 2)}`
      );

      for (let i = 0; i < withdrawals?.length; i++) {
        const event: DwollaEvent = createDummyEvent(
          "customer_transfer_completed",
          withdrawals[i].fundedTransferId,
          dwollaIdBusiness1,
          "transfers"
        );
        const signature = createSignature(
          process.env.WEBHOOK_SECRET,
          JSON.stringify(event)
        );
        chai
          .request(server)
          .post("/webhook")
          .set({ "X-Request-Signature-SHA-256": signature })
          .send(event)
          .then((res) => {
            expect(res).to.have.status(codes.ACCEPTED);
          });
      }
    });

    it("it should process a webhook for a customer_bank_transfer_completed event for business1's withdrawals, HTTP 202", async (): Promise<void> => {
      const withdrawals: DwollaTransferService.IDwollaTransferDBItem[] = (
        await DwollaTransferService.getByUserId(dwollaIdBusiness1)
      )?.filter((element) => element.type == "WITHDRAWAL");
      log(
        `Withdrawals for business1 are ${JSON.stringify(withdrawals, null, 2)}`
      );

      for (let i = 0; i < withdrawals?.length; i++) {
        const fundedTransfer = await getDwollaResourceFromLocation(
          process.env.DWOLLA_BASE_URL +
            "transfers/" +
            withdrawals[i].fundedTransferId
        );
        log(
          `**** TEST **** customer_bank_transfer_completed event for withdrawal for user ${dwollaIdBusiness1} with funded transfer ${withdrawals[i].fundedTransferId}...`
        );

        const fundingTransferLink =
          fundedTransfer?.body?._links["funding-transfer"]?.href;
        log(
          `**** TEST **** customer_bank_transfer_completed event for withdrawal for user ${dwollaIdBusiness1} with funding transfer ${fundingTransferLink}...`
        );

        const fundingTransfer = await getDwollaResourceFromLocation(
          fundingTransferLink
        );

        const event: DwollaEvent = createDummyEvent(
          "customer_bank_transfer_completed",
          fundingTransfer.body?.id,
          dwollaIdBusiness1,
          "transfers"
        );
        const signature = createSignature(
          process.env.WEBHOOK_SECRET,
          JSON.stringify(event)
        );
        const res = await chai
          .request(server)
          .post("/webhook")
          .set({ "X-Request-Signature-SHA-256": signature })
          .send(event);
        expect(res).to.have.status(codes.ACCEPTED);
      }
    });
  });

  describe("GET /users/:userId/withdraw (get withdrawal(s) for user)", () => {
    beforeEach(async (): Promise<void> => {
      if (mockDatabase.isConnectionOpen()) return;
      await mockDatabase.openNewMongooseConnection();
    });

    afterEach(async (): Promise<void> => {
      await processDwollaSandboxSimulations();
    });

    it("it should return HTTP 422 with Solidity reversion (user doesn't exist)", (done) => {
      chai
        .request(server)
        .get(`/users/fakeUser123/withdraw`)
        .send()
        .then((res) => {
          expect(res).to.have.status(codes.NOT_FOUND);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should return 2 withdrawals for user1, HTTP 200", (done) => {
      chai
        .request(server)
        .get(`/users/${dwollaIdUser1}/withdraw`)
        .send()
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          expect(res.body.length).to.equal(2);
          for (let i = 0; i < res.body.length; i++) {
            expectIWithdrawal(res.body[i]);
          }
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should return 0 withdrawals for user2, HTTP 204", (done) => {
      chai
        .request(server)
        .get(`/users/${dwollaIdUser2}/withdraw`)
        .send()
        .then((res) => {
          expect(res).to.have.status(codes.NO_CONTENT);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("POST /users/:userId/transfer (make a payment for user)", () => {
    beforeEach(async (): Promise<void> => {
      if (mockDatabase.isConnectionOpen()) return;
      await mockDatabase.openNewMongooseConnection();
    });

    afterEach(async (): Promise<void> => {
      await processDwollaSandboxSimulations();
    });

    it("it should return HTTP 400 with invalid body", (done) => {
      chai
        .request(server)
        .post(`/users/${dwollaIdUser1}/transfer`)
        .send({ test: "junk body", amount: "1.11" })
        .then((res) => {
          expect(res).to.have.status(codes.BAD_REQUEST);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should return HTTP 422 with Solidity reversion (negative transfer)", (done) => {
      chai
        .request(server)
        .post(`/users/${dwollaIdUser1}/transfer`)
        .send({ toUserId: dwollaIdUser2, amount: "-1.11" })
        .then((res) => {
          expect(res).to.have.status(codes.UNPROCESSABLE);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should return HTTP 422 with Solidity reversion (zero value transfer)", (done) => {
      chai
        .request(server)
        .post(`/users/${dwollaIdUser1}/transfer`)
        .send({ toUserId: dwollaIdUser2, amount: "0" })
        .then((res) => {
          expect(res).to.have.status(codes.UNPROCESSABLE);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should transfer 12.34 from user2 to user1 (no round up), HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${dwollaIdUser2}/transfer`)
        .send({ toUserId: dwollaIdUser1, amount: "12.34" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          expectIWallet(res.body);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should transfer 5.67 from user2 to user1 (no round up), HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${dwollaIdUser2}/transfer`)
        .send({ toUserId: dwollaIdUser1, amount: "5.67" })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          expectIWallet(res.body);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should transfer 5.89 from user1 to user2, with 0.11 round up, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${dwollaIdUser1}/transfer`)
        .send({
          toUserId: dwollaIdUser2,
          amount: "5.89",
          roundUpAmount: "0.11",
        })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          expectIWallet(res.body);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should transfer 12.12 from user2 to user1 with 0.88 round up, HTTP 202", (done) => {
      chai
        .request(server)
        .post(`/users/${dwollaIdUser2}/transfer`)
        .send({
          toUserId: dwollaIdUser1,
          amount: "12.12",
          roundUpAmount: "0.88",
        })
        .then((res) => {
          expect(res).to.have.status(codes.ACCEPTED);
          expect(res).to.be.json;
          expectIWallet(res.body);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should fail to transfer a very large amount from user1 to user2, HTTP 422", (done) => {
      chai
        .request(server)
        .post(`/users/${dwollaIdUser1}/transfer`)
        .send({ toUserId: dwollaIdUser2, amount: "99999999999999999" })
        .then((res) => {
          expect(res).to.have.status(codes.UNPROCESSABLE);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("GET /users/:userId/transfer (get transfer(s) for user(s))", () => {
    beforeEach(async (): Promise<void> => {
      if (mockDatabase.isConnectionOpen()) return;
      await mockDatabase.openNewMongooseConnection();
    });

    afterEach(async (): Promise<void> => {
      await processDwollaSandboxSimulations();
    });

    it("it should get 5 transfer for user1 (including 1 round-ups), HTTP 200", (done) => {
      chai
        .request(server)
        .get(`/users/${dwollaIdUser1}/transfer`)
        .send()
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          log(res.body);
          expect(res.body.length).to.equal(5);
          for (let i = 0; i < res.body.length; i++) {
            expectITransferEvent(res.body[i]);
          }
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should get 5 transfer for user2 (including 1 round-ups), HTTP 200", (done) => {
      chai
        .request(server)
        .get(`/users/${dwollaIdUser2}/transfer`)
        .send()
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          log(res.body);
          expect(res.body.length).to.equal(5);
          for (let i = 0; i < res.body.length; i++) {
            expectITransferEvent(res.body[i]);
          }
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("GET /users (get user(s))", () => {
    beforeEach(async (): Promise<void> => {
      if (mockDatabase.isConnectionOpen()) return;
      await mockDatabase.openNewMongooseConnection();
    });

    it("it should get user1", (done) => {
      chai
        .request(server)
        .get(`/users/${dwollaIdUser1}`)
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          expect(res.body.length).to.equal(1);
          expectIWallet(res.body[0]);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should get Dwolla iav-token for user1", (done) => {
      chai
        .request(server)
        .post(`/users/${dwollaIdUser1}/iav-token`)
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          expect(res.body).to.have.property("iavToken");
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should get Dwolla funding sources for user1 (1 result)", (done) => {
      chai
        .request(server)
        .get(`/users/${dwollaIdUser1}/funding-sources`)
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          expectFundingSource(res.body);
          expect(res.body.status).to.equal(codes.OK);
          expect(res.body.body._embedded["funding-sources"]).to.have.length(1);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should fail to get funding sources for an unknown user, HTTP 404", (done) => {
      chai
        .request(server)
        .get(`/users/banana1/funding-sources`)
        .then((res) => {
          expect(res).to.have.status(codes.NOT_FOUND);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should get user2, HTTP 200", (done) => {
      chai
        .request(server)
        .get(`/users/${dwollaIdUser2}`)
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          expect(res.body.length).to.equal(1);
          expectIWallet(res.body[0]);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should get Dwolla iav-token for user2", (done) => {
      chai
        .request(server)
        .post(`/users/${dwollaIdUser2}/iav-token`)
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          expect(res.body).to.have.property("iavToken");
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should fail to get an IAV token for an unknown user, HTTP 404", (done) => {
      chai
        .request(server)
        .post(`/users/banana1/iav-token`)
        .then((res) => {
          expect(res).to.have.status(codes.NOT_FOUND);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should get Dwolla funding sources for user2 (1 result)", (done) => {
      chai
        .request(server)
        .get(`/users/${dwollaIdUser2}/funding-sources`)
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          expectFundingSource(res.body);
          expect(res.body.status).to.equal(codes.OK);
          expect(res.body.body._embedded["funding-sources"]).to.have.length(1);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should fail to get an unknown user, HTTP 404", (done) => {
      chai
        .request(server)
        .get(`/users/banana1`)
        .then((res) => {
          expect(res).to.have.status(codes.NOT_FOUND);
          expect(res).to.be.json;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("it should get all users, HTTP 200", (done) => {
      chai
        .request(server)
        .get("/users")
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res).to.be.json;
          for (let i = 0; i < res.body.length; i++) {
            expectIWallet(res.body[i]);
          }
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("GET /stats", () => {
    beforeEach(async (): Promise<void> => {
      if (mockDatabase.isConnectionOpen()) return;
      await mockDatabase.openNewMongooseConnection();
    });

    it("GET /stats/deposit: it should retrieve all deposits, HTTP 200", (done) => {
      chai
        .request(server)
        .get("/stats/deposit")
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          log(JSON.parse(res.text));
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("GET /stats/withdrawal: it should retrieve all withdrawals, HTTP 200", (done) => {
      chai
        .request(server)
        .get("/stats/withdrawal")
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          log(JSON.parse(res.text));
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("GET /stats/operator: it should retrieve operator statistics, HTTP 200", (done) => {
      chai
        .request(server)
        .get("/stats/operator")
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          log(JSON.parse(res.text));
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("GET /stats/transfer: it should retrieve all transfers, HTTP 200", (done) => {
      chai
        .request(server)
        .get("/stats/transfer")
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          log(JSON.parse(res.text));
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("GET /stats/users: it should retrieve all users, HTTP 200", (done) => {
      chai
        .request(server)
        .get("/stats/users")
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          log(JSON.parse(res.text));
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("GET /users/:id/notifications", () => {
    beforeEach(async (): Promise<void> => {
      if (mockDatabase.isConnectionOpen()) return;
      await mockDatabase.openNewMongooseConnection();
    });

    it("GET /user/:id/notifications: it should retrieve all open notifications for user1, HTTP 200", (done) => {
      chai
        .request(server)
        .get(`/users/${dwollaIdUser1}/notifications`)
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("GET /user/:id/notifications: it should retrieve all open notifications for user2, HTTP 200", (done) => {
      chai
        .request(server)
        .get(`/users/${dwollaIdUser2}/notifications`)
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("DELETE /user/:id/notifications: it should close a notification and retrieve open and all again, HTTP 200", async (): Promise<void> => {
      const input: AppNotificationService.ICreateAppNotificationDBItem = {
        message: "Test",
        closed: false,
        level: "INFO",
        userId: dwollaIdUser1,
        timestamp: Date.now(),
      };
      const notification: AppNotificationService.IAppNotificationDBItem =
        await AppNotificationService.create(input);
      log(notification);

      const input2: AppNotificationService.ICreateAppNotificationDBItem = {
        message: "Test2",
        closed: false,
        level: "INFO",
        userId: dwollaIdUser1,
        timestamp: Date.now(),
      };
      const notification2: AppNotificationService.IAppNotificationDBItem =
        await AppNotificationService.create(input2);
      log(notification2);

      const res = await chai
        .request(server)
        .delete(`/users/${dwollaIdUser1}/notifications/${notification.dbId}`);

      expect(res).to.have.status(codes.OK);
      expect(res.body.message).to.equal(
        `Notification ${notification.dbId} closed`
      );

      const res2 = await chai
        .request(server)
        .get(`/users/${dwollaIdUser1}/notifications`);

      expect(res2).to.have.status(codes.OK);
      log(res2.body);
      const openNotifications = res2.body.length;

      const res3 = await chai
        .request(server)
        .get(`/users/${dwollaIdUser1}/notifications?includeClosed=true`);

      expect(res3).to.have.status(codes.OK);
      log(res3.body);
      const allNotifications = res3.body.length;

      expect(allNotifications > openNotifications);
    });
  });

  describe("GET /businesses/", () => {
    beforeEach(async (): Promise<void> => {
      if (mockDatabase.isConnectionOpen()) return;
      await mockDatabase.openNewMongooseConnection();
    });

    it("it should create business2 and store the returned address, HTTP 201", (done) => {
      chai
        .request(server)
        .post("/users")
        .send(business2)
        .then((res) => {
          expect(res).to.have.status(codes.CREATED);
          expect(res).to.be.json;
          dwollaIdBusiness2 = res.body.business.dwollaId;
          done();
        })
        .catch((err) => {
          log(JSON.stringify(err, null, 2));

          done(err);
        });
    });

    it("it should create business3 and store the returned address, HTTP 201", (done) => {
      chai
        .request(server)
        .post("/users")
        .send(business3)
        .then((res) => {
          expect(res).to.have.status(codes.CREATED);
          expect(res).to.be.json;
          dwollaIdBusiness3 = res.body.business.dwollaId;
          done();
        })
        .catch((err) => {
          log(JSON.stringify(err, null, 2));

          done(err);
        });
    });

    it("it should post a supported webhook event for business2 and successfully process it, HTTP 202", async (): Promise<void> => {
      const event: DwollaEvent = createDummyEvent(
        "customer_created",
        dwollaIdBusiness2,
        dwollaIdBusiness2
      );
      const signature = createSignature(
        process.env.WEBHOOK_SECRET,
        JSON.stringify(event)
      );
      const res = await chai
        .request(server)
        .post("/webhook")
        .set({ "X-Request-Signature-SHA-256": signature })
        .send(event);
      expect(res).to.have.status(codes.ACCEPTED);
    });

    it("it should post a supported webhook event for business3 and successfully process it, HTTP 202", async (): Promise<void> => {
      const event: DwollaEvent = createDummyEvent(
        "customer_created",
        dwollaIdBusiness3,
        dwollaIdBusiness3
      );
      const signature = createSignature(
        process.env.WEBHOOK_SECRET,
        JSON.stringify(event)
      );
      const res = await chai
        .request(server)
        .post("/webhook")
        .set({ "X-Request-Signature-SHA-256": signature })
        .send(event);
      expect(res).to.have.status(codes.ACCEPTED);
    });

    it("GET /businesses/: it should retrieve all businesses, HTTP 200", (done) => {
      chai
        .request(server)
        .get(`/businesses`)
        .then((res) => {
          expect(res).to.have.status(codes.OK);
          expect(res.body.length).to.equal(4);
          for (let i = 0; i < res.body.length; i++) expectBusiness(res.body[i]);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
