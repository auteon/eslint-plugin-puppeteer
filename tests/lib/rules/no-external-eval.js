/**
 * @fileoverview Checks whether eval callbacks only access variables from their defined scope.
 * @author Philipp Giese
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const plugin = require('../../../lib')
const { RuleTester } = require('eslint')

const rule = 'no-external-eval'

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2015 },
})

const parsers = [
  // default parser
  'esprima',
  'babel-eslint',
  '@typescript-eslint/parser',
]

const define = ({ valid, invalid }) => ({
  valid: enhanceTests(valid),
  invalid: enhanceTests(invalid),
})

const enhanceTests = (tests) =>
  parsers.reduce(
    (result, parser) => [
      ...result,
      ...tests.map(({ code, errors, parserOptions, ...rest }) => ({
        ...rest,
        parser: require.resolve(parser),
        parserOptions: {
          ...parserOptions,

          parser: require.resolve(parser),
        },
        code: `// Parser: ${parser}\n${code}`,
        errors: errors
          ? errors.map(({ line, ...error }) => ({
              ...error,

              line: line != null ? line + 1 : line,
            }))
          : undefined,
      })),
    ],
    []
  )

ruleTester.run(
  rule,
  plugin.rules[rule],
  define({
    valid: [
      {
        code: `
          function test () { 
              page.$eval('.button', (button) => {
                  if(button instanceof HTMLButtonElement) {
                      return
                  }
              })
          }
              `,
      },
      {
        code: `
          function test () { 
              const outside = 'test'

              page.$eval('.button', (_, outside) => {
                 outside
              }, outside)
          }
              `,
      },
    ],

    invalid: [
      {
        code: `
        function test () {
            const outside = 'test'

            page.$eval('.selector', () => {
                outside
            })
        }
            `,
        errors: [
          {
            message:
              'The variable "outside" is defined outside the scope of the $eval method.',
            type: 'Identifier',
            line: 6,
          },
        ],
      },
      {
        code: `
        function test () {
            const outside = 'test'

            page.$eval('.selector', function() {
                outside
            })
        }
            `,
        errors: [
          {
            message:
              'The variable "outside" is defined outside the scope of the $eval method.',
            type: 'Identifier',
            line: 6,
          },
        ],
      },
      {
        code: `
        async function test() {
            const outside = await Promise.resolve('test')

            await page.$eval('.selector', function() {
                outside
            })
        }
            `,
        parserOptions: { ecmaVersion: 2018 },
        errors: [
          {
            message:
              'The variable "outside" is defined outside the scope of the $eval method.',
            type: 'Identifier',
            line: 6,
          },
        ],
      },
      {
        code: `
        export default async (page) => {
            const outside = 'test'

            await page.$eval('.selector', function() {
                if(outside) {
                  return
                }
            })
        }
            `,
        parserOptions: {
          ecmaVersion: 2018,
          sourceType: 'module',
        },
        errors: [
          {
            message:
              'The variable "outside" is defined outside the scope of the $eval method.',
            type: 'Identifier',
            line: 6,
          },
        ],
      },
      {
        code: `
        function test () {
            function outside() {}

            page.$eval('.selector', function() {
                outside
            })
        }
            `,
        errors: [
          {
            message:
              'The function "outside" is defined outside the scope of the $eval method.',
            type: 'Identifier',
            line: 6,
          },
        ],
      },
      {
        code: `
        function test () {
            const outside = () => {}

            page.$eval('.selector', function() {
                outside
            })
        }
            `,
        errors: [
          {
            message:
              'The function "outside" is defined outside the scope of the $eval method.',
            type: 'Identifier',
            line: 6,
          },
        ],
      },
      {
        code: `
        import outside from 'module'

        page.$eval('.selector', function() {
            outside
        })
            `,
        parserOptions: { sourceType: 'module' },
        errors: [
          {
            message:
              'Cannot import "outside" from "module" because it is not in the scope of the $eval method.',
            type: 'Identifier',
            line: 5,
          },
        ],
      },
      {
        code: `
        const outside = require('module')

        page.$eval('.selector', function() {
            outside
        })
            `,
        parserOptions: { sourceType: 'module' },
        errors: [
          {
            message:
              'Cannot import "outside" from "module" because it is not in the scope of the $eval method.',
            type: 'Identifier',
            line: 5,
          },
        ],
      },
      {
        code: `
      function test() {
        const outside = 'test'

        Promise.resolve().then(async () => {
          await page.$eval('.selector', () => {
            outside
          })
        })
      }
            `,
        errors: [
          {
            message:
              'The variable "outside" is defined outside the scope of the $eval method.',
            type: 'Identifier',
            line: 7,
          },
        ],
      },
      {
        code: `
        const outside = 'test'

        page.$eval('.selector', () => {
          if(outside) {
            outside
          }
        })
      `,
        parserOptions: {
          sourceType: 'module',
        },
        errors: [
          {
            message:
              'The variable "outside" is defined outside the scope of the $eval method.',
            type: 'Identifier',
            line: 5,
          },
          {
            message:
              'The variable "outside" is defined outside the scope of the $eval method.',
            type: 'Identifier',
            line: 6,
          },
        ],
      },
      {
        code: `
        const outside = 'test'

        page.$eval('.selector', () => {
          outside
        })
      `,
        parserOptions: { sourceType: 'module' },
        errors: [
          {
            message:
              'The variable "outside" is defined outside the scope of the $eval method.',
            type: 'Identifier',
            line: 5,
          },
        ],
      },
      {
        code: `
        export default async function test() {
          const outside = 'test'

          Promise.resolve().then(async () => {
            await page.$eval('.selector', () => {
              outside
            })
          })
        }
        `,
        parserOptions: {
          sourceType: 'module',
          ecmaVersion: 2018,
        },
        errors: [
          {
            message:
              'The variable "outside" is defined outside the scope of the $eval method.',
            type: 'Identifier',
            line: 7,
          },
        ],
      },
    ],
  })
)
