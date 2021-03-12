import { IVar } from '../var'
import { ES5Map } from '../type'
export declare const BinaryExpressionOperatorEvaluateMap: {
  '==': (a: any, b: any) => boolean
  '!=': (a: any, b: any) => boolean
  '===': (a: any, b: any) => boolean
  '!==': (a: any, b: any) => boolean
  '<': (a: any, b: any) => boolean
  '<=': (a: any, b: any) => boolean
  '>': (a: any, b: any) => boolean
  '>=': (a: any, b: any) => boolean
  '<<': (a: any, b: any) => number
  '>>': (a: any, b: any) => number
  '>>>': (a: any, b: any) => number
  '+': (a: any, b: any) => any
  '-': (a: any, b: any) => number
  '*': (a: any, b: any) => number
  '/': (a: any, b: any) => number
  '%': (a: any, b: any) => number
  '|': (a: any, b: any) => number
  '^': (a: any, b: any) => number
  '&': (a: any, b: any) => number
  in: (a: any, b: any) => boolean
  instanceof: (a: any, b: any) => boolean
}
export declare const AssignmentExpressionEvaluateMap: {
  '=': ($var: IVar, v: any) => any
  '+=': ($var: IVar, v: any) => any
  '-=': ($var: IVar, v: any) => any
  '*=': ($var: IVar, v: any) => any
  '**=': ($var: IVar, v: any) => any
  '/=': ($var: IVar, v: any) => any
  '%=': ($var: IVar, v: any) => any
  '<<=': ($var: IVar, v: any) => any
  '>>=': ($var: IVar, v: any) => any
  '>>>=': ($var: IVar, v: any) => any
  '|=': ($var: IVar, v: any) => any
  '^=': ($var: IVar, v: any) => any
  '&=': ($var: IVar, v: any) => any
}
export declare const es5: ES5Map
