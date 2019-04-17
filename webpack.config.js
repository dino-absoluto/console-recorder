/**
 * @author Dino <dinoabsoluto+dev@gmail.com>
 * @license
 * Copyright 2019 Dino <dinoabsoluto+dev@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
/* imports */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const nodeExternals = require('webpack-node-externals')
const merge = require('lodash/merge')
const webpack = require('webpack')
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const defaultConfigs = {
  mode: 'development',
  target: 'node',
  entry: './src/cli.ts',
  output: {
    pathinfo: false,
    filename: 'cli.js',
    libraryTarget: 'commonjs',
    path: path.resolve(__dirname, '__tmp__/bin')
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js']
  },
  plugins: [
    new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true })
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            experimentalWatchApi: true
          }
        }
      }, {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre'
      }
    ]
  },
  externals: [
    nodeExternals({
      whitelist: [ /^lodash/ ]
    })
  ]
}

const dev = (config) => {
  merge(config, {
    output: {
      path: path.resolve(__dirname, '__tmp__/bin')
    },
    optimization: {
      removeAvailableModules: false,
      removeEmptyChunks: false,
      splitChunks: false
    }
  })
}

const mini = (config) => {
  merge(config, {
    mode: 'production',
    output: {
      path: path.resolve(__dirname, 'bin/')
    },
    module: {
      rules: [
        {
          use: {
            options: {
              compilerOptions: {
                removeComments: true
              }
            }
          }
        }
      ]
    }
  })
}

module.exports = (env = {}) => {
  const config = merge({}, defaultConfigs)
  if (env.prod) {
    mini(config)
  } else {
    dev(config)
  }
  if (env.analyzeBundle) {
    merge(config, {
      plugins: [
        new BundleAnalyzerPlugin()
      ]
    })
  }
  return config
}
