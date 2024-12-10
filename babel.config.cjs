const { NODE_ENV } = process.env

/**
 * @type {TransformOptions}
 */
module.exports = {
  browserslistEnv: 'node',
  presets: [
    [
      '@babel/preset-env',
      {
        bugfixes: true,
        modules: NODE_ENV === 'test' ? 'auto' : false
      }
    ]
  ]
}

/**
 * @import { TransformOptions } from '@babel/core'
 */
