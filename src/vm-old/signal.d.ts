export declare type SignalKind = 'break' | 'continue' | 'return'
export declare class Signal {
  kind: SignalKind
  value?: any
  static is(v: any, type: SignalKind): v is Signal
  static isContinue(v: any): v is Signal
  static isBreak(v: any): v is Signal
  static isReturn(v: any): v is Signal
  constructor(kind: SignalKind, value?: any)
}
