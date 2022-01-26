import chai from "chai";
import chaiHttp from "chai-http";
import dotenv from "dotenv";
import path from "path";
import { getApp } from "../server";
import { log } from "../utils";
import { codes } from "../utils/http";
import { mockDatabase } from "./setup/setup-db-integration";

const expiredToken =
  "eyJraWQiOiI0UFFoK0JaVExkRVFkeUM2b0VheVJDckVjblFDSXhqbFZFbTFVd2RhZ2ZNPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiQlNFSWQ1bkYyN3pNck45QkxYLVRfQSIsInN1YiI6IjI0ZTI2OTEwLWU3YjktNGFhZC1hOTk0LTM4Nzk0MmYxNjRlNyIsImF1ZCI6IjVyYTkxaTlwNHRycTQybTJ2bmpzMHB2MDZxIiwiZXZlbnRfaWQiOiJiNmQ3YTYyZC01NGRhLTQ5ZTYtYTgzOS02NjUwNmYwYzIxYjUiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTU4NzMxMTgzOCwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfUERzeTZpMEJmIiwibmFtZSI6Ik1heCBJdmFub3YiLCJjb2duaXRvOnVzZXJuYW1lIjoiMjRlMjY5MTAtZTdiOS00YWFkLWE5OTQtMzg3OTQyZjE2NGU3IiwiZXhwIjoxNTg3MzE1NDM4LCJpYXQiOjE1ODczMTE4MzgsImVtYWlsIjoibWF4QHNvdXRobGFuZS5jb20ifQ.GrlpeYQDwB81HjBZRkuqzw0ZXSGFBi_pbMoWC1QvHyPYrc6NRto02H4xgMls5OmCGa4bZBYWTT6wfo0bxuOLZDP__JRSfOyPUIbiAWTu1IiyAhbt3nlW1xSNSvf62xXQNveF9sPcvG2Gh6-0nFEUrAuI1a5QAVjXbp1YDDMr2TzrFrugW7zl2Ntzj42xWIq7P0R75S2JYVmBfhAxS6YNO1n8KpOFzxagxmn89leledx4PTxuOdWdmT6vZkW9q9QnOI9kjgUIxfWjx55205P4BwkOeqY7AN0j85LBwAHbhezfzNETybX1pwnMBh1p5_iLYgQMMZ60ZJseGl3cMRsPnQ";

jest.setTimeout(3000);

const expect = chai.expect;
chai.use(chaiHttp);
const server = getApp();

const result = dotenv.config({
  path: path.resolve(process.cwd(), ".env.test"),
});

if (result.error) {
  throw result.error;
}

describe("Middlewares", () => {
  beforeAll(async () => {
    await mockDatabase.init();
  });

  afterAll(async (): Promise<void> => {
    await mockDatabase.stop();
  });

  describe("auth", () => {
    beforeEach(async (): Promise<void> => {
      if (mockDatabase.isConnectionOpen()) return;
      await mockDatabase.openNewMongooseConnection();
    });

    it("Incorrect token", (done) => {
      chai
        .request(server)
        .post("/users")
        .set("authorization", expiredToken)
        .then((res) => {
          expect(res).to.have.status(codes.UNAUTHORIZED);
          expect(JSON.parse(res.text)).to.eql({
            message: "User is Unauthorized",
          });
          log(JSON.parse(res.text));
          done();
        })
        .catch((err) => {
          throw err;
        });
    });
  });

  it("Token does not exist", (done) => {
    chai
      .request(server)
      .post("/users")
      .then((res) => {
        expect(res).to.have.status(codes.UNAUTHORIZED);
        expect(JSON.parse(res.text)).to.eql({
          message: "No Auth Headers In Request",
        });
        log(JSON.parse(res.text));
        done();
      })
      .catch((err) => {
        throw err;
      });
  });
});
