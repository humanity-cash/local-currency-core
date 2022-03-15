import { Response } from "dwolla-v2";
import { DwollaTransferService } from "src/database/service";
import { DwollaEvent } from "src/service/digital-banking/DwollaTypes";
import { createSignature, getDwollaResourceFromLocation } from "src/service/digital-banking/DwollaUtils";
import { log } from "src/utils";
import { createDummyEvent } from "./utils";

export type transferEventType = 
    "bank_transfer_created" |
    "transfer_created" |
    "customer_transfer_created" |
    "bank_transfer_completed" |
    "transfer_completed" |
    "customer_transfer_completed";

export interface MockWebhook {
    event: DwollaEvent,
    signature: string
}

export async function mockTransferWebhook(
    dwollaUserId:string, 
    type:"DEPOSIT" | "WITHDRAWAL", 
    eventType:transferEventType, 
    createForSecondaryTransfer:boolean) : Promise<MockWebhook[]> 
{
    const mockWebhooks : MockWebhook[] = [];

    const transfers: DwollaTransferService.IDwollaTransferDBItem[] = (
        await DwollaTransferService.getByUserId(dwollaUserId)
      )?.filter((element) => element.type == type);

      log(`${type == "DEPOSIT" ? "Deposits" : "Withdrawals"} for user are ${JSON.stringify(transfers, null, 2)}`);

      for (let i = 0; i < transfers?.length; i++) {

        // console.log(`Creating webhook for transfer:`);
        // console.table(transfers[i]);
        
        let initiatingTransfer : Response;
        let secondaryTransferLink: string;
        let secondaryTransfer: Response;
        
        if(type == "DEPOSIT") {
            initiatingTransfer = await getDwollaResourceFromLocation(process.env.DWOLLA_BASE_URL + "transfers/" + transfers[i].fundingTransferId);
            secondaryTransferLink = initiatingTransfer?.body?._links["funded-transfer"]?.href;
            if(secondaryTransferLink)
                secondaryTransfer = await getDwollaResourceFromLocation(secondaryTransferLink);
        }
        else {
            initiatingTransfer = await getDwollaResourceFromLocation(process.env.DWOLLA_BASE_URL + "transfers/" + transfers[i].fundedTransferId);
            secondaryTransferLink = initiatingTransfer?.body?._links["funding-transfer"]?.href;
            if(secondaryTransferLink)
                secondaryTransfer = await getDwollaResourceFromLocation(secondaryTransferLink);
        }

        let event: DwollaEvent;        
        if(createForSecondaryTransfer)
            event = createDummyEvent(
                eventType,
                secondaryTransfer?.body?.id,
                dwollaUserId,
                "transfers"
            );
        else
            event = createDummyEvent(
                eventType,
                initiatingTransfer?.body?.id,
                dwollaUserId,
                "transfers"
            );

        const signature = createSignature(
            process.env.WEBHOOK_SECRET,
            JSON.stringify(event)
        );
        mockWebhooks.push({event,signature});
    }
    return mockWebhooks;
}