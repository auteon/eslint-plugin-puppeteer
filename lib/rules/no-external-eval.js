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
    type: 'problem',
    docs: {
      description:
        'Checks whether eval callbacks only access variables from their defined scope.',
      category: 'Possible Errors',
      recommended: true,
    },
    schema: [
      {
        enum: ['always', 'never'],
      },
    ],
  },

  create: function (context) {
    return {
      CallExpression: (node) => {
        if (node.callee.type !== 'MemberExpression') {
          return
        }

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

        const variables = getVariables(context.getScope(node))

        const functionScopedVariables = variables.filter(({ scope }) =>
          ['function', 'module'].includes(scope.type)
        )

        const usedInsideEval = functionScopedVariables.reduce(
          (result, variable) => {
            const references = variable.references.filter((reference) =>
              inScope(callback, reference.from)
            )

            if (references.length === 0) {
              return result
            }

            return [...result, { variable, references }]
          },
          []
        )

        usedInsideEval.forEach(({ variable, references }) => {
          references.forEach((reference) => {
            context.report({
              node: reference.identifier,
              ...getMessage(variable),
            })
          })
        })
      },
    }
  },
}

const inScope = (scope, currentScope) => {
  if (currentScope.block === scope) {
    return true
  }

  if (!currentScope.upper) {
    return false
  }

  return inScope(scope, currentScope.upper)
}

const getVariables = (scope) => {
  if (!scope.upper) {
    return scope.variables
  }

  return [...scope.variables, ...getVariables(scope.upper)]
}

const getMessage = (variable) => {
  const [definition] = variable.defs

  const data = {
    variableName: variable.name,
  }

  if (isImport(definition)) {
    return {
      message:
        'Cannot import "{{ variableName }}" from "{{ moduleName }}" because it is not in the scope of the $eval method.',
      data: {
        ...data,
        moduleName: definition.parent.source.value,
      },
    }
  }

  if (isRequire(definition)) {
    const {
      arguments: [module],
    } = definition.node.init

    return {
      message:
        'Cannot import "{{ variableName }}" from "{{ moduleName }}" because it is not in the scope of the $eval method.',
      data: {
        ...data,
        moduleName: module.value,
      },
    }
  }

  if (isFunction(definition)) {
    return {
      message: `The function "{{ variableName }}" is defined outside the scope of the $eval method.`,
      data,
    }
  }

  return {
    message:
      'The variable "{{ variableName }}" is defined outside the scope of the $eval method.',
    data,
  }
}

const isImport = (definition) => definition.type === 'ImportBinding'

const isRequire = (definition) => {
  const initialValue = definition.node.init

  if (!initialValue) {
    return false
  }

  if (initialValue.type !== 'CallExpression') {
    return false
  }

  return initialValue.callee.name === 'require'
}

const isFunction = (definition) => {
  if (definition.type === 'FunctionName') {
    return true
  }

  if (!definition.node.init) {
    return false
  }

  return definition.node.init.type === 'ArrowFunctionExpression'
}
