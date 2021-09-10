import dotenv from "dotenv";
import path from "path";

const result = dotenv.config({
    path: path.resolve(process.cwd(), ".env.test"),
});

if (result.error) {
    throw result.error;
}