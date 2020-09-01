import { Context } from './context'
import { Kind, KindType, ScopeType } from './type'
import { Var } from './var'
export declare class Scope {
  readonly type: ScopeType
  parent: Scope | null
  /**
   * var a = 2;
   *
   * for(var i=0;i<a;i++){
   *   var b = i;
   * }
   *
   * // in here, b is not defined in the top scope.
   * // but it defined in for loop
   * // mark invasive = true. then var keyword can defined variables in parent scope
   * console.log(b); // 1
   *
   */
  invasive: boolean
  /**
   * The level of scope.
   * The top scope's level is 0.
   * every child scope will increase 1
   */
  level: number
  context: Context
  isolated: boolean
  origin: Scope | null
  private content
  constructor(type: ScopeType, parent: Scope | null)
  get length(): number
  get raw(): {
    [key: string]: any
  }
  /**
   * Set context of a scope
   * @param {Context} context
   * @memberof Scope
   */
  setContext(context: Context): void
  /**
   * check the scope have binding a var
   * @param {string} varName
   * @returns {(Var<any> | void)}
   * @memberof Scope
   */
  hasBinding(varName: string): Var<any> | void
  /**
   * check scope have binding a var in current scope
   * @param {string} varName
   * @returns {(Var<any> | void)}
   * @memberof Scope
   */
  hasOwnBinding(varName: string): Var<any> | void
  /**
   * get root scope
   * @readonly
   * @type {Scope}
   * @memberof Scope
   */
  get global(): Scope
  /**
   * Declaring variables with let
   * @param {string} varName
   * @param {*} value
   * @returns {boolean}
   * @memberof Scope
   */
  let(varName: string, value: any): boolean
  /**
   * Declaring variables with const
   * @param {string} varName
   * @param {*} value
   * @returns {boolean}
   * @memberof Scope
   */
  const(varName: string, value: any): boolean
  /**
   * Declaring variables with var
   * @param {string} varName
   * @param {*} value
   * @returns {boolean}
   * @memberof Scope
   */
  var(varName: string, value: any): boolean
  /**
   * Declaring variables
   * @param {Kind} kind
   * @param {string} rawName
   * @param {*} value
   * @returns {boolean}
   * @memberof Scope
   */
  declare(kind: Kind | KindType, rawName: string, value: any): boolean
  /**
   * Delete variables
   * @param {string} varName
   * @memberof Scope
   */
  del(varName: string): boolean
  /**
   * Create a child scope
   * @param {ScopeType} type
   * @returns {Scope}
   * @memberof Scope
   */
  createChild(type: ScopeType): Scope
  /**
   * Fork a scope
   * @param {ScopeType} [type]
   * @returns {Scope}
   * @memberof Scope
   */
  fork(type?: ScopeType): Scope
  /**
   * Locate a scope with var
   * @param {string} varName
   * @returns {(Scope | null)}
   * @memberof Scope
   */
  locate(varName: string): Scope | void
}
