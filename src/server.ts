import dotenv from "dotenv";
import path from "path";
import { rootDirectory } from "./paths";
dotenv.config({ path: path.join(rootDirectory, ".env") });

import App from "./app";
import { AuthenticationController } from "./controllers/authController";
import { ReviewController } from "./controllers/reviewController";
import { StoreController } from "./controllers/storeController";
import { UserController } from "./controllers/userController";

const app = new App([
    new UserController(),
    new AuthenticationController(),
    new StoreController(),
    new ReviewController()
]);

app.listen();
