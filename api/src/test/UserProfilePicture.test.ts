import chai from "chai";
import fs from "fs";
import chaiHttp from "chai-http";
import { getFileFromBucket, listBuckets } from "../aws";
import { getApp } from "../server";
import { PROFILE_PICTURES_BUCKET } from "../router/user/controller";
import { mockDatabase } from "./setup/setup-db-integration";
import { createFakeUser } from "./utils";
import { getUser } from "src/service/AuthService";
import { avatarUrlGenerator } from "src/utils";
import { codes } from "src/utils/http";

jest.setTimeout(50000);

const expect = chai.expect;
chai.use(chaiHttp);
const server = getApp();

describe("Profile Picture Module", () => {
  const filePath = `${__dirname}/test-avatar.jpg`;
  let customerDwollaId: string;

  beforeAll(async () => {
    await mockDatabase.init();
  });

  afterAll(async (): Promise<void> => {
    await mockDatabase.stop();
  });

  it("It should return profile pictures bucket", async () => {
    const data = await listBuckets();
    const ppBucket = data.Buckets.filter(
      (b) => b.Name === PROFILE_PICTURES_BUCKET
    );
    expect(data).to.haveOwnProperty("Buckets");
    expect(data).to.haveOwnProperty("Owner");
    expect(ppBucket).to.have.length(1);
  });

  it("It should create customer", (done) => {
    chai
      .request(server)
      .post("/users")
      .send(createFakeUser())
      .then((res) => {
        expect(res.body.customer.dwollaId).to.exist;
        expect(res.body.customer.resourceUri).to.exist;
        expect(res.body.dbId).to.exist;
        expect(res.body.verifiedCustomer).to.eql(true);
        expect(res.body.verifiedBusiness).to.eql(false);
        expect(res).to.have.status(codes.CREATED);
        customerDwollaId = res.body.customer.dwollaId;
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it("Customer should have default avatar", async () => {
    const u = await getUser(customerDwollaId);
    expect(u.data.customer.avatar).to.eql(
      process.env.CUSTOMER_DEFAULT_AVATAR_URL
    );
  });

  it("It should upload image successfully", (done) => {
    chai
      .request(server)
      .post("/users/" + customerDwollaId + "/upload/profilePicture")
      .attach("file", fs.readFileSync(filePath))
      .then((res) => {
        expect(res).to.have.status(codes.OK);
        expect(res.body).to.be.haveOwnProperty("tag");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it("Customer should have new avatar", async () => {
    const u = await getUser(customerDwollaId);
    expect(u.data.customer.avatar).to.eql(avatarUrlGenerator(customerDwollaId));
  });

  it("It should return image from bucket", async () => {
    const data = await getFileFromBucket(
      PROFILE_PICTURES_BUCKET,
      `${customerDwollaId}-profile-picture.jpg`
    );
    expect(data).to.haveOwnProperty("Body");
    expect(data).to.haveOwnProperty("LastModified");
  });
});
