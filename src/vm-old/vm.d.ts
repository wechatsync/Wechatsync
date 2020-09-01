import { Context, ISandBox } from './context'
import { presetMap } from './type'
/**
 * Run the code in context
 * @export
 * @param {string} code
 * @param {Context} context
 * @returns
 */
export declare function runInContext(
  code: string,
  context: Context,
  preset?: presetMap
): any
/**
 * Create a context
 * @export
 * @param {ISandBox} [sandbox={}]
 * @returns {Context}
 */
export declare function createContext(sandbox?: ISandBox): Context
declare const _default: {
  runInContext: typeof runInContext
  createContext: typeof createContext
}
export default _default
