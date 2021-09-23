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
  correlationId?: string;
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
