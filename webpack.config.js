const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/mdlp-scanner.ts',
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'es5'),
        libraryTarget: 'var',
        library: ['MedInTech', 'Barcode']
    }
};