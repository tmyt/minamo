module.exports = {
  "parser": "babel-eslint",
  "settings": {
    "react": {
      "version": "16.2",
    },
  },
  "env": {
    "es6": true,
    "node": true,
    "browser": true,
  },
  "extends": [
    "eslint:recommended",
//    "plugin:react/recommended",
  ],
  "parserOptions": {
    "ecmaVersion": 2018,
    "ecmaFeatures": {
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
        "ArrayExpression": "first",
        "ignoredNodes": ['JSXElement', 'JSXElement > *', 'JSXAttribute', 'JSXIdentifier', 'JSXNamespacedName', 'JSXMemberExpression', 'JSXSpreadAttribute', 'JSXExpressionContainer', 'JSXOpeningElement', 'JSXClosingElement', 'JSXText', 'JSXEmptyExpression', 'JSXSpreadChild'],
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
    "react/jsx-indent-props": [2, "first"],
  },
  "globals": {
    "$": true,
    "toastr": true,
    "System": true,
  }
};
