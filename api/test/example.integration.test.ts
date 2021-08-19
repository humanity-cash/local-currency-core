import { ExampleService } from "../src/database/service";
import { describe, it, expect } from "@jest/globals";

describe("Example Service", () => {
  it("Creates Example Successfully", async () => {
    const response = await ExampleService.create({
      firstName: "firstName",
      age: 0,
    });
    expect(response.age).toEqual(0);
    expect(response.firstName).toEqual("firstName");
    expect(response.id).toBeDefined();
  });
});