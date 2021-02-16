# eslint-plugin-puppeteer

Checks against common pitfalls when using puppeteer

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ yarn add -D eslint
```

Next, install `@auteon/eslint-plugin-puppeteer`:

```
$ yarn add -D @auteon/eslint-plugin-puppeteer
```

## Usage

Add `@auteon/puppeteer` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["@auteon/puppeteer"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "@auteon/puppeteer/rule-name": 2
  }
}
```

## Supported Rules

### `no-external-eval`

The `$eval` method on a puppeteer page runs the code provided as the callback inside the scope of the browser that puppeteer has started.
To do this the callback is serialized and then re-evaluated (hence the name) inside the browser.
This means that if you use any functions or variables inside the callback that aren't local to its scope you're going to get errors.

This rule informs you about these kinds of errors.
