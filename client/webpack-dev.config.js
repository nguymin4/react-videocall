const { HotModuleReplacementPlugin } = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const socketConfig = require("../config");
const addBaseConfig = require("./webpack-base.config");

const configs = addBaseConfig({
    mode: "development",
    output: {
        filename: "js/[name].js"
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "sass-loader"]
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader", "postcss-loader"]
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]",
                            outputPath: "assets"
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            title: "React VideoCall - Minh Son Nguyen",
            filename: "index.html",
            template: "src/html/index.html"
        })
    ],
    devServer: {
        compress: true,
        disableHostCheck: true,
        // sockHost: '5000-e86f92db-f24e-4089-b8df-7bed4a3a25dd.ws-us02.gitpod.io',
        hot: true,
        liveReload: false,
        port: `${socketConfig.DEVPORT}`,
        allowedHosts: [".github.io"],
        // public: `${socketConfig.GITPODURL}`,
        host: "localhost",
        proxy: {
            "/bridge/": `http://localhost:${socketConfig.PORT}`
            // '/bridge/': {
            //     target: `http://localhost:${socketConfig.PORT}`,

            // },
        },
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        }
    }
});

// module.exports = configs;

// const doAsync = async () => {
//     //   const GITPODURL = await socketConfig.GETURL()
//     //   configs.devServer.public = GITPODURL
//     // console.log(`UPDATE '${configs.devServer.public}' to '${GITPODURL}'`)
//     configs.devServer.public = "https://localhost:5000";
//     console.log(`UPDATE '${configs.devServer.public}`);
//     return configs;
// };

const doAsync = async () => {
    const URL = await socketConfig.GETURL()
    configs.devServer.public = URL
    console.log(`UPDATE '${configs.devServer.public}' to '${URL}'`)
    return configs
};
module.exports = doAsync;
