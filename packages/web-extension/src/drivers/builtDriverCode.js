import * as originalCode from './driver'

function objectToString(obj) {
  let str = '{'
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      str += key + ':' + String(obj[key]) + ','
    }
  }
  str += str.slice(0, -1) + "}"
  return str;
}

const builtCode = `let modules =`
+ objectToString(originalCode) + `for (var k in modules) exports[k] = modules[k];`;

export default builtCode;