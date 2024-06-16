import { resolve as _resolve } from 'path';

export const mode = 'development';
export const entry = './src/main.ts';
export const devtool = 'source-map';
export const target = 'electron-main';
export const module = {
    rules: [
        {
            test: /\.ts$/,
            include: /src/,
            use: [{ loader: 'ts-loader' }]
        }
    ]
};
export const resolve = {
    extensions: ['.ts', '.js']
};
export const output = {
    path: _resolve(__dirname, 'dist'),
    filename: 'main.js' // Tên file đầu ra sau khi biên dịch
};
