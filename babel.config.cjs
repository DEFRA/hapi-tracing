const { NODE_ENV } = process.env

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
