
# Email Integration

## Setup

1. Create and format a template from the Foundation templates - https://get.foundation/emails/email-templates.html, or build from the existing HTML in this folder.

2. Save the completed responsive HTML here.
3. Inline styles and minify the HTML here - https://get.foundation/emails/inliner.html. Note, the templates in this folder are already inlined and the tool linked previously will only minify for you.
4. Escape quotes in the completed HTML, as per `berkshares-deposit-5-back-minified.html` for example.
5. Create an AWS SES email template file, as per `DepositCompleted.json`.

## Create template on AWS

7. Create a new template on AWS in the us-east-1 region

`aws ses create-template --region us-east-1 --cli-input-json file://<Your new template JSON>`

_Note: To update after creating, use the `update-template` command instead._

## Use template

8. See `aws.ts`, fairly self-explanatory. Provide an object which string replaces the {{ tags }} in the HTML template.

```
export async function sendTemplatedEmail(
  templateName: string,
  templateData: DepositEmailTemplate | WithdrawalEmailTemplate,
  destinationAddress: string,
  sendFrom = "notify@mail.berkshares.humanity.cash"
): Promise<boolean> {
  try {
    const config: SESClientConfig = {
      apiVersion: "2010-12-01",
      region: "us-east-1",
    };
    const ses: SESClient = new SESClient(config);
    const input: SendTemplatedEmailCommandInput = {
      Source: sendFrom,
      Destination: {
        ToAddresses: [destinationAddress],
        // BccAddresses: ["tech@humanity.cash"]
      },
      Template: templateName,
      TemplateData: JSON.stringify(templateData),
      ReplyToAddresses: ["info@berkshares.org"],
    };
    const command: SendTemplatedEmailCommand = new SendTemplatedEmailCommand(
      input
    );
    log(`SendTemplatedEmailCommand ${JSON.stringify(command, null, 2)}`);

    const response: SendTemplatedEmailCommandOutput = await ses.send(command);
    log(`SendTemplatedEmailCommandOutput ${JSON.stringify(response, null, 2)}`);

    return true;
  } catch (err) {
    log(err);
    return false;
  }
}
```
## Testing

9. Add a new test case for each new template created to `AWSSESEmail.test.ts`, e.g.
```
it("should send a DepositCompleted template email", async () => {
    const params: DepositEmailTemplate = {
      amount: "1.23",
      userId: v4(),
      transactionId: v4(),
      timestamp: new Date().toLocaleString(),
      randomness: v4(), //required so Gmail doesn't bundle the emails and trim the footer
    };
    const success = await sendTemplatedEmail(
      "DepositCompleted",
      params,
      "tech@humanity.cash"
    );
    expect(success);
  });
```
_Note: the test runner will use the AWS_PROFILE if your environment has one configured. Use a AWS_KEY and SECRET in the `.env.test` file, connected to the IAM user BerkSharesTesting_