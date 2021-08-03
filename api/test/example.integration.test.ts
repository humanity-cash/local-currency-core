import { ExampleService } from "../src/database/service";

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
