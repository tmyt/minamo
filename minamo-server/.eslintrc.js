module.exports = {
  "env": {
    "es6": true,
    "node": true,
    "browser": true,
  },
  "extends": [
      "eslint:recommended",
  ],
  "parserOptions": {
    "ecmaVersion": 8,
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true,
      "jsx": true
    },
    "sourceType": "module"
  },
  "plugins": [
    "react"
  ],
  "rules": {
    "indent": [
      "error",
      2,
      {
        "SwitchCase": 1,
        "VariableDeclarator": { "const": 2 },
        "ArrayExpression": "first"
      }
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "error",
      "single",
      { "allowTemplateLiterals": true }
    ],
    "semi": [
      "error",
      "always"
    ],
    "no-console": 1,
    "no-control-regex": 1,
    "react/jsx-uses-vars": "error",
    "react/jsx-uses-react": "error",
  },
  "globals": {
    "$": true,
    "toastr": true,
  }
};
