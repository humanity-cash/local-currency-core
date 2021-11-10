// firstName	yes	string	Individual’s legal first name.
// lastName	yes	string	Individual’s legal last name.
// email	yes	string	Customer’s email address.
// type	yes	string	Type of identity verified Customer. Value of personal for individual.
// address1	yes	string	Street number, street name of individual’s physical address.
// address2	no	string	Apartment, floor, suite, bldg # of individual’s physical address.
// city	yes	string	City of individual’s physical address.
// state	yes	string	Two-letter US state or territory abbreviation code of individual’s physical address.
// postalCode	yes	string	Customer’s US five-digit ZIP or ZIP + 4 code.
// dateOfBirth	yes	string	Customer's date of birth in YYYY-MM-DD format. Must be between 18 to 125 years of age.
// ssn	yes	string	Last four-digits of individual’s social security number.
export interface DwollaPersonalVerifiedCustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  type: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  dateOfBirth: string;
  ssn: string;
}

// firstName	yes	string	Customer’s first name. Must be less than or equal to 50 characters and contain no special characters.
// lastName	yes	string	Customer’s last name. Must be less than or equal to 50 characters and contain no special characters.
// email	yes	string	Customer’s email address.
// businessName	no	string	Customer’s registered business name. (Optional if not a business entity)
// ipAddress	no	string	Customer’s IP address.
// correlationId	no	string	A unique string value attached to a customer which can be used for traceability between Dwolla and your application.
// Must be less than 255 characters and contain no spaces.
// Acceptable characters are: a-Z, 0-9, -, ., and _.
// Note: Sensitive Personal Identifying Information (PII) should not be used in this field and it is recommended to use a random value for correlationId, like a UUID. Uniqueness is enforced on correlationId across Customers.

export interface DwollaUnverifiedCustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  businessName?: string;
  ipAddress?: string;
  correlationId: string;
}

// _links	no	object	A _links JSON object containing an on-demand-authorization link relation. See example raw request and response below.
// routingNumber	yes	string	A bank routing number that identifies a bank or credit union in the U.S. Note: Validation of the routing number includes: a checksum, the first two digits of the routing number must fall within the range “01” through “12”, or “21” through “32”, and the string value must consist of nine digits.
// accountNumber	yes	string	The bank account number. Note: The account number is validated to check if it is a numeric string of 4-17 digits.
// bankAccountType	yes	string	Type of bank account: checking, savings, general-ledger or loan.
// name	yes	string	Arbitrary nickname for the funding source. Must be 50 characters or less.
// plaidToken	no	string	A processor token obtained from Plaid for adding and verifying a bank. Reference our Plaid Link Developer Resource Article to learn more about this integration.
// channels	no	array	An array containing a list of processing channels. ACH is the default processing channel for bank transfers. Acceptable value for channels is: “wire”. e.g. “channels”: [ “wire” ]. A funding source (Bank Account) added using the wire channel only supports a funds transfer going to the bank account from a balance. As a result, wire as a destination funding source can only be added where the Customer account type is a Verified Customer. Note: channels is a premium feature that must be enabled on your account and is only available to select Dwolla customers.

export interface DwollaFundingSourceRequest {
  routingNumber: string;
  accountNumber: string;
  bankAccountType: string;
  name: string;
  channels?: string[];
}

export interface DwollaClientOptions {
  key: string;
  secret: string;
  environment: "sandbox" | "production";
}
interface Href {
  href: string;
  type: string;
  "resource-type"?: string;
}
interface DwollaSelfLinks {
  self: Href;
  resource: Href;
  account: Href;
  customer: Href;
}

// _links	Contains links to the event, associated resource, and the Account associated with the event.
// id	Event id
// created	ISO-8601 timestamp when event was created
// topic	Type of event
// resourceId	id of the resource associated with the event.
export interface DwollaEvent {
  _links: DwollaSelfLinks;
  id: string;
  created: string;
  topic: string;
  resourceId: string;
}

// href of source / destination is the HTTP reference to
// a user's funding source
interface DwollaTransferRequestLinks {
  source: {
    href: string;
  };
  destination: {
    href: string;
  };
}
export interface DwollaTransferRequest {
  _links: DwollaTransferRequestLinks;
  amount: {
    currency: "USD";
    value: string;
  };
}
