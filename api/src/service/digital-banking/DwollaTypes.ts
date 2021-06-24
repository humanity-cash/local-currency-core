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

export interface DwollaClientOptions {
  key: string;
  secret: string;
  environment: "sandbox" | "production";
}
