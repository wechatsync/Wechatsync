import { Scope } from './scope'
import { Kind, KindType } from './type'
export interface IVar {
  kind: Kind | KindType
  readonly value: any
  set(value: any): void
}
export declare class Var<T> implements IVar {
  kind: Kind | KindType
  name: string
  private val
  scope: Scope
  constructor(kind: Kind | KindType, name: string, val: T, scope: Scope)
  get value(): T
  set(value: any): void
}
