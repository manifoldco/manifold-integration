module.exports = {
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  plugins: ['@typescript-eslint', 'prettier'],
  env: {
    browser: true,
    node: true,
    jest: true,
    es6: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    jsx: true,
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'arrow-parens': 'off', // let Prettier decide
    camelcase: 'off', // underscores are a thing
    'class-methods-use-this': 'off', // component lifecycle methods sometimes don't use `this`
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        exports: 'never',
        functions: 'never', // function commas are weird
        imports: 'always-multiline',
        objects: 'always-multiline',
      },
    ],
    curly: ['error', 'all'],
    'function-paren-newline': 'off', // let Prettier decide
    'implicit-arrow-linebreak': 'off', // let Prettier decide
    'import/no-extraneous-dependencies': 'off', // We need zero deps for npm
    'import/no-unresolved': 'off', // TypeScript can handle this
    'import/prefer-default-export': 'off', // named exports are perfectly fine
    'lines-between-class-members': 'off', // class members don’t need that space!
    'max-len': 'off', // let Prettier decide
    'object-curly-newline': 'off', // let Prettier decide,
    'space-before-function-paren': 'off', // let Prettier decide,
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/no-unused-vars': 'off', // compiler catches these well enough
    '@typescript-eslint/no-var-requires': 'off', // Node is cool
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off', // needed for Node.js
      },
    },
  ],
};
