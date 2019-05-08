/* tslint:disable:object-literal-sort-keys */
import autoprefixer from "autoprefixer";
import CleanWebpackPlugin from "clean-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import webpack = require("webpack");
import { Stats } from "webpack";
import nodeExternals from "webpack-node-externals";

const baseConfig = (): webpack.Configuration => {
    return {
        mode: "development",
        context: path.resolve(__dirname, "src"),
        node: {
            __dirname: false,
            __filename: false
        },
        watch: true,
        devtool: "source-map",
        output: {
            path: path.resolve(__dirname, "public", "js"),
            filename: "[name].bundle.js"
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".jsx"]
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: "ts-loader"
                },
                {
                    test: /\.s?css$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader as string
                        },
                        {
                            loader: "css-loader",
                            options: {
                                importLoaders: 2
                            }
                        },
                        {
                            loader: "postcss-loader",
                            options: {
                                ident: "postcss",
                                sourceMap: true,
                                plugins() {
                                    return [autoprefixer()];
                                }
                            }
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                outputStyle: "expanded",
                                sourceMap: true
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new CleanWebpackPlugin(),
            new MiniCssExtractPlugin({ filename: "../styles/style.css" }),
            new CopyPlugin([
                {
                    from: path.resolve("src", "static"),
                    to: path.resolve("public", "static")
                }
            ])
        ]
    };
};

const generateWebpackConfigNode = (): webpack.Configuration => {
    return {
        ...baseConfig(),
        entry: {
            app: "./server",
            data: "./data/load-sample-data"
        },
        target: "node",
        externals: [nodeExternals()]
    };
};

const generateWebpackConfigBrowser = (): webpack.Configuration => {
    return {
        ...baseConfig(),
        entry: {
            tools: "./util/tools"
        },
        target: "web"
    };
};

const handleErrors = (err: Error, stats: Stats) => {
    if (err) {
        console.error(err.stack || err);
        if ((err as any).details) {
            console.error((err as any).details);
        }
        return;
    }

    const info = stats.toJson();

    if (stats.hasErrors()) {
        console.error(info.errors);
    }

    if (stats.hasWarnings()) {
        console.warn(info.warnings);
    }
};

webpack(
    [generateWebpackConfigNode(), generateWebpackConfigBrowser()],
    async (err: Error, stats: Stats) => {
        handleErrors(err, stats);
        console.log(stats.toString());
    }
);
