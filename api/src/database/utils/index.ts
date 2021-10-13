// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function removeMongoMeta(databaseResponse: any) : any {
    databaseResponse.dbId = databaseResponse._id;
    delete databaseResponse.__v;
    delete databaseResponse._id;
    return databaseResponse;
  };
  