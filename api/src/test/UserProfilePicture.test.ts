import chai from "chai";
import faker from "faker";
import fs from "fs";
import chaiHttp from "chai-http";
import { getFileFromBukcet, listBuckets } from "../aws";
import { getApp } from "../server";
import { PROFILE_PICTURES_BUCKET } from "../router/user/controller";

const expect = chai.expect;
chai.use(chaiHttp);
const server = getApp();

describe("Profile Picture Module", () => {
  const filePath = `${__dirname}/more.svg`;
  const userId = faker.name.title().split(" ").join(""); // remove spaces

  it("It should upload image successfully", (done) => {
    chai
      .request(server)
      .post("/users/" + userId + "/upload/profilePicture")
      .attach("file", fs.readFileSync(filePath))
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.haveOwnProperty("tag");
        done();
      })
      .catch((err) => {
        done(err);
      });
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

  it("It should return image from bucket", async () => {
    const data = await getFileFromBukcet(
      PROFILE_PICTURES_BUCKET,
      `${userId}-profile-picture.jpg`
    );
    expect(data).to.haveOwnProperty("Body");
    expect(data).to.haveOwnProperty("LastModified");
  });
});
