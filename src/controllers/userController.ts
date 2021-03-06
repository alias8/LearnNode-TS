import { promisify } from "es6-promisify";
import express from "express";
import { IController } from "../app";
import { catchErrors } from "../handlers/errorHandlers";
import { User } from "../models/User";
import { AuthenticationController } from "./authController";

export class UserController implements IController {
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(
            "/james",
            (request: express.Request, response: express.Response) => {
                response.send(200);
            }
        );
        this.router.get("/login", this.loginForm);
        this.router.get("/register", this.registerForm);
        this.router.post(
            "/register",
            this.validateRegister,
            this.register,
            AuthenticationController.login
        );

        this.router.get(
            "/account",
            AuthenticationController.isLoggedIn,
            this.account
        );
        this.router.post("/account", catchErrors(this.updateAccount));
    }

    private loginForm = (
        request: express.Request,
        response: express.Response
    ) => {
        response.render("login", { title: "Login" });
    };

    private registerForm = (
        request: express.Request,
        response: express.Response
    ) => {
        response.render("register", { title: "Register" });
    };

    private validateRegister = (
        request: express.Request,
        response: express.Response,
        next: express.NextFunction
    ) => {
        request.sanitizeBody("name");
        request.checkBody("name", "You must supply a name!").notEmpty();
        request.checkBody("email", "That Email is not valid!").isEmail();
        request.sanitizeBody("email").normalizeEmail({
            gmail_remove_dots: false,
            gmail_remove_subaddress: false
        });
        request.checkBody("password", "Password Cannot be Blank!").notEmpty();
        request
            .checkBody(
                "password-confirm",
                "Confirmed Password cannot be blank!"
            )
            .notEmpty();
        request
            .checkBody("password-confirm", "Oops! Your passwords do not match")
            .equals(request.body.password);

        const errors = request.validationErrors();
        if (errors) {
            request.flash("error", errors.map((err: any) => err.msg));
            response.render("register", {
                body: request.body,
                flashes: request.flash(),
                title: "Register"
            });
            return; // stop the fn from running
        }
        next(); // there were no errors!
    };

    private register = async (
        request: express.Request,
        response: express.Response,
        next: express.NextFunction
    ) => {
        const user = new User({
            email: request.body.email,
            name: request.body.name
        });
        const register = promisify(User.register.bind(User)); // register method comes from passportLocalMongoose plugin
        await register(user, request.body.password);
        next(); // pass to authController.login
    };

    private account = (
        request: express.Request,
        response: express.Response
    ) => {
        response.render("account", { title: "Edit your account" });
    };

    private updateAccount = async (
        request: express.Request,
        response: express.Response
    ) => {
        const updates = {
            email: request.body.email,
            name: request.body.name
        };

        const user = await User.findOneAndUpdate(
            // @ts-ignore
            { _id: request.user._id },
            { $set: updates },
            { new: true, runValidators: true, context: "query" }
        );
        request.flash("success", "Updated the profile!");
        response.redirect("/");
    };
}
