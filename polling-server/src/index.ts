import { getApp } from "./server";

const port = process.env.PORT || 8000;
const app = getApp();

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
