module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ['airbnb-base'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/missing-trailing-comma': 'never',
    'max-len': [
      'off',
      {
        code: 140,
        ignoreComments: true,
        ignoreUrls: true
      }
    ]
  }
};
