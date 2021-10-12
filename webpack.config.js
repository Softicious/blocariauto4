const SentryWebpackPlugin = require("@sentry/webpack-plugin");

module.exports = {
  // other configuration
  configureWebpack: {
    plugins: [
      new SentryWebpackPlugin({
        // sentry-cli configuration
        authToken: '304f683b85954574883a2c1813ded44dac98b259106b4935bedc790ab94a11bf',
        org: "iot-digital-development-srl",
        project: "rops4primariasector4app",
        // webpack specific configuration
        include: ".",
        ignore: ["node_modules", "webpack.config.js"],
      }),
    ],
  },
};