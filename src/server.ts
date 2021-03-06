import dotenv from "dotenv";
import path from "path";
import yargs from "yargs";

console.log("-----------------yargs");
console.log(yargs.argv);
let env = "dev";
if (yargs.argv.env === "test") {
    env = "test";
} else if (yargs.argv.env === "prod") {
    env = "prod";
}
dotenv.config();

import App from "./app";
import { AuthenticationController } from "./controllers/authController";
import { ReviewController } from "./controllers/reviewController";
import { StoreController } from "./controllers/storeController";
import { UserController } from "./controllers/userController";

export const app = new App([
    new UserController(),
    new AuthenticationController(),
    new StoreController(),
    new ReviewController()
]);
