/*
    Pangsworth Info Butler. At your service anywhere in Madrigal.
    Copyright (C) 2021  https://github.com/robolivable

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
/* eslint-disable */
const path = require('path')
const webpack = require('webpack')

const APP_ENTRYPOINT_NAME = 'app.jsx'
const BACKGROUND_SCRIPT_ENTRYPOINT_NAME = 'background.js'

const PATHS = {
  build: 'build',
  nodeModules: 'node_modules',
  src: 'src'
}

const projectPath = (...args) => path.resolve(__dirname, ...args)

const config = {
  entry: {
    app: projectPath(PATHS.src, APP_ENTRYPOINT_NAME),
    background: {
      import: projectPath(PATHS.src, BACKGROUND_SCRIPT_ENTRYPOINT_NAME),
      filename: '[name].js'
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: new RegExp(`(${PATHS.nodeModules}|${PATHS.build})`),
        loader: 'babel-loader',
        options: { presets: ['@babel/env'] }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack']
      },
      {
        test: /\.png$/,
        use: ['file-loader']
      }
    ]
  },
  output: {
    path: projectPath(PATHS.build),
    filename: '[name].js'
  },
  plugins: [],
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx']
  }
}

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  )
  config.plugins.push(new webpack.optimize.ModuleConcatenationPlugin())
} else {
  config.plugins.push(new webpack.SourceMapDevToolPlugin())
}

module.exports = config
