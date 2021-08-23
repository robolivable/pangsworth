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

    You can contact the author by email at robolivable@gmail.com.
*/

/* eslint-disable */
const path = require('path')
const webpack = require('webpack')

const ENTRYPOINT_NAME = 'app.jsx'
const BUNDLE_NAME = 'bundle.js'

const PATHS = {
  build: 'build',
  images: 'images',
  lib: 'lib',
  nodeModules: 'node_modules',
  src: 'src',
  static: 'static'
}

const projectPath = (...args) => path.resolve(__dirname, ...args)

const config = {
  entry: projectPath(PATHS.src, ENTRYPOINT_NAME),
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
      }
    ]
  },
  output: {
    path: projectPath(PATHS.build),
    filename: BUNDLE_NAME
  },
  plugins: [],
  resolve: { extensions: ['.js', '.jsx'] }
}

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  )
  config.plugins.push(new webpack.optimize.ModuleConcatenationPlugin())
  config.plugins.push(new webpack.HashedModuleIdsPlugin())
}

module.exports = config
