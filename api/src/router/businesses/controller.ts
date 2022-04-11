import { Request, Response } from "express";
import { getBusinesses } from "src/database/service/User";
import { httpUtils, blockList } from "src/utils";
import { Business } from "src/types";

const codes = httpUtils.codes;

export async function getAllBusinesses(
  req: Request,
  res: Response
): Promise<void> {
  try {
    let businesses: Business[] = await getBusinesses();

    // Filter with block list businesses
    // Test accounts, accounts accidentally created
    // or businesses that have are known to not be 
    // in the Berkshires region
    if(businesses?.length > 0){
      const blockListDwollaIds : string[] = blockList.BUSINESS_BLOCKLIST.map(x => x.dwollaUserId);
      businesses = businesses.filter(element => !blockListDwollaIds.includes(element.dwollaId));      
    }

    httpUtils.createHttpResponse(businesses, codes.OK, res);
  } catch (err) {
    httpUtils.serverError(err, res);
  }
}
