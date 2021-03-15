export interface IPoint {
  line: number
  column: number
}
export interface ILocation {
  start: IPoint
  end: IPoint
}
export interface IPen {
  stack: string
  filename: string
  location: ILocation
}
export declare class Stack {
  private limitSize
  private stackList
  private items
  constructor(limitSize?: number)
  enter(stackName: string): void
  leave(): void
  push(item: IPen): void
  get currentStackName(): string
  peek(): IPen
  isEmpty(): boolean
  clear(): void
  get raw(): string
  get size(): number
}
