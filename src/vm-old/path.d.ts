import { Node } from 'babel-types'
import { Scope } from './scope'
import { ScopeType, EvaluateFunc, presetMap } from './type'
import { Stack } from './stack'
export interface ICtx {
  [k: string]: any
}
export declare class Path<T extends Node> {
  node: T
  parent: Path<Node> | null
  scope: Scope
  ctx: ICtx
  stack: Stack
  evaluate: EvaluateFunc
  preset: presetMap
  constructor(
    node: T,
    parent: Path<Node> | null,
    scope: Scope,
    ctx: ICtx,
    stack: Stack
  )
  /**
   * Generate child scope
   * @template Child
   * @param {Child} node
   * @param {(ScopeType | Scope)} [scope]
   * @param {ICtx} [ctx={}]
   * @returns {Path<Child>}
   * @memberof Path
   */
  createChild<Child extends Node>(
    node: Child,
    scope?: ScopeType | Scope,
    ctx?: ICtx
  ): Path<Child>
  /**
   * Find scope scope with type
   * @param {string} type
   * @returns {(Path<Node> | null)}
   * @memberof Path
   */
  findParent(type: string): Path<Node> | null
}
