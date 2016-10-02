var webpack = require('webpack');

module.exports = {
    entry: './src/main.jsx',
    output: {
        path: './bin',
        filename: 'main.bundle.js'
    },
    devServer: {
        inline: true,
        contentBase: './bin',
        port: 8100
    },
    module: {
        loaders: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel'
        },
		{
	        test: /\.sass$/,
	        loaders: ["style", "css", "sass"]
      	}]
    }
};