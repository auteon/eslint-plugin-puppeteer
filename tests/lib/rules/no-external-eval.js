/**
 * @fileoverview Checks whether eval callbacks only access variables from their defined scope.
 * @author Philipp Giese
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../../../lib/rules/no-external-eval')
const { RuleTester } = require('eslint')

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2018, sourceType: 'module' },
})
ruleTester.run('no-external-eval', rule, {
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
      errors: [
        {
          message:
            'The variable "outside" is defined outside the scope of the $eval method.',
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
      errors: [
        {
          message:
            'Cannot import "outside" from "module" because it is not in the scope of the $eval method.',
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
      errors: [
        {
          message:
            'Cannot import "outside" from "module" because it is not in the scope of the $eval method.',
        },
      ],
    },
  ],
})
