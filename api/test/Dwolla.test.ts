import dotenv from "dotenv";
import {getAppToken, createPersonalVerifiedCustomer} from "../src/service/digital-banking/Dwolla";
import {DwollaPersonalVerifiedCustomerRequest} from "../src/service/digital-banking/DwollaTypes";
import faker from "faker";
import path from "path";

const result = dotenv.config({
  path: path.resolve(process.cwd(), ".env.test"),
});
if (result.error) {
    throw result.error;
}

describe("Basic sanity checking Dwolla connection", () => {
    it("Should request and receive a valid Dwolla OAuth token", async () => {
        const appToken = await getAppToken();      
        expect(appToken).toBeDefined();
    });
});

describe("Creating Dwolla customers", () => {
    
    it("Should create 5 personal verified customer and return the entity link", async () => {
        
        for(let i = 0; i < 5; i++){

            const firstName = faker.name.firstName();
            const lastName = faker.name.lastName();
            const address1 = faker.address.streetAddress();
            const address2 = faker.address.secondaryAddress();
            const city = faker.address.city();
            const postalCode = faker.address.zipCode();
            const state = faker.address.stateAbbr();
            const email = faker.internet.email();
            const dateOfBirth = "1970-01-01";
            const type = "personal";
            const ssn = faker.datatype.number(9999).toString();

            const person : DwollaPersonalVerifiedCustomerRequest = {
                firstName,
                lastName,
                email,
                type,
                address1,
                address2,
                city,
                state,
                postalCode,
                dateOfBirth,
                ssn
            }
            const customerURL = await createPersonalVerifiedCustomer(person);
            console.log("Customer created, link:" + customerURL);
            expect(customerURL).toBeDefined();
        }       
        
    }, 60000);
});