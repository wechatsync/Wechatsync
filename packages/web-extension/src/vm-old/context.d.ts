export interface ISandBox {
  [k: string]: any
}
export declare const DEFAULT_CONTEXT: ISandBox
export declare class Context {
  constructor(externalContext?: ISandBox)
}
