/**
 * @fileoverview Checks whether eval callbacks only access variables from their defined scope.
 * @author Philipp Giese
 */
'use strict'

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description:
        'Checks whether eval callbacks only access variables from their defined scope.',
      category: 'Fill me in',
      recommended: false,
    },
    fixable: null, // or "code" or "whitespace"
    schema: [
      // fill in your schema
    ],
  },

  create: function (context) {
    return {
      CallExpression: (node) => {
        if (node.callee.property.name !== '$eval') {
          return
        }

        const callback = node.arguments.find((argument) =>
          ['ArrowFunctionExpression', 'FunctionExpression'].includes(
            argument.type
          )
        )

        if (!callback) {
          return
        }

        const { variables } = context.getScope(node)

        const functionScopedVariables = variables.filter(({ scope }) =>
          ['function', 'module'].includes(scope.type)
        )

        const usedInsideEval = functionScopedVariables.filter((variable) =>
          variable.references.some(
            (reference) => reference.from.block === callback
          )
        )

        usedInsideEval.forEach((variable) => {
          context.report({
            node: variable,
            message: getMessage(variable),
            // message: `The ${kind} "${variable.name}" is defined outside the scope of the $eval method.`,
            loc: {},
          })
        })
      },
    }
  },
}

const getMessage = (variable) => {
  const [definition] = variable.defs

  if (isImport(definition)) {
    return `Cannot import "${variable.name}" from "${definition.parent.source.value}" is not in the scope of the $eval method.`
  }

  if (isFunction(definition)) {
    return `The function "${variable.name}" is defined outside the scope of the $eval method.`
  }

  return `The variable "${variable.name}" is defined outside the scope of the $eval method.`
}

const isImport = (definition) => definition.type === 'ImportBinding'

const isFunction = (definition) => {
  if (definition.type === 'FunctionName') {
    return true
  }

  if (!definition.node.init) {
    return false
  }

  return definition.node.init.type === 'ArrowFunctionExpression'
}
