import { getApp } from "./server";

const port = process.env.PORT || 3000;
const app = getApp();

app.listen(port, () => {
  console.log(
    "CELO_UBI_ADDRESS",
    process.env.CELO_UBI_ADDRESS,
    "\nCELO_UBI_RPC_HOST",
    process.env.CELO_UBI_RPC_HOST,
    "\nCELO_UBI_MNEMONIC set",
    !!process.env.CELO_UBI_MNEMONIC
  );
  console.log(`App listening at http://localhost:${port}`);
});
