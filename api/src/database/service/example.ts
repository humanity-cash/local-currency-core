import { Example } from "../schema";

interface CreateExampleType {
  age: number;
  firstName: string;
}

interface ExampleType {
  id: string;
  age: number;
  firstName: string;
}

/**Maybe move this function to general 
	utils as it can be used in different schemas */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const removeMongoMeta = (databaseResponse: any) => {
  databaseResponse.id = databaseResponse._id;
  delete databaseResponse.__v;
  delete databaseResponse._id;

  return databaseResponse;
};

export const create = async (
  input: CreateExampleType
): Promise<ExampleType> => {
  const { firstName, age } = input;
  const response = await Example.create({ firstName, age });

  return removeMongoMeta(response.toObject());
};
