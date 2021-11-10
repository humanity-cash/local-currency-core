/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function removeMongoMeta(databaseResponse: any): any {
  if(!databaseResponse) return databaseResponse;
  databaseResponse.dbId = databaseResponse._id;
  delete databaseResponse.__v;
  delete databaseResponse._id;
  return databaseResponse;
}
