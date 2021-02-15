# eslint-plugin-puppeteer

Checks against common pitfalls when using puppeteer

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `@auteon/eslint-plugin-puppeteer`:

```
$ npm install @auteon/eslint-plugin-puppeteer --save-dev
```

## Usage

Add `puppeteer` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["puppeteer"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "puppeteer/rule-name": 2
  }
}
```

## Supported Rules

- Fill in provided rules here
