import {
  ArrayExpression,
  ArrayPattern,
  AssignmentPattern,
  CallExpression,
  ClassMethod,
  ClassProperty,
  FunctionDeclaration,
  Identifier,
  ImportDefaultSpecifier,
  ImportSpecifier,
  MemberExpression,
  Node,
  ObjectExpression,
  ObjectPattern,
  ObjectProperty,
  RestElement,
  SpreadElement,
  VariableDeclaration,
  StringLiteral,
} from 'babel-types'
export declare function isStringLiteral(node: Node): node is StringLiteral
export declare function isArrayExpression(node: Node): node is ArrayExpression
export declare function isObjectExpression(node: Node): node is ObjectExpression
export declare function isFunctionDeclaration(
  node: Node
): node is FunctionDeclaration
export declare function isVariableDeclaration(
  node: Node
): node is VariableDeclaration
export declare function isIdentifier(node: Node): node is Identifier
export declare function isObjectPattern(node: Node): node is ObjectPattern
export declare function isObjectProperty(node: Node): node is ObjectProperty
export declare function isArrayPattern(node: Node): node is ArrayPattern
export declare function isMemberExpression(node: Node): node is MemberExpression
export declare function isSpreadElement(node: Node): node is SpreadElement
export declare function isAssignmentPattern(
  node: Node
): node is AssignmentPattern
export declare function isRestElement(node: Node): node is RestElement
export declare function isClassMethod(node: Node): node is ClassMethod
export declare function isClassProperty(node: Node): node is ClassProperty
export declare function isCallExpression(node: Node): node is CallExpression
export declare function isImportDefaultSpecifier(
  node: Node
): node is ImportDefaultSpecifier
export declare function isImportSpecifier(node: Node): node is ImportSpecifier
