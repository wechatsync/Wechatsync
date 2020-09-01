!(function (t, e) {
  if ('object' == typeof exports && 'object' == typeof module)
    module.exports = e(require('babel-types'))
  else if ('function' == typeof define && define.amd) define(['babel-types'], e)
  else {
    var s =
      'object' == typeof exports
        ? e(require('babel-types'))
        : e(t['babel-types'])
    for (var i in s) ('object' == typeof exports ? exports : t)[i] = s[i]
  }
})(global, function (t) {
  return (function (t) {
    var e = {}
    function s(i) {
      if (e[i]) return e[i].exports
      var r = (e[i] = { i: i, l: !1, exports: {} })
      return t[i].call(r.exports, r, r.exports, s), (r.l = !0), r.exports
    }
    return (
      (s.m = t),
      (s.c = e),
      (s.d = function (t, e, i) {
        s.o(t, e) || Object.defineProperty(t, e, { enumerable: !0, get: i })
      }),
      (s.r = function (t) {
        'undefined' != typeof Symbol &&
          Symbol.toStringTag &&
          Object.defineProperty(t, Symbol.toStringTag, {
            value: 'Module',
          }),
          Object.defineProperty(t, '__esModule', { value: !0 })
      }),
      (s.t = function (t, e) {
        if ((1 & e && (t = s(t)), 8 & e)) return t
        if (4 & e && 'object' == typeof t && t && t.__esModule) return t
        var i = Object.create(null)
        if (
          (s.r(i),
          Object.defineProperty(i, 'default', {
            enumerable: !0,
            value: t,
          }),
          2 & e && 'string' != typeof t)
        )
          for (var r in t)
            s.d(
              i,
              r,
              function (e) {
                return t[e]
              }.bind(null, r)
            )
        return i
      }),
      (s.n = function (t) {
        var e =
          t && t.__esModule
            ? function () {
                return t.default
              }
            : function () {
                return t
              }
        return s.d(e, 'a', e), e
      }),
      (s.o = function (t, e) {
        return Object.prototype.hasOwnProperty.call(t, e)
      }),
      (s.p = ''),
      s((s.s = 10))
    )
  })([
    function (t, e, s) {
      'use strict'
      Object.defineProperty(e, '__esModule', { value: !0 }),
        (e.THIS = 'this'),
        (e.MODULE = 'module'),
        (e.EXPORTS = 'exports'),
        (e.REQUIRE = 'require'),
        (e.UNDEFINED = 'undefined'),
        (e.ARGUMENTS = 'arguments'),
        (e.NEW = 'new'),
        (e.ANONYMOUS = 'anonymous')
    },
    function (t, e, s) {
      'use strict'
      var i, r
      Object.defineProperty(e, '__esModule', { value: !0 }),
        (function (t) {
          ;(t[(t.Root = 0)] = 'Root'),
            (t[(t.Function = 1)] = 'Function'),
            (t[(t.Method = 2)] = 'Method'),
            (t[(t.Constructor = 3)] = 'Constructor'),
            (t[(t.For = 4)] = 'For'),
            (t[(t.ForChild = 5)] = 'ForChild'),
            (t[(t.ForIn = 6)] = 'ForIn'),
            (t[(t.ForOf = 7)] = 'ForOf'),
            (t[(t.While = 8)] = 'While'),
            (t[(t.DoWhile = 9)] = 'DoWhile'),
            (t[(t.Do = 10)] = 'Do'),
            (t[(t.Switch = 11)] = 'Switch'),
            (t[(t.If = 12)] = 'If'),
            (t[(t.ElseIf = 13)] = 'ElseIf'),
            (t[(t.Object = 14)] = 'Object'),
            (t[(t.Try = 15)] = 'Try'),
            (t[(t.Catch = 16)] = 'Catch'),
            (t[(t.Finally = 17)] = 'Finally'),
            (t[(t.Class = 18)] = 'Class'),
            (t[(t.Block = 19)] = 'Block')
        })((r = e.ScopeType || (e.ScopeType = {}))),
        (e.isolatedScopeMap =
          (((i = {})[r.Function] = !0),
          (i[r.Constructor] = !0),
          (i[r.Method] = !0),
          (i[r.Object] = !0),
          i)),
        (function (t) {
          ;(t.Var = 'var'), (t.Const = 'const'), (t.Let = 'let')
        })(e.Kind || (e.Kind = {})),
        (function (t) {
          ;(t.es5 = 'es5'),
            (t.es2015 = 'es2015'),
            (t.es2016 = 'es2016'),
            (t.es2017 = 'es2017'),
            (t.es2018 = 'es2018'),
            (t.env = 'env')
        })(e.presetMap || (e.presetMap = {}))
    },
    function (t, e, s) {
      'use strict'
      function i(t, e) {
        return new TypeError(t + ' is not ' + e)
      }
      Object.defineProperty(e, '__esModule', { value: !0 }),
        (e.ErrNotDefined = function (t) {
          return new ReferenceError(t + ' is not defined')
        }),
        (e.ErrImplement = function (t) {
          return new SyntaxError("Not implement for '" + t + "' syntax")
        }),
        (e.ErrDuplicateDeclard = function (t) {
          return new SyntaxError(
            "Identifier '" + t + "' has already been declared"
          )
        }),
        (e.ErrIsNot = i),
        (e.ErrInvalidIterable = function (t) {
          return i(t, 'iterable')
        }),
        (e.ErrNoSuper = function () {
          return new ReferenceError(
            "Must call super constructor in derived class before accessing 'this' or returning from derived constructor"
          )
        }),
        (e.ErrIsNotFunction = function (t) {
          return new TypeError(t + ' is not a function')
        }),
        (e.ErrCanNotReadProperty = function (t, e) {
          return new TypeError("Cannot read property '" + t + "' of " + e)
        })
    },
    function (t, e, s) {
      'use strict'
      var i,
        r =
          (this && this.__assign) ||
          function () {
            return (r =
              Object.assign ||
              function (t) {
                for (var e, s = 1, i = arguments.length; s < i; s++)
                  for (var r in (e = arguments[s]))
                    Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r])
                return t
              }).apply(this, arguments)
          }
      Object.defineProperty(e, '__esModule', { value: !0 })
      var a = s(0)
      ;(e.DEFAULT_CONTEXT =
        (((i = {
          Function: Function,
          Array: Array,
          Boolean: Boolean,
          clearInterval: clearInterval,
          clearTimeout: clearTimeout,
          console: console,
          Date: Date,
          decodeURI: decodeURI,
          decodeURIComponent: decodeURIComponent,
          encodeURI: encodeURI,
          encodeURIComponent: encodeURIComponent,
          Error: Error,
          escape: escape,
          eval: eval,
          EvalError: EvalError,
          Infinity: 1 / 0,
          isFinite: isFinite,
          isNaN: isNaN,
          JSON: JSON,
          Math: Math,
          NaN: NaN,
          Number: Number,
        }).null = null),
        (i[a.UNDEFINED] = void 0),
        (i.Object = Object),
        (i.parseFloat = parseFloat),
        (i.parseInt = parseInt),
        (i.RangeError = RangeError),
        (i.ReferenceError = ReferenceError),
        (i.RegExp = RegExp),
        (i.setInterval = setInterval),
        (i.setTimeout = setTimeout),
        (i.String = String),
        (i.SyntaxError = SyntaxError),
        (i.TypeError = TypeError),
        (i.unescape = unescape),
        (i.URIError = URIError),
        i)),
        typeof Promise !== a.UNDEFINED && (e.DEFAULT_CONTEXT.Promise = Promise),
        typeof Proxy !== a.UNDEFINED && (e.DEFAULT_CONTEXT.Proxy = Proxy),
        typeof Reflect !== a.UNDEFINED && (e.DEFAULT_CONTEXT.Reflect = Reflect),
        typeof Symbol !== a.UNDEFINED && (e.DEFAULT_CONTEXT.Symbol = Symbol),
        typeof Set !== a.UNDEFINED && (e.DEFAULT_CONTEXT.Set = Set),
        typeof WeakSet !== a.UNDEFINED && (e.DEFAULT_CONTEXT.WeakSet = WeakSet),
        typeof Map !== a.UNDEFINED && (e.DEFAULT_CONTEXT.Map = Map),
        typeof WeakMap !== a.UNDEFINED && (e.DEFAULT_CONTEXT.WeakMap = WeakMap),
        typeof ArrayBuffer !== a.UNDEFINED &&
          (e.DEFAULT_CONTEXT.ArrayBuffer = ArrayBuffer),
        typeof SharedArrayBuffer !== a.UNDEFINED &&
          (e.DEFAULT_CONTEXT.ArrayBuffer = SharedArrayBuffer),
        typeof DataView !== a.UNDEFINED &&
          (e.DEFAULT_CONTEXT.ArrayBuffer = DataView),
        typeof Atomics !== a.UNDEFINED && (e.DEFAULT_CONTEXT.Atomics = Atomics),
        typeof Float32Array !== a.UNDEFINED &&
          (e.DEFAULT_CONTEXT.Float32Array = Float32Array),
        typeof Float64Array !== a.UNDEFINED &&
          (e.DEFAULT_CONTEXT.Float64Array = Float64Array),
        typeof Int16Array !== a.UNDEFINED &&
          (e.DEFAULT_CONTEXT.Int16Array = Int16Array),
        typeof Int32Array !== a.UNDEFINED &&
          (e.DEFAULT_CONTEXT.Int32Array = Int32Array),
        typeof Int8Array !== a.UNDEFINED &&
          (e.DEFAULT_CONTEXT.Int32Array = Int8Array),
        typeof Intl !== a.UNDEFINED && (e.DEFAULT_CONTEXT.Intl = Intl),
        typeof Uint16Array !== a.UNDEFINED &&
          (e.DEFAULT_CONTEXT.Uint16Array = Uint16Array),
        typeof Uint32Array !== a.UNDEFINED &&
          (e.DEFAULT_CONTEXT.Uint32Array = Uint32Array),
        typeof Uint8Array !== a.UNDEFINED &&
          (e.DEFAULT_CONTEXT.Uint8Array = Uint8Array),
        typeof Uint8ClampedArray !== a.UNDEFINED &&
          (e.DEFAULT_CONTEXT.Uint8ClampedArray = Uint8ClampedArray),
        typeof WebAssembly !== a.UNDEFINED &&
          (e.DEFAULT_CONTEXT.WebAssembly = WebAssembly)
      var n = function (t) {
        void 0 === t && (t = {})
        var s = r(r({}, e.DEFAULT_CONTEXT), t)
        for (var i in s) s.hasOwnProperty(i) && (this[i] = s[i])
      }
      e.Context = n
    },
    function (t, e, s) {
      'use strict'
      var i =
        (this && this.__spreadArrays) ||
        function () {
          for (var t = 0, e = 0, s = arguments.length; e < s; e++)
            t += arguments[e].length
          var i = Array(t),
            r = 0
          for (e = 0; e < s; e++)
            for (var a = arguments[e], n = 0, o = a.length; n < o; n++, r++)
              i[r] = a[n]
          return i
        }
      Object.defineProperty(e, '__esModule', { value: !0 })
      var r = s(13),
        a = s(5),
        n = s(2),
        o = s(6),
        h = s(1),
        c = s(7),
        l = s(0),
        p = s(8),
        u = s(9),
        f = s(14),
        d = s(15)
      function m(t, e, s) {
        return (
          e.push({
            filename: l.ANONYMOUS,
            stack: e.currentStackName,
            location: s.loc,
          }),
          (t.stack = t.toString() + '\n' + e.raw),
          t
        )
      }
      ;(e.BinaryExpressionOperatorEvaluateMap = {
        '==': function (t, e) {
          return t == e
        },
        '!=': function (t, e) {
          return t != e
        },
        '===': function (t, e) {
          return t === e
        },
        '!==': function (t, e) {
          return t !== e
        },
        '<': function (t, e) {
          return t < e
        },
        '<=': function (t, e) {
          return t <= e
        },
        '>': function (t, e) {
          return t > e
        },
        '>=': function (t, e) {
          return t >= e
        },
        '<<': function (t, e) {
          return t << e
        },
        '>>': function (t, e) {
          return t >> e
        },
        '>>>': function (t, e) {
          return t >>> e
        },
        '+': function (t, e) {
          return t + e
        },
        '-': function (t, e) {
          return t - e
        },
        '*': function (t, e) {
          return t * e
        },
        '/': function (t, e) {
          return t / e
        },
        '%': function (t, e) {
          return t % e
        },
        '|': function (t, e) {
          return t | e
        },
        '^': function (t, e) {
          return t ^ e
        },
        '&': function (t, e) {
          return t & e
        },
        in: function (t, e) {
          return t in e
        },
        instanceof: function (t, e) {
          return t instanceof e
        },
      }),
        (e.AssignmentExpressionEvaluateMap = {
          '=': function (t, e) {
            return t.set(e), e
          },
          '+=': function (t, e) {
            return t.set(t.value + e), t.value
          },
          '-=': function (t, e) {
            return t.set(t.value - e), t.value
          },
          '*=': function (t, e) {
            return t.set(t.value * e), t.value
          },
          '**=': function (t, e) {
            return t.set(Math.pow(t.value, e)), t.value
          },
          '/=': function (t, e) {
            return t.set(t.value / e), t.value
          },
          '%=': function (t, e) {
            return t.set(t.value % e), t.value
          },
          '<<=': function (t, e) {
            return t.set(t.value << e), t.value
          },
          '>>=': function (t, e) {
            return t.set(t.value >> e), t.value
          },
          '>>>=': function (t, e) {
            return t.set(t.value >>> e), t.value
          },
          '|=': function (t, e) {
            return t.set(t.value | e), t.value
          },
          '^=': function (t, e) {
            return t.set(t.value ^ e), t.value
          },
          '&=': function (t, e) {
            return t.set(t.value & e), t.value
          },
        }),
        (e.es5 = {
          File: function (t) {
            t.evaluate(t.createChild(t.node.program))
          },
          Program: function (t) {
            for (
              var e = t.node, s = t.scope, i = 0, r = e.body;
              i < r.length;
              i++
            ) {
              var a = r[i]
              if (p.isFunctionDeclaration(a)) t.evaluate(t.createChild(a))
              else if (p.isVariableDeclaration(a))
                for (var n = 0, o = a.declarations; n < o.length; n++) {
                  var c = o[n]
                  a.kind === h.Kind.Var && s.var(c.id.name, void 0)
                }
            }
            for (var l = 0, u = e.body; l < u.length; l++) {
              a = u[l]
              p.isFunctionDeclaration(a) || t.evaluate(t.createChild(a))
            }
          },
          Identifier: function (t) {
            var e = t.node,
              s = t.scope,
              i = t.stack
            if (e.name !== l.UNDEFINED) {
              var r = s.hasBinding(e.name)
              if (r) return r.value
              throw m(n.ErrNotDefined(e.name), i, e)
            }
          },
          RegExpLiteral: function (t) {
            var e = t.node
            return new RegExp(e.pattern, e.flags)
          },
          StringLiteral: function (t) {
            return t.node.value
          },
          NumericLiteral: function (t) {
            return t.node.value
          },
          BooleanLiteral: function (t) {
            return t.node.value
          },
          NullLiteral: function (t) {
            return null
          },
          IfStatement: function (t) {
            var e = t.scope.createChild(h.ScopeType.If)
            return (
              (e.invasive = !0),
              (e.isolated = !1),
              t.evaluate(t.createChild(t.node.test, e))
                ? t.evaluate(t.createChild(t.node.consequent, e))
                : t.node.alternate
                ? t.evaluate(t.createChild(t.node.alternate, e))
                : void 0
            )
          },
          EmptyStatement: function (t) {},
          BlockStatement: function (t) {
            var e,
              s = t.node,
              i = t.scope,
              r = i.isolated ? i.createChild(h.ScopeType.Block) : i
            i.isolated
              ? ((r = i.createChild(h.ScopeType.Block)).invasive = !0)
              : (r = i),
              (r.isolated = !0)
            for (var a = 0, n = s.body; a < n.length; a++) {
              var o = n[a]
              if (p.isFunctionDeclaration(o)) t.evaluate(t.createChild(o))
              else if (p.isVariableDeclaration(o))
                for (var l = 0, u = o.declarations; l < u.length; l++) {
                  var f = u[l]
                  if (o.kind === h.Kind.Var)
                    if (!i.isolated && i.invasive)
                      (function t(e) {
                        return e.parent
                          ? e.parent.invasive
                            ? t(e.parent)
                            : e.parent
                          : e
                      })(i).parent.var(f.id.name, void 0)
                    else i.var(f.id.name, void 0)
                }
            }
            for (var d = 0, m = s.body; d < m.length; d++) {
              o = m[d]
              var y = (e = t.evaluate(t.createChild(o, r)))
              if (y instanceof c.Signal) return y
            }
            return e
          },
          DebuggerStatement: function (t) {},
          LabeledStatement: function (t) {
            var e = t.node.label
            return t.evaluate(
              t.createChild(t.node.body, t.scope, {
                labelName: e.name,
              })
            )
          },
          BreakStatement: function (t) {
            var e = t.node.label
            return new c.Signal('break', e ? e.name : void 0)
          },
          ContinueStatement: function (t) {
            var e = t.node.label
            return new c.Signal('continue', e ? e.name : void 0)
          },
          ReturnStatement: function (t) {
            return new c.Signal(
              'return',
              t.node.argument
                ? t.evaluate(t.createChild(t.node.argument))
                : void 0
            )
          },
          VariableDeclaration: function (t) {
            for (
              var e = t.node,
                s = t.scope,
                i = t.stack,
                r = e.kind,
                a = function (a) {
                  var o = {}
                  if (p.isIdentifier(a.id))
                    o[a.id.name] = a.init
                      ? t.evaluate(t.createChild(a.init))
                      : void 0
                  else if (p.isObjectPattern(a.id)) {
                    for (
                      var c = [], l = 0, u = a.id.properties;
                      l < u.length;
                      l++
                    ) {
                      var f = u[l]
                      p.isObjectProperty(f) &&
                        c.push({
                          key: f.key.name,
                          alias: f.value.name,
                        })
                    }
                    for (
                      var d = t.evaluate(t.createChild(a.init)), y = 0, v = c;
                      y < v.length;
                      y++
                    ) {
                      var x = v[y]
                      ;(x.key in d) && (o[x.alias] = d[x.key])
                    }
                  } else {
                    if (!p.isArrayPattern(a.id)) throw e
                    var b = t.evaluate(t.createChild(a.init))
                    if (!b[Symbol.iterator])
                      throw m(
                        n.ErrInvalidIterable('{(intermediate value)}'),
                        i,
                        a.init
                      )
                    a.id.elements.forEach(function (t, e) {
                      if (p.isIdentifier(t)) {
                        var s = t.typeAnnotation
                            ? t.typeAnnotation.typeAnnotation.id.name
                            : t.name,
                          i = b[e]
                        o[s] = i
                      }
                    })
                  }
                  for (var g in o) {
                    if (s.invasive && r === h.Kind.Var)
                      (function t(e) {
                        return e.parent
                          ? e.parent.invasive
                            ? t(e.parent)
                            : e.parent
                          : e
                      })(s).declare(r, g, o[g])
                    else s.declare(r, g, o[g])
                  }
                },
                o = 0,
                c = e.declarations;
              o < c.length;
              o++
            ) {
              a(c[o])
            }
          },
          VariableDeclarator: function (t) {
            var e = t.node,
              s = t.scope
            if (!p.isObjectPattern(e.id)) {
              if (p.isObjectExpression(e.init)) {
                var i = e.id.name
                u = t.evaluate(t.createChild(e.init))
                return s.var(i, u), u
              }
              throw e
            }
            var r = s.createChild(h.ScopeType.Object)
            p.isObjectExpression(e.init) && t.evaluate(t.createChild(e.init, r))
            for (var a = 0, n = e.id.properties; a < n.length; a++) {
              var o = n[a]
              if (p.isObjectProperty(o)) {
                var c = o.id.name,
                  l = r.hasBinding(c),
                  u = l ? l.value : void 0
                return s.var(c, u), u
              }
            }
          },
          FunctionDeclaration: function (t) {
            var s,
              i = t.node,
              r = t.scope,
              a = i.id.name
            ;(s = i.async
              ? function () {
                  var e = this
                  return o.__awaiter(this, void 0, void 0, function () {
                    var s = e
                    return o.__generator(s, function e(s) {
                      var r = i.body.body[s.label]
                      if (!r) return [2, void 0]
                      var a = { call: !1, value: null },
                        n = t.evaluate(
                          t.createChild(r, t.scope, {
                            next: function (t) {
                              ;(a.value = t), (a.call = !0), s.sent()
                            },
                          })
                        )
                      return c.Signal.isReturn(n)
                        ? [2, n.value]
                        : a.call
                        ? [4, a.value]
                        : (s.label++, e(s))
                    })
                  })
                }
              : i.generator
              ? function () {
                  return o.__generator(this, function e(s) {
                    var r = i.body.body[s.label]
                    if (!r) return [2, void 0]
                    var a = { call: !1, value: null },
                      n = t.evaluate(
                        t.createChild(r, t.scope, {
                          next: function (t) {
                            ;(a.value = t), (a.call = !0), s.sent()
                          },
                        })
                      )
                    return c.Signal.isReturn(n)
                      ? [2, n.value]
                      : a.call
                      ? [4, a.value]
                      : (s.label++, e(s))
                  })
                }
              : e.es5.FunctionExpression(t.createChild(i))),
              u.defineFunctionLength(s, i.params.length || 0),
              u.defineFunctionName(s, a),
              r.var(a, s)
          },
          ExpressionStatement: function (t) {
            return t.evaluate(t.createChild(t.node.expression))
          },
          ForStatement: function (t) {
            var e = t.node,
              s = t.scope,
              i = t.ctx.labelName,
              r = s.createChild(h.ScopeType.For)
            function a() {
              e.update && t.evaluate(t.createChild(e.update, r))
            }
            for (
              r.invasive = !0, e.init && t.evaluate(t.createChild(e.init, r));
              ;

            ) {
              var n = r.fork(h.ScopeType.ForChild)
              if (
                ((n.isolated = !1),
                e.test && !t.evaluate(t.createChild(e.test, r)))
              )
                break
              var o = t.evaluate(
                t.createChild(e.body, n, { labelName: void 0 })
              )
              if (c.Signal.isBreak(o)) {
                if (!o.value) break
                if (o.value === i) break
                return o
              }
              if (c.Signal.isContinue(o)) {
                if (!o.value) continue
                if (o.value === i) {
                  a()
                  continue
                }
                return o
              }
              if (c.Signal.isReturn(o)) return o
              a()
            }
          },
          ForInStatement: function (t) {
            var e = t.node,
              s = t.scope,
              i = t.ctx,
              r = e.left.kind,
              a = e.left.declarations[0].id.name,
              n = i.labelName,
              o = t.evaluate(t.createChild(e.right))
            for (var l in o)
              if (Object.hasOwnProperty.call(o, l)) {
                var p = s.createChild(h.ScopeType.ForIn)
                ;(p.invasive = !0), (p.isolated = !1), p.declare(r, a, l)
                var u = t.evaluate(t.createChild(e.body, p))
                if (c.Signal.isBreak(u)) {
                  if (!u.value) break
                  if (u.value === n) break
                  return u
                }
                if (c.Signal.isContinue(u)) {
                  if (!u.value) continue
                  if (u.value === n) continue
                  return u
                }
                if (c.Signal.isReturn(u)) return u
              }
          },
          DoWhileStatement: function (t) {
            var e = t.node,
              s = t.scope,
              i = t.ctx.labelName
            do {
              var r = s.createChild(h.ScopeType.DoWhile)
              ;(r.invasive = !0), (r.isolated = !1)
              var a = t.evaluate(t.createChild(e.body, r))
              if (c.Signal.isBreak(a)) {
                if (!a.value) break
                if (a.value === i) break
                return a
              }
              if (c.Signal.isContinue(a)) {
                if (!a.value) continue
                if (a.value === i) continue
                return a
              }
              if (c.Signal.isReturn(a)) return a
            } while (t.evaluate(t.createChild(e.test)))
          },
          WhileStatement: function (t) {
            for (
              var e = t.node, s = t.scope, i = t.ctx.labelName;
              t.evaluate(t.createChild(e.test));

            ) {
              var r = s.createChild(h.ScopeType.While)
              ;(r.invasive = !0), (r.isolated = !1)
              var a = t.evaluate(t.createChild(e.body, r))
              if (c.Signal.isBreak(a)) {
                if (!a.value) break
                if (a.value === i) break
                return a
              }
              if (c.Signal.isContinue(a)) {
                if (!a.value) continue
                if (a.value === i) continue
                return a
              }
              if (c.Signal.isReturn(a)) return a
            }
          },
          ThrowStatement: function (t) {
            throw t.evaluate(t.createChild(t.node.argument))
          },
          CatchClause: function (t) {
            return t.evaluate(t.createChild(t.node.body))
          },
          TryStatement: function (t) {
            var e = t.node,
              s = t.scope
            try {
              var i = s.createChild(h.ScopeType.Try)
              return (
                (i.invasive = !0),
                (i.isolated = !1),
                t.evaluate(t.createChild(e.block, i))
              )
            } catch (i) {
              var r = e.handler.param,
                a = s.createChild(h.ScopeType.Catch)
              return (
                (a.invasive = !0),
                (a.isolated = !1),
                a.const(r.name, i),
                t.evaluate(t.createChild(e.handler, a))
              )
            } finally {
              if (e.finalizer) {
                var n = s.createChild(h.ScopeType.Finally)
                return (
                  (n.invasive = !0),
                  (n.isolated = !1),
                  t.evaluate(t.createChild(e.finalizer, n))
                )
              }
            }
          },
          SwitchStatement: function (t) {
            var e = t.node,
              s = t.scope,
              i = t.evaluate(t.createChild(e.discriminant)),
              r = s.createChild(h.ScopeType.Switch)
            ;(r.invasive = !0), (r.isolated = !1)
            for (var a = !1, n = 0, o = e.cases; n < o.length; n++) {
              var l = o[n]
              if (
                (a ||
                  (l.test && i !== t.evaluate(t.createChild(l.test, r))) ||
                  (a = !0),
                a)
              ) {
                var p = t.evaluate(t.createChild(l, r))
                if (c.Signal.isBreak(p)) break
                if (c.Signal.isContinue(p)) return p
                if (c.Signal.isReturn(p)) return p
              }
            }
          },
          SwitchCase: function (t) {
            for (var e = 0, s = t.node.consequent; e < s.length; e++) {
              var i = s[e],
                r = t.evaluate(t.createChild(i))
              if (r instanceof c.Signal) return r
            }
          },
          UpdateExpression: function (t) {
            var e,
              s = t.node,
              i = t.scope,
              r = t.stack,
              a = s.prefix
            if (p.isIdentifier(s.argument)) {
              var o = s.argument.name,
                c = i.hasBinding(o)
              if (!c) throw m(n.ErrNotDefined(o), r, s.argument)
              e = c
            } else if (p.isMemberExpression(s.argument)) {
              var l = s.argument,
                u = t.evaluate(t.createChild(l.object)),
                f = l.computed
                  ? t.evaluate(t.createChild(l.property))
                  : l.property.name
              e = {
                kind: h.Kind.Const,
                set: function (t) {
                  u[f] = t
                },
                get value() {
                  return u[f]
                },
              }
            }
            return {
              '--': function (t) {
                return e.set(t - 1), a ? --t : t--
              },
              '++': function (t) {
                return e.set(t + 1), a ? ++t : t++
              },
            }[s.operator](t.evaluate(t.createChild(s.argument)))
          },
          ThisExpression: function (t) {
            var e = t.scope
            if (e.type === h.ScopeType.Constructor && !e.hasOwnBinding(l.THIS))
              throw m(n.ErrNoSuper(), t.stack, t.node)
            var s = e.hasBinding(l.THIS)
            return s ? s.value : null
          },
          ArrayExpression: function (t) {
            for (var e = [], s = 0, i = t.node.elements; s < i.length; s++) {
              var r = i[s]
              if (null === r) e.push(void 0)
              else if (p.isSpreadElement(r)) {
                var a = t.evaluate(t.createChild(r))
                e = [].concat(e, o._toConsumableArray(a))
              } else e.push(t.evaluate(t.createChild(r)))
            }
            return e
          },
          ObjectExpression: function (t) {
            for (
              var e = t.node,
                s = {},
                i = t.scope.createChild(h.ScopeType.Object),
                r = [],
                a = 0,
                n = e.properties;
              a < n.length;
              a++
            ) {
              var o = (p = n[a])
              !0 !== o.computed
                ? t.evaluate(t.createChild(p, i, { object: s }))
                : r.push(o)
            }
            for (var c = 0, l = r; c < l.length; c++) {
              var p = l[c]
              t.evaluate(t.createChild(p, i, { object: s }))
            }
            return s
          },
          ObjectProperty: function (t) {
            var e = t.node,
              s = t.scope,
              i = t.ctx.object,
              r = t.evaluate(t.createChild(e.value))
            p.isIdentifier(e.key)
              ? ((i[e.key.name] = r), s.var(e.key.name, r))
              : (i[t.evaluate(t.createChild(e.key))] = r)
          },
          ObjectMethod: function (t) {
            var e = t.node,
              s = t.scope,
              i = t.stack,
              r = e.computed
                ? t.evaluate(t.createChild(e.key))
                : p.isIdentifier(e.key)
                ? e.key.name
                : t.evaluate(t.createChild(e.key)),
              a = function () {
                i.enter('Object.' + r)
                var a = [].slice.call(arguments),
                  n = s.createChild(h.ScopeType.Function)
                n.const(l.THIS, this),
                  e.params.forEach(function (t, e) {
                    n.const(t.name, a[e])
                  })
                var o = t.evaluate(t.createChild(e.body, n))
                if ((i.leave(), c.Signal.isReturn(o))) return o.value
              }
            u.defineFunctionLength(a, e.params.length),
              u.defineFunctionName(a, r)
            var n = {
              get: function () {
                Object.defineProperty(t.ctx.object, r, {
                  get: a,
                }),
                  s.const(r, a)
              },
              set: function () {
                Object.defineProperty(t.ctx.object, r, {
                  set: a,
                })
              },
              method: function () {
                Object.defineProperty(t.ctx.object, r, {
                  value: a,
                })
              },
            }[e.kind]
            n && n()
          },
          FunctionExpression: function (t) {
            var e = t.node,
              s = t.scope,
              i = t.stack,
              r = e.id ? e.id.name : '',
              a = function () {
                for (var a = [], n = 0; n < arguments.length; n++)
                  a[n] = arguments[n]
                i.enter(r)
                for (
                  var o =
                      a.length &&
                      a[a.length - 1] instanceof d.This &&
                      a.pop() &&
                      !0,
                    u = s.createChild(h.ScopeType.Function),
                    f = 0;
                  f < e.params.length;
                  f++
                ) {
                  var m = e.params[f]
                  p.isIdentifier(m)
                    ? u.let(m.name, a[f])
                    : p.isAssignmentPattern(m)
                    ? t.evaluate(
                        t.createChild(m, u, {
                          value: a[f],
                        })
                      )
                    : p.isRestElement(m) &&
                      t.evaluate(
                        t.createChild(m, u, {
                          value: a.slice(f),
                        })
                      )
                }
                u.const(l.THIS, this),
                  u.const(l.NEW, {
                    target:
                      this && this.__proto__ && this.__proto__.constructor
                        ? this.__proto__.constructor
                        : void 0,
                  }),
                  u.const(l.ARGUMENTS, arguments),
                  (u.isolated = !1)
                var y = t.evaluate(t.createChild(e.body, u))
                return i.leave(), y instanceof c.Signal ? y.value : o ? this : y
              }
            return (
              u.defineFunctionLength(a, e.params.length),
              u.defineFunctionName(a, e.id ? e.id.name : ''),
              a
            )
          },
          BinaryExpression: function (t) {
            var s = t.node
            return e.BinaryExpressionOperatorEvaluateMap[s.operator](
              t.evaluate(t.createChild(s.left)),
              t.evaluate(t.createChild(s.right))
            )
          },
          UnaryExpression: function (t) {
            var e = t.node,
              s = t.scope
            return {
              '-': function () {
                return -t.evaluate(t.createChild(e.argument))
              },
              '+': function () {
                return +t.evaluate(t.createChild(e.argument))
              },
              '!': function () {
                return !t.evaluate(t.createChild(e.argument))
              },
              '~': function () {
                return ~t.evaluate(t.createChild(e.argument))
              },
              void: function () {
                t.evaluate(t.createChild(e.argument))
              },
              typeof: function () {
                if (p.isIdentifier(e.argument)) {
                  var i = s.hasBinding(e.argument.name)
                  return i ? typeof i.value : l.UNDEFINED
                }
                return typeof t.evaluate(t.createChild(e.argument))
              },
              delete: function () {
                if (p.isMemberExpression(e.argument)) {
                  var i = e.argument,
                    r = i.object,
                    a = i.property
                  return i.computed
                    ? delete t.evaluate(t.createChild(r))[
                        t.evaluate(t.createChild(a))
                      ]
                    : delete t.evaluate(t.createChild(r))[a.name]
                }
                if (p.isIdentifier(e.argument)) {
                  var n = s.hasBinding(l.THIS)
                  if (n) return n.value[e.argument.name]
                }
              },
            }[e.operator]()
          },
          CallExpression: function (t) {
            var e = t.node,
              s = t.scope,
              i = t.stack,
              r = p.isMemberExpression(e.callee)
                ? p.isIdentifier(e.callee.property)
                  ? e.callee.object.name + '.' + e.callee.property.name
                  : p.isStringLiteral(e.callee.property)
                  ? e.callee.object.name + '.' + e.callee.property.value
                  : 'undefined'
                : e.callee.name,
              o = t.evaluate(t.createChild(e.callee)),
              h = e.arguments.map(function (e) {
                return t.evaluate(t.createChild(e))
              }),
              c = a(o),
              u = null
            if (p.isMemberExpression(e.callee)) {
              if (!c) throw m(n.ErrIsNotFunction(r), i, e.callee.property)
              i.push({
                filename: l.ANONYMOUS,
                stack: i.currentStackName,
                location: e.callee.property.loc,
              }),
                (u = t.evaluate(t.createChild(e.callee.object)))
            } else {
              if (!c) throw m(n.ErrIsNotFunction(r), i, e)
              i.push({
                filename: l.ANONYMOUS,
                stack: i.currentStackName,
                location: e.loc,
              })
              var f = s.hasBinding(l.THIS)
              u = f ? f.value : null
            }
            var d = o.apply(u, h)
            return (
              d instanceof Error && (d.stack = d.toString() + '\n' + i.raw), d
            )
          },
          MemberExpression: function (t) {
            var e = t.node,
              s = e.object,
              i = e.property,
              o = e.computed ? t.evaluate(t.createChild(i)) : i.name,
              h = t.evaluate(t.createChild(s))
            if (void 0 === h) throw n.ErrCanNotReadProperty(o, 'undefined')
            if (null === h) throw n.ErrCanNotReadProperty(o, 'null')
            var c =
              'prototype' === o && r.isIdentifier(i) ? new f.Prototype(h) : h[o]
            return c instanceof f.Prototype ? c : a(c) ? c.bind(h) : c
          },
          AssignmentExpression: function (t) {
            var s,
              i = t.node,
              r = t.scope,
              a = {
                kind: h.Kind.Var,
                set: function (t) {},
                get value() {},
              }
            if (p.isIdentifier(i.left)) {
              var o = i.left.name,
                c = r.hasBinding(o)
              if (((s = t.evaluate(t.createChild(i.right))), c)) {
                if ((a = c).kind === h.Kind.Const)
                  throw m(
                    new TypeError('Assignment to constant variable.'),
                    t.stack,
                    i.left
                  )
              } else {
                var l = r.global
                l.var(o, t.evaluate(t.createChild(i.right)))
                var u = l.hasBinding(o)
                if (!u) throw m(n.ErrNotDefined(o), t.stack, i.right)
                a = u
              }
            } else if (p.isMemberExpression(i.left)) {
              var d = i.left,
                y = t.evaluate(t.createChild(d.object))
              s = t.evaluate(t.createChild(i.right))
              var v = d.computed
                ? t.evaluate(t.createChild(d.property))
                : d.property.name
              a = {
                kind: h.Kind.Var,
                set: function (t) {
                  y instanceof f.Prototype
                    ? (y.constructor.prototype[v] = t)
                    : (y[v] = t)
                },
                get value() {
                  return y[v]
                },
              }
            }
            return e.AssignmentExpressionEvaluateMap[i.operator](a, s)
          },
          LogicalExpression: function (t) {
            var e = t.node
            return {
              '||': function () {
                return (
                  t.evaluate(t.createChild(e.left)) ||
                  t.evaluate(t.createChild(e.right))
                )
              },
              '&&': function () {
                return (
                  t.evaluate(t.createChild(e.left)) &&
                  t.evaluate(t.createChild(e.right))
                )
              },
            }[e.operator]()
          },
          ConditionalExpression: function (t) {
            return t.evaluate(t.createChild(t.node.test))
              ? t.evaluate(t.createChild(t.node.consequent))
              : t.evaluate(t.createChild(t.node.alternate))
          },
          NewExpression: function (t) {
            var e = t.node,
              s = t.stack,
              r = t.evaluate(t.createChild(e.callee)),
              a = e.arguments.map(function (e) {
                return t.evaluate(t.createChild(e))
              })
            r.prototype.constructor = r
            var n = /native code/.test(r.toString())
              ? new (r.bind.apply(r, i([void 0], a)))()
              : new (r.bind.apply(r, i([void 0], a, [new d.This(null)])))()
            return (r === Error || n instanceof Error) && (n = m(n, s, e)), n
          },
          SequenceExpression: function (t) {
            for (var e, s = 0, i = t.node.expressions; s < i.length; s++) {
              var r = i[s]
              e = t.evaluate(t.createChild(r))
            }
            return e
          },
        })
    },
    function (t, e) {
      var s =
          'object' == typeof global &&
          global &&
          global.Object === Object &&
          global,
        i = 'object' == typeof self && self && self.Object === Object && self,
        r = s || i || Function('return this')(),
        a = Object.prototype,
        n = a.hasOwnProperty,
        o = a.toString,
        h = r.Symbol,
        c = h ? h.toStringTag : void 0
      function l(t) {
        return null == t
          ? void 0 === t
            ? '[object Undefined]'
            : '[object Null]'
          : c && c in Object(t)
          ? (function (t) {
              var e = n.call(t, c),
                s = t[c]
              try {
                t[c] = void 0
                var i = !0
              } catch (t) {}
              var r = o.call(t)
              i && (e ? (t[c] = s) : delete t[c])
              return r
            })(t)
          : (function (t) {
              return o.call(t)
            })(t)
      }
      t.exports = function (t) {
        if (
          !(function (t) {
            var e = typeof t
            return null != t && ('object' == e || 'function' == e)
          })(t)
        )
          return !1
        var e = l(t)
        return (
          '[object Function]' == e ||
          '[object GeneratorFunction]' == e ||
          '[object AsyncFunction]' == e ||
          '[object Proxy]' == e
        )
      }
    },
    function (t, e, s) {
      'use strict'
      Object.defineProperty(e, '__esModule', { value: !0 }),
        (e._classCallCheck = function (t, e) {
          if (!(t instanceof e))
            throw new TypeError('Cannot call a class as a function')
        }),
        (e._createClass = (function () {
          function t(t, e) {
            for (var s = 0; s < e.length; s++) {
              var i = e[s]
              ;(i.enumerable = i.enumerable || !1),
                (i.configurable = !0),
                'value' in i && (i.writable = !0),
                Object.defineProperty(t, i.key, i)
            }
          }
          return function (e, s, i) {
            return s && t(e.prototype, s), i && t(e, i), e
          }
        })()),
        (e._possibleConstructorReturn = function (t, e) {
          if (!t)
            throw new ReferenceError(
              "this hasn't been initialised - super() hasn't been called"
            )
          return !e || ('object' != typeof e && 'function' != typeof e) ? t : e
        }),
        (e._inherits = function (t, e) {
          if ('function' != typeof e && null !== e)
            throw new TypeError(
              'Super expression must either be null or a function, not ' +
                typeof e
            )
          ;(t.prototype = Object.create(e && e.prototype, {
            constructor: {
              value: t,
              enumerable: !1,
              writable: !0,
              configurable: !0,
            },
          })),
            e &&
              (Object.setPrototypeOf
                ? Object.setPrototypeOf(t, e)
                : (t.__proto__ = e))
        }),
        (e._extends =
          Object.assign ||
          function (t) {
            for (var e = 1; e < arguments.length; e++) {
              var s = arguments[e]
              for (var i in s)
                Object.prototype.hasOwnProperty.call(s, i) && (t[i] = s[i])
            }
            return t
          }),
        (e._toConsumableArray = function (t) {
          if (Array.isArray(t)) {
            for (var e = 0, s = Array(t.length); e < t.length; e++) s[e] = t[e]
            return s
          }
          return Array.from(t)
        }),
        (e._asyncToGenerator = function (t) {
          return function () {
            var e = t.apply(this, arguments)
            return new Promise(function (t, s) {
              return (function i(r, a) {
                try {
                  var n = e[r](a),
                    o = n.value
                } catch (t) {
                  return void s(t)
                }
                if (!n.done)
                  return Promise.resolve(o).then(
                    function (t) {
                      i('next', t)
                    },
                    function (t) {
                      i('throw', t)
                    }
                  )
                t(o)
              })('next')
            })
          }
        }),
        (e.__generator =
          (this && this.__generator) ||
          function (t, e) {
            var s,
              i,
              r,
              a,
              n = {
                label: 0,
                sent: function () {
                  if (1 & r[0]) throw r[1]
                  return r[1]
                },
                trys: [],
                ops: [],
              }
            return (
              (a = { next: o(0), throw: o(1), return: o(2) }),
              'function' == typeof Symbol &&
                (a[Symbol.iterator] = function () {
                  return this
                }),
              a
            )
            function o(a) {
              return function (o) {
                return (function (a) {
                  if (s) throw new TypeError('Generator is already executing.')
                  for (; n; )
                    try {
                      if (
                        ((s = 1),
                        i &&
                          (r =
                            i[2 & a[0] ? 'return' : a[0] ? 'throw' : 'next']) &&
                          !(r = r.call(i, a[1])).done)
                      )
                        return r
                      switch (((i = 0), r && (a = [0, r.value]), a[0])) {
                        case 0:
                        case 1:
                          r = a
                          break
                        case 4:
                          return (
                            n.label++,
                            {
                              value: a[1],
                              done: !1,
                            }
                          )
                        case 5:
                          n.label++, (i = a[1]), (a = [0])
                          continue
                        case 7:
                          ;(a = n.ops.pop()), n.trys.pop()
                          continue
                        default:
                          if (
                            !(r = (r = n.trys).length > 0 && r[r.length - 1]) &&
                            (6 === a[0] || 2 === a[0])
                          ) {
                            n = 0
                            continue
                          }
                          if (
                            3 === a[0] &&
                            (!r || (a[1] > r[0] && a[1] < r[3]))
                          ) {
                            n.label = a[1]
                            break
                          }
                          if (6 === a[0] && n.label < r[1]) {
                            ;(n.label = r[1]), (r = a)
                            break
                          }
                          if (r && n.label < r[2]) {
                            ;(n.label = r[2]), n.ops.push(a)
                            break
                          }
                          r[2] && n.ops.pop(), n.trys.pop()
                          continue
                      }
                      a = e.call(t, n)
                    } catch (t) {
                      ;(a = [6, t]), (i = 0)
                    } finally {
                      s = r = 0
                    }
                  if (5 & a[0]) throw a[1]
                  return {
                    value: a[0] ? a[1] : void 0,
                    done: !0,
                  }
                })([a, o])
              }
            }
          }),
        (e._taggedTemplateLiteral = function (t, e) {
          return Object.freeze(
            Object.defineProperties(t, {
              raw: { value: Object.freeze(e) },
            })
          )
        }),
        (e.__awaiter =
          (this && this.__awaiter) ||
          function (t, e, s, i) {
            return new (s || (s = Promise))(function (r, a) {
              function n(t) {
                try {
                  h(i.next(t))
                } catch (t) {
                  a(t)
                }
              }
              function o(t) {
                try {
                  h(i.throw(t))
                } catch (t) {
                  a(t)
                }
              }
              function h(t) {
                t.done
                  ? r(t.value)
                  : new s(function (e) {
                      e(t.value)
                    }).then(n, o)
              }
              h((i = i.apply(t, e || [])).next())
            })
          })
    },
    function (t, e, s) {
      'use strict'
      Object.defineProperty(e, '__esModule', { value: !0 })
      var i = (function () {
        function t(t, e) {
          ;(this.kind = t), (this.value = e)
        }
        return (
          (t.is = function (e, s) {
            return e instanceof t && e.kind === s
          }),
          (t.isContinue = function (e) {
            return t.is(e, 'continue')
          }),
          (t.isBreak = function (e) {
            return t.is(e, 'break')
          }),
          (t.isReturn = function (e) {
            return t.is(e, 'return')
          }),
          t
        )
      })()
      e.Signal = i
    },
    function (t, e, s) {
      'use strict'
      function i(t, e) {
        return t.type === e
      }
      Object.defineProperty(e, '__esModule', { value: !0 }),
        (e.isStringLiteral = function (t) {
          return i(t, 'StringLiteral')
        }),
        (e.isArrayExpression = function (t) {
          return i(t, 'ArrayExpression')
        }),
        (e.isObjectExpression = function (t) {
          return i(t, 'ObjectExpression')
        }),
        (e.isFunctionDeclaration = function (t) {
          return i(t, 'FunctionDeclaration')
        }),
        (e.isVariableDeclaration = function (t) {
          return i(t, 'VariableDeclaration')
        }),
        (e.isIdentifier = function (t) {
          return i(t, 'Identifier')
        }),
        (e.isObjectPattern = function (t) {
          return i(t, 'ObjectPattern')
        }),
        (e.isObjectProperty = function (t) {
          return i(t, 'ObjectProperty')
        }),
        (e.isArrayPattern = function (t) {
          return i(t, 'ArrayPattern')
        }),
        (e.isMemberExpression = function (t) {
          return i(t, 'MemberExpression')
        }),
        (e.isSpreadElement = function (t) {
          return i(t, 'SpreadElement')
        }),
        (e.isAssignmentPattern = function (t) {
          return i(t, 'AssignmentPattern')
        }),
        (e.isRestElement = function (t) {
          return i(t, 'RestElement')
        }),
        (e.isClassMethod = function (t) {
          return i(t, 'ClassMethod')
        }),
        (e.isClassProperty = function (t) {
          return i(t, 'ClassProperty')
        }),
        (e.isCallExpression = function (t) {
          return i(t, 'CallExpression')
        }),
        (e.isImportDefaultSpecifier = function (t) {
          return i(t, 'ImportDefaultSpecifier')
        }),
        (e.isImportSpecifier = function (t) {
          return i(t, 'ImportSpecifier')
        })
    },
    function (t, e, s) {
      'use strict'
      Object.defineProperty(e, '__esModule', { value: !0 }),
        (e.defineFunctionName = function (t, e) {
          Object.defineProperty(t, 'name', {
            value: e || '',
            writable: !1,
            enumerable: !1,
            configurable: !0,
          })
        }),
        (e.defineFunctionLength = function (t, e) {
          Object.defineProperty(t, 'length', {
            value: e || 0,
            writable: !1,
            enumerable: !1,
            configurable: !0,
          })
        })
    },
    function (t, e, s) {
      'use strict'
      Object.defineProperty(e, '__esModule', { value: !0 })
      var i = s(11),
        r = s(3),
        a = s(12),
        n = s(20),
        o = s(21),
        h = s(0),
        c = s(1),
        l = s(23)
      function p(t, e, s) {
        void 0 === s && (s = c.presetMap.env)
        var r = new o.Scope(c.ScopeType.Root, null)
        ;(r.level = 0),
          (r.invasive = !0),
          r.const(h.THIS, void 0),
          r.setContext(e)
        var p = {},
          u = { exports: p }
        r.const(h.MODULE, u), r.var(h.EXPORTS, p)
        var f = i.parse(t, {
            sourceType: 'module',
            plugins: [
              'asyncGenerators',
              'classProperties',
              'decorators',
              'doExpressions',
              'exportExtensions',
              'flow',
              'objectRestSpread',
            ],
          }),
          d = new n.Path(f, null, r, {}, new l.Stack())
        ;(d.preset = s), (d.evaluate = a.default), a.default(d)
        var m = r.hasBinding(h.MODULE)
        return m ? m.value.exports : void 0
      }
      function u(t) {
        return void 0 === t && (t = {}), new r.Context(t)
      }
      ;(e.runInContext = p),
        (e.createContext = u),
        (e.default = { runInContext: p, createContext: u })
    },
    function (t, e, s) {
      'use strict'
      function i(t) {
        return (
          (t = t.split(' ')),
          function (e) {
            return t.indexOf(e) >= 0
          }
        )
      }
      Object.defineProperty(e, '__esModule', { value: !0 })
      var r = {
          6: i('enum await'),
          strict: i(
            'implements interface let package private protected public static yield'
          ),
          strictBind: i('eval arguments'),
        },
        a = i(
          'break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this let const class extends export import yield super'
        ),
        n =
          'ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԯԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠ-ࢴࢶ-ࢽऄ-हऽॐक़-ॡॱ-ঀঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡૹଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-హఽౘ-ౚౠౡಀಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൔ-ൖൟ-ൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏽᏸ-ᏽᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛸᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤞᥐ-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᲀ-ᲈᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕ℘-ℝℤΩℨK-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞ々-〇〡-〩〱-〵〸-〼ぁ-ゖ゛-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿕ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚝꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞮꞰ-ꞷꟷ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꣽꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꧠ-ꧤꧦ-ꧯꧺ-ꧾꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꩾ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭥꭰ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ',
        o =
          '‌‍·̀-ͯ·҃-֑҇-ׇֽֿׁׂׅׄؐ-ًؚ-٩ٰۖ-ۜ۟-۪ۤۧۨ-ۭ۰-۹ܑܰ-݊ަ-ް߀-߉߫-߳ࠖ-࠙ࠛ-ࠣࠥ-ࠧࠩ-࡙࠭-࡛ࣔ-ࣣ࣡-ःऺ-़ा-ॏ॑-ॗॢॣ०-९ঁ-ঃ়া-ৄেৈো-্ৗৢৣ০-৯ਁ-ਃ਼ਾ-ੂੇੈੋ-੍ੑ੦-ੱੵઁ-ઃ઼ા-ૅે-ૉો-્ૢૣ૦-૯ଁ-ଃ଼ା-ୄେୈୋ-୍ୖୗୢୣ୦-୯ஂா-ூெ-ைொ-்ௗ௦-௯ఀ-ఃా-ౄె-ైొ-్ౕౖౢౣ౦-౯ಁ-ಃ಼ಾ-ೄೆ-ೈೊ-್ೕೖೢೣ೦-೯ഁ-ഃാ-ൄെ-ൈൊ-്ൗൢൣ൦-൯ංඃ්ා-ුූෘ-ෟ෦-෯ෲෳัิ-ฺ็-๎๐-๙ັິ-ູົຼ່-ໍ໐-໙༘༙༠-༩༹༵༷༾༿ཱ-྄྆྇ྍ-ྗྙ-ྼ࿆ါ-ှ၀-၉ၖ-ၙၞ-ၠၢ-ၤၧ-ၭၱ-ၴႂ-ႍႏ-ႝ፝-፟፩-፱ᜒ-᜔ᜲ-᜴ᝒᝓᝲᝳ឴-៓៝០-៩᠋-᠍᠐-᠙ᢩᤠ-ᤫᤰ-᤻᥆-᥏᧐-᧚ᨗ-ᨛᩕ-ᩞ᩠-᩿᩼-᪉᪐-᪙᪰-᪽ᬀ-ᬄ᬴-᭄᭐-᭙᭫-᭳ᮀ-ᮂᮡ-ᮭ᮰-᮹᯦-᯳ᰤ-᰷᱀-᱉᱐-᱙᳐-᳔᳒-᳨᳭ᳲ-᳴᳸᳹᷀-᷵᷻-᷿‿⁀⁔⃐-⃥⃜⃡-⃰⳯-⵿⳱ⷠ-〪ⷿ-゙゚〯꘠-꘩꙯ꙴ-꙽ꚞꚟ꛰꛱ꠂ꠆ꠋꠣ-ꠧꢀꢁꢴ-ꣅ꣐-꣙꣠-꣱꤀-꤉ꤦ-꤭ꥇ-꥓ꦀ-ꦃ꦳-꧀꧐-꧙ꧥ꧰-꧹ꨩ-ꨶꩃꩌꩍ꩐-꩙ꩻ-ꩽꪰꪲ-ꪴꪷꪸꪾ꪿꫁ꫫ-ꫯꫵ꫶ꯣ-ꯪ꯬꯭꯰-꯹ﬞ︀-️︠-︯︳︴﹍-﹏０-９＿',
        h = new RegExp('[' + n + ']'),
        c = new RegExp('[' + n + o + ']')
      n = o = null
      var l = [
          0,
          11,
          2,
          25,
          2,
          18,
          2,
          1,
          2,
          14,
          3,
          13,
          35,
          122,
          70,
          52,
          268,
          28,
          4,
          48,
          48,
          31,
          17,
          26,
          6,
          37,
          11,
          29,
          3,
          35,
          5,
          7,
          2,
          4,
          43,
          157,
          19,
          35,
          5,
          35,
          5,
          39,
          9,
          51,
          157,
          310,
          10,
          21,
          11,
          7,
          153,
          5,
          3,
          0,
          2,
          43,
          2,
          1,
          4,
          0,
          3,
          22,
          11,
          22,
          10,
          30,
          66,
          18,
          2,
          1,
          11,
          21,
          11,
          25,
          71,
          55,
          7,
          1,
          65,
          0,
          16,
          3,
          2,
          2,
          2,
          26,
          45,
          28,
          4,
          28,
          36,
          7,
          2,
          27,
          28,
          53,
          11,
          21,
          11,
          18,
          14,
          17,
          111,
          72,
          56,
          50,
          14,
          50,
          785,
          52,
          76,
          44,
          33,
          24,
          27,
          35,
          42,
          34,
          4,
          0,
          13,
          47,
          15,
          3,
          22,
          0,
          2,
          0,
          36,
          17,
          2,
          24,
          85,
          6,
          2,
          0,
          2,
          3,
          2,
          14,
          2,
          9,
          8,
          46,
          39,
          7,
          3,
          1,
          3,
          21,
          2,
          6,
          2,
          1,
          2,
          4,
          4,
          0,
          19,
          0,
          13,
          4,
          159,
          52,
          19,
          3,
          54,
          47,
          21,
          1,
          2,
          0,
          185,
          46,
          42,
          3,
          37,
          47,
          21,
          0,
          60,
          42,
          86,
          25,
          391,
          63,
          32,
          0,
          449,
          56,
          264,
          8,
          2,
          36,
          18,
          0,
          50,
          29,
          881,
          921,
          103,
          110,
          18,
          195,
          2749,
          1070,
          4050,
          582,
          8634,
          568,
          8,
          30,
          114,
          29,
          19,
          47,
          17,
          3,
          32,
          20,
          6,
          18,
          881,
          68,
          12,
          0,
          67,
          12,
          65,
          0,
          32,
          6124,
          20,
          754,
          9486,
          1,
          3071,
          106,
          6,
          12,
          4,
          8,
          8,
          9,
          5991,
          84,
          2,
          70,
          2,
          1,
          3,
          0,
          3,
          1,
          3,
          3,
          2,
          11,
          2,
          0,
          2,
          6,
          2,
          64,
          2,
          3,
          3,
          7,
          2,
          6,
          2,
          27,
          2,
          3,
          2,
          4,
          2,
          0,
          4,
          6,
          2,
          339,
          3,
          24,
          2,
          24,
          2,
          30,
          2,
          24,
          2,
          30,
          2,
          24,
          2,
          30,
          2,
          24,
          2,
          30,
          2,
          24,
          2,
          7,
          4149,
          196,
          60,
          67,
          1213,
          3,
          2,
          26,
          2,
          1,
          2,
          0,
          3,
          0,
          2,
          9,
          2,
          3,
          2,
          0,
          2,
          0,
          7,
          0,
          5,
          0,
          2,
          0,
          2,
          0,
          2,
          2,
          2,
          1,
          2,
          0,
          3,
          0,
          2,
          0,
          2,
          0,
          2,
          0,
          2,
          0,
          2,
          1,
          2,
          0,
          3,
          3,
          2,
          6,
          2,
          3,
          2,
          3,
          2,
          0,
          2,
          9,
          2,
          16,
          6,
          2,
          2,
          4,
          2,
          16,
          4421,
          42710,
          42,
          4148,
          12,
          221,
          3,
          5761,
          10591,
          541,
        ],
        p = [
          509,
          0,
          227,
          0,
          150,
          4,
          294,
          9,
          1368,
          2,
          2,
          1,
          6,
          3,
          41,
          2,
          5,
          0,
          166,
          1,
          1306,
          2,
          54,
          14,
          32,
          9,
          16,
          3,
          46,
          10,
          54,
          9,
          7,
          2,
          37,
          13,
          2,
          9,
          52,
          0,
          13,
          2,
          49,
          13,
          10,
          2,
          4,
          9,
          83,
          11,
          7,
          0,
          161,
          11,
          6,
          9,
          7,
          3,
          57,
          0,
          2,
          6,
          3,
          1,
          3,
          2,
          10,
          0,
          11,
          1,
          3,
          6,
          4,
          4,
          193,
          17,
          10,
          9,
          87,
          19,
          13,
          9,
          214,
          6,
          3,
          8,
          28,
          1,
          83,
          16,
          16,
          9,
          82,
          12,
          9,
          9,
          84,
          14,
          5,
          9,
          423,
          9,
          838,
          7,
          2,
          7,
          17,
          9,
          57,
          21,
          2,
          13,
          19882,
          9,
          135,
          4,
          60,
          6,
          26,
          9,
          1016,
          45,
          17,
          3,
          19723,
          1,
          5319,
          4,
          4,
          5,
          9,
          7,
          3,
          6,
          31,
          3,
          149,
          2,
          1418,
          49,
          513,
          54,
          5,
          49,
          9,
          0,
          15,
          0,
          23,
          4,
          2,
          14,
          1361,
          6,
          2,
          16,
          3,
          6,
          2,
          1,
          2,
          4,
          2214,
          6,
          110,
          6,
          6,
          9,
          792487,
          239,
        ]
      function u(t, e) {
        for (var s = 65536, i = 0; i < e.length; i += 2) {
          if ((s += e[i]) > t) return !1
          if ((s += e[i + 1]) >= t) return !0
        }
      }
      function f(t) {
        return t < 65
          ? 36 === t
          : t < 91 ||
              (t < 97
                ? 95 === t
                : t < 123 ||
                  (t <= 65535
                    ? t >= 170 && h.test(String.fromCharCode(t))
                    : u(t, l)))
      }
      function d(t) {
        return t < 48
          ? 36 === t
          : t < 58 ||
              (!(t < 65) &&
                (t < 91 ||
                  (t < 97
                    ? 95 === t
                    : t < 123 ||
                      (t <= 65535
                        ? t >= 170 && c.test(String.fromCharCode(t))
                        : u(t, l) || u(t, p)))))
      }
      var m = {
        sourceType: 'script',
        sourceFilename: void 0,
        startLine: 1,
        allowReturnOutsideFunction: !1,
        allowImportExportEverywhere: !1,
        allowSuperOutsideMethod: !1,
        plugins: [],
        strictMode: null,
      }
      var y =
          'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
            ? function (t) {
                return typeof t
              }
            : function (t) {
                return t &&
                  'function' == typeof Symbol &&
                  t.constructor === Symbol &&
                  t !== Symbol.prototype
                  ? 'symbol'
                  : typeof t
              },
        v = function (t, e) {
          if (!(t instanceof e))
            throw new TypeError('Cannot call a class as a function')
        },
        x = function (t, e) {
          if ('function' != typeof e && null !== e)
            throw new TypeError(
              'Super expression must either be null or a function, not ' +
                typeof e
            )
          ;(t.prototype = Object.create(e && e.prototype, {
            constructor: {
              value: t,
              enumerable: !1,
              writable: !0,
              configurable: !0,
            },
          })),
            e &&
              (Object.setPrototypeOf
                ? Object.setPrototypeOf(t, e)
                : (t.__proto__ = e))
        },
        b = function (t, e) {
          if (!t)
            throw new ReferenceError(
              "this hasn't been initialised - super() hasn't been called"
            )
          return !e || ('object' != typeof e && 'function' != typeof e) ? t : e
        },
        g = function t(e) {
          var s =
            arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}
          v(this, t),
            (this.label = e),
            (this.keyword = s.keyword),
            (this.beforeExpr = !!s.beforeExpr),
            (this.startsExpr = !!s.startsExpr),
            (this.rightAssociative = !!s.rightAssociative),
            (this.isLoop = !!s.isLoop),
            (this.isAssign = !!s.isAssign),
            (this.prefix = !!s.prefix),
            (this.postfix = !!s.postfix),
            (this.binop = s.binop || null),
            (this.updateContext = null)
        },
        E = (function (t) {
          function e(s) {
            var i =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : {}
            return v(this, e), (i.keyword = s), b(this, t.call(this, s, i))
          }
          return x(e, t), e
        })(g),
        w = (function (t) {
          function e(s, i) {
            return (
              v(this, e), b(this, t.call(this, s, { beforeExpr: !0, binop: i }))
            )
          }
          return x(e, t), e
        })(g),
        C = {
          num: new g('num', { startsExpr: !0 }),
          regexp: new g('regexp', { startsExpr: !0 }),
          string: new g('string', { startsExpr: !0 }),
          name: new g('name', { startsExpr: !0 }),
          eof: new g('eof'),
          bracketL: new g('[', { beforeExpr: !0, startsExpr: !0 }),
          bracketR: new g(']'),
          braceL: new g('{', { beforeExpr: !0, startsExpr: !0 }),
          braceBarL: new g('{|', { beforeExpr: !0, startsExpr: !0 }),
          braceR: new g('}'),
          braceBarR: new g('|}'),
          parenL: new g('(', { beforeExpr: !0, startsExpr: !0 }),
          parenR: new g(')'),
          comma: new g(',', { beforeExpr: !0 }),
          semi: new g(';', { beforeExpr: !0 }),
          colon: new g(':', { beforeExpr: !0 }),
          doubleColon: new g('::', { beforeExpr: !0 }),
          dot: new g('.'),
          question: new g('?', { beforeExpr: !0 }),
          arrow: new g('=>', { beforeExpr: !0 }),
          template: new g('template'),
          ellipsis: new g('...', { beforeExpr: !0 }),
          backQuote: new g('`', { startsExpr: !0 }),
          dollarBraceL: new g('${', {
            beforeExpr: !0,
            startsExpr: !0,
          }),
          at: new g('@'),
          eq: new g('=', { beforeExpr: !0, isAssign: !0 }),
          assign: new g('_=', { beforeExpr: !0, isAssign: !0 }),
          incDec: new g('++/--', {
            prefix: !0,
            postfix: !0,
            startsExpr: !0,
          }),
          prefix: new g('prefix', {
            beforeExpr: !0,
            prefix: !0,
            startsExpr: !0,
          }),
          logicalOR: new w('||', 1),
          logicalAND: new w('&&', 2),
          bitwiseOR: new w('|', 3),
          bitwiseXOR: new w('^', 4),
          bitwiseAND: new w('&', 5),
          equality: new w('==/!=', 6),
          relational: new w('</>', 7),
          bitShift: new w('<</>>', 8),
          plusMin: new g('+/-', {
            beforeExpr: !0,
            binop: 9,
            prefix: !0,
            startsExpr: !0,
          }),
          modulo: new w('%', 10),
          star: new w('*', 10),
          slash: new w('/', 10),
          exponent: new g('**', {
            beforeExpr: !0,
            binop: 11,
            rightAssociative: !0,
          }),
        },
        P = {
          break: new E('break'),
          case: new E('case', { beforeExpr: !0 }),
          catch: new E('catch'),
          continue: new E('continue'),
          debugger: new E('debugger'),
          default: new E('default', { beforeExpr: !0 }),
          do: new E('do', { isLoop: !0, beforeExpr: !0 }),
          else: new E('else', { beforeExpr: !0 }),
          finally: new E('finally'),
          for: new E('for', { isLoop: !0 }),
          function: new E('function', { startsExpr: !0 }),
          if: new E('if'),
          return: new E('return', { beforeExpr: !0 }),
          switch: new E('switch'),
          throw: new E('throw', { beforeExpr: !0 }),
          try: new E('try'),
          var: new E('var'),
          let: new E('let'),
          const: new E('const'),
          while: new E('while', { isLoop: !0 }),
          with: new E('with'),
          new: new E('new', { beforeExpr: !0, startsExpr: !0 }),
          this: new E('this', { startsExpr: !0 }),
          super: new E('super', { startsExpr: !0 }),
          class: new E('class'),
          extends: new E('extends', { beforeExpr: !0 }),
          export: new E('export'),
          import: new E('import', { startsExpr: !0 }),
          yield: new E('yield', { beforeExpr: !0, startsExpr: !0 }),
          null: new E('null', { startsExpr: !0 }),
          true: new E('true', { startsExpr: !0 }),
          false: new E('false', { startsExpr: !0 }),
          in: new E('in', { beforeExpr: !0, binop: 7 }),
          instanceof: new E('instanceof', {
            beforeExpr: !0,
            binop: 7,
          }),
          typeof: new E('typeof', {
            beforeExpr: !0,
            prefix: !0,
            startsExpr: !0,
          }),
          void: new E('void', {
            beforeExpr: !0,
            prefix: !0,
            startsExpr: !0,
          }),
          delete: new E('delete', {
            beforeExpr: !0,
            prefix: !0,
            startsExpr: !0,
          }),
        }
      Object.keys(P).forEach(function (t) {
        C['_' + t] = P[t]
      })
      var T = /\r\n?|\n|\u2028|\u2029/,
        A = new RegExp(T.source, 'g')
      function k(t) {
        return 10 === t || 13 === t || 8232 === t || 8233 === t
      }
      var N = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/,
        S = function t(e, s, i, r) {
          v(this, t),
            (this.token = e),
            (this.isExpr = !!s),
            (this.preserveSpace = !!i),
            (this.override = r)
        },
        I = {
          braceStatement: new S('{', !1),
          braceExpression: new S('{', !0),
          templateQuasi: new S('${', !0),
          parenStatement: new S('(', !1),
          parenExpression: new S('(', !0),
          template: new S('`', !0, !0, function (t) {
            return t.readTmplToken()
          }),
          functionExpression: new S('function', !0),
        }
      ;(C.parenR.updateContext = C.braceR.updateContext = function () {
        if (1 !== this.state.context.length) {
          var t = this.state.context.pop()
          t === I.braceStatement && this.curContext() === I.functionExpression
            ? (this.state.context.pop(), (this.state.exprAllowed = !1))
            : t === I.templateQuasi
            ? (this.state.exprAllowed = !0)
            : (this.state.exprAllowed = !t.isExpr)
        } else this.state.exprAllowed = !0
      }),
        (C.name.updateContext = function (t) {
          ;(this.state.exprAllowed = !1),
            (t !== C._let && t !== C._const && t !== C._var) ||
              (T.test(this.input.slice(this.state.end)) &&
                (this.state.exprAllowed = !0))
        }),
        (C.braceL.updateContext = function (t) {
          this.state.context.push(
            this.braceIsBlock(t) ? I.braceStatement : I.braceExpression
          ),
            (this.state.exprAllowed = !0)
        }),
        (C.dollarBraceL.updateContext = function () {
          this.state.context.push(I.templateQuasi),
            (this.state.exprAllowed = !0)
        }),
        (C.parenL.updateContext = function (t) {
          var e = t === C._if || t === C._for || t === C._with || t === C._while
          this.state.context.push(e ? I.parenStatement : I.parenExpression),
            (this.state.exprAllowed = !0)
        }),
        (C.incDec.updateContext = function () {}),
        (C._function.updateContext = function () {
          this.curContext() !== I.braceStatement &&
            this.state.context.push(I.functionExpression),
            (this.state.exprAllowed = !1)
        }),
        (C.backQuote.updateContext = function () {
          this.curContext() === I.template
            ? this.state.context.pop()
            : this.state.context.push(I.template),
            (this.state.exprAllowed = !1)
        })
      var O = function t(e, s) {
          v(this, t), (this.line = e), (this.column = s)
        },
        _ = function t(e, s) {
          v(this, t), (this.start = e), (this.end = s)
        }
      var L = (function () {
          function t() {
            v(this, t)
          }
          return (
            (t.prototype.init = function (t, e) {
              return (
                (this.strict =
                  !1 !== t.strictMode && 'module' === t.sourceType),
                (this.input = e),
                (this.potentialArrowAt = -1),
                (this.inMethod = this.inFunction = this.inGenerator = this.inAsync = this.inPropertyName = this.inType = this.inClassProperty = this.noAnonFunctionType = !1),
                (this.labels = []),
                (this.decorators = []),
                (this.tokens = []),
                (this.comments = []),
                (this.trailingComments = []),
                (this.leadingComments = []),
                (this.commentStack = []),
                (this.pos = this.lineStart = 0),
                (this.curLine = t.startLine),
                (this.type = C.eof),
                (this.value = null),
                (this.start = this.end = this.pos),
                (this.startLoc = this.endLoc = this.curPosition()),
                (this.lastTokEndLoc = this.lastTokStartLoc = null),
                (this.lastTokStart = this.lastTokEnd = this.pos),
                (this.context = [I.braceStatement]),
                (this.exprAllowed = !0),
                (this.containsEsc = this.containsOctal = !1),
                (this.octalPosition = null),
                (this.invalidTemplateEscapePosition = null),
                (this.exportedIdentifiers = []),
                this
              )
            }),
            (t.prototype.curPosition = function () {
              return new O(this.curLine, this.pos - this.lineStart)
            }),
            (t.prototype.clone = function (e) {
              var s = new t()
              for (var i in this) {
                var r = this[i]
                ;(e && 'context' !== i) || !Array.isArray(r) || (r = r.slice()),
                  (s[i] = r)
              }
              return s
            }),
            t
          )
        })(),
        j = function t(e) {
          v(this, t),
            (this.type = e.type),
            (this.value = e.value),
            (this.start = e.start),
            (this.end = e.end),
            (this.loc = new _(e.startLoc, e.endLoc))
        }
      function D(t) {
        return t <= 65535
          ? String.fromCharCode(t)
          : String.fromCharCode(
              55296 + ((t - 65536) >> 10),
              56320 + ((t - 65536) & 1023)
            )
      }
      var R = (function () {
          function t(e, s) {
            v(this, t), (this.state = new L()), this.state.init(e, s)
          }
          return (
            (t.prototype.next = function () {
              this.isLookahead || this.state.tokens.push(new j(this.state)),
                (this.state.lastTokEnd = this.state.end),
                (this.state.lastTokStart = this.state.start),
                (this.state.lastTokEndLoc = this.state.endLoc),
                (this.state.lastTokStartLoc = this.state.startLoc),
                this.nextToken()
            }),
            (t.prototype.eat = function (t) {
              return !!this.match(t) && (this.next(), !0)
            }),
            (t.prototype.match = function (t) {
              return this.state.type === t
            }),
            (t.prototype.isKeyword = function (t) {
              return a(t)
            }),
            (t.prototype.lookahead = function () {
              var t = this.state
              ;(this.state = t.clone(!0)),
                (this.isLookahead = !0),
                this.next(),
                (this.isLookahead = !1)
              var e = this.state.clone(!0)
              return (this.state = t), e
            }),
            (t.prototype.setStrict = function (t) {
              if (
                ((this.state.strict = t),
                this.match(C.num) || this.match(C.string))
              ) {
                for (
                  this.state.pos = this.state.start;
                  this.state.pos < this.state.lineStart;

                )
                  (this.state.lineStart =
                    this.input.lastIndexOf('\n', this.state.lineStart - 2) + 1),
                    --this.state.curLine
                this.nextToken()
              }
            }),
            (t.prototype.curContext = function () {
              return this.state.context[this.state.context.length - 1]
            }),
            (t.prototype.nextToken = function () {
              var t = this.curContext()
              return (
                (t && t.preserveSpace) || this.skipSpace(),
                (this.state.containsOctal = !1),
                (this.state.octalPosition = null),
                (this.state.start = this.state.pos),
                (this.state.startLoc = this.state.curPosition()),
                this.state.pos >= this.input.length
                  ? this.finishToken(C.eof)
                  : t.override
                  ? t.override(this)
                  : this.readToken(this.fullCharCodeAtPos())
              )
            }),
            (t.prototype.readToken = function (t) {
              return f(t) || 92 === t
                ? this.readWord()
                : this.getTokenFromCode(t)
            }),
            (t.prototype.fullCharCodeAtPos = function () {
              var t = this.input.charCodeAt(this.state.pos)
              return t <= 55295 || t >= 57344
                ? t
                : (t << 10) +
                    this.input.charCodeAt(this.state.pos + 1) -
                    56613888
            }),
            (t.prototype.pushComment = function (t, e, s, i, r, a) {
              var n = {
                type: t ? 'CommentBlock' : 'CommentLine',
                value: e,
                start: s,
                end: i,
                loc: new _(r, a),
              }
              this.isLookahead ||
                (this.state.tokens.push(n),
                this.state.comments.push(n),
                this.addComment(n))
            }),
            (t.prototype.skipBlockComment = function () {
              var t = this.state.curPosition(),
                e = this.state.pos,
                s = this.input.indexOf('*/', (this.state.pos += 2))
              ;-1 === s &&
                this.raise(this.state.pos - 2, 'Unterminated comment'),
                (this.state.pos = s + 2),
                (A.lastIndex = e)
              for (
                var i = void 0;
                (i = A.exec(this.input)) && i.index < this.state.pos;

              )
                ++this.state.curLine,
                  (this.state.lineStart = i.index + i[0].length)
              this.pushComment(
                !0,
                this.input.slice(e + 2, s),
                e,
                this.state.pos,
                t,
                this.state.curPosition()
              )
            }),
            (t.prototype.skipLineComment = function (t) {
              for (
                var e = this.state.pos,
                  s = this.state.curPosition(),
                  i = this.input.charCodeAt((this.state.pos += t));
                this.state.pos < this.input.length &&
                10 !== i &&
                13 !== i &&
                8232 !== i &&
                8233 !== i;

              )
                ++this.state.pos, (i = this.input.charCodeAt(this.state.pos))
              this.pushComment(
                !1,
                this.input.slice(e + t, this.state.pos),
                e,
                this.state.pos,
                s,
                this.state.curPosition()
              )
            }),
            (t.prototype.skipSpace = function () {
              t: for (; this.state.pos < this.input.length; ) {
                var t = this.input.charCodeAt(this.state.pos)
                switch (t) {
                  case 32:
                  case 160:
                    ++this.state.pos
                    break
                  case 13:
                    10 === this.input.charCodeAt(this.state.pos + 1) &&
                      ++this.state.pos
                  case 10:
                  case 8232:
                  case 8233:
                    ++this.state.pos,
                      ++this.state.curLine,
                      (this.state.lineStart = this.state.pos)
                    break
                  case 47:
                    switch (this.input.charCodeAt(this.state.pos + 1)) {
                      case 42:
                        this.skipBlockComment()
                        break
                      case 47:
                        this.skipLineComment(2)
                        break
                      default:
                        break t
                    }
                    break
                  default:
                    if (
                      !(
                        (t > 8 && t < 14) ||
                        (t >= 5760 && N.test(String.fromCharCode(t)))
                      )
                    )
                      break t
                    ++this.state.pos
                }
              }
            }),
            (t.prototype.finishToken = function (t, e) {
              ;(this.state.end = this.state.pos),
                (this.state.endLoc = this.state.curPosition())
              var s = this.state.type
              ;(this.state.type = t),
                (this.state.value = e),
                this.updateContext(s)
            }),
            (t.prototype.readToken_dot = function () {
              var t = this.input.charCodeAt(this.state.pos + 1)
              if (t >= 48 && t <= 57) return this.readNumber(!0)
              var e = this.input.charCodeAt(this.state.pos + 2)
              return 46 === t && 46 === e
                ? ((this.state.pos += 3), this.finishToken(C.ellipsis))
                : (++this.state.pos, this.finishToken(C.dot))
            }),
            (t.prototype.readToken_slash = function () {
              return this.state.exprAllowed
                ? (++this.state.pos, this.readRegexp())
                : 61 === this.input.charCodeAt(this.state.pos + 1)
                ? this.finishOp(C.assign, 2)
                : this.finishOp(C.slash, 1)
            }),
            (t.prototype.readToken_mult_modulo = function (t) {
              var e = 42 === t ? C.star : C.modulo,
                s = 1,
                i = this.input.charCodeAt(this.state.pos + 1)
              return (
                42 === i &&
                  (s++,
                  (i = this.input.charCodeAt(this.state.pos + 2)),
                  (e = C.exponent)),
                61 === i && (s++, (e = C.assign)),
                this.finishOp(e, s)
              )
            }),
            (t.prototype.readToken_pipe_amp = function (t) {
              var e = this.input.charCodeAt(this.state.pos + 1)
              return e === t
                ? this.finishOp(124 === t ? C.logicalOR : C.logicalAND, 2)
                : 61 === e
                ? this.finishOp(C.assign, 2)
                : 124 === t && 125 === e && this.hasPlugin('flow')
                ? this.finishOp(C.braceBarR, 2)
                : this.finishOp(124 === t ? C.bitwiseOR : C.bitwiseAND, 1)
            }),
            (t.prototype.readToken_caret = function () {
              return 61 === this.input.charCodeAt(this.state.pos + 1)
                ? this.finishOp(C.assign, 2)
                : this.finishOp(C.bitwiseXOR, 1)
            }),
            (t.prototype.readToken_plus_min = function (t) {
              var e = this.input.charCodeAt(this.state.pos + 1)
              return e === t
                ? 45 === e &&
                  62 === this.input.charCodeAt(this.state.pos + 2) &&
                  T.test(
                    this.input.slice(this.state.lastTokEnd, this.state.pos)
                  )
                  ? (this.skipLineComment(3),
                    this.skipSpace(),
                    this.nextToken())
                  : this.finishOp(C.incDec, 2)
                : 61 === e
                ? this.finishOp(C.assign, 2)
                : this.finishOp(C.plusMin, 1)
            }),
            (t.prototype.readToken_lt_gt = function (t) {
              var e = this.input.charCodeAt(this.state.pos + 1),
                s = 1
              return e === t
                ? ((s =
                    62 === t && 62 === this.input.charCodeAt(this.state.pos + 2)
                      ? 3
                      : 2),
                  61 === this.input.charCodeAt(this.state.pos + s)
                    ? this.finishOp(C.assign, s + 1)
                    : this.finishOp(C.bitShift, s))
                : 33 === e &&
                  60 === t &&
                  45 === this.input.charCodeAt(this.state.pos + 2) &&
                  45 === this.input.charCodeAt(this.state.pos + 3)
                ? (this.inModule && this.unexpected(),
                  this.skipLineComment(4),
                  this.skipSpace(),
                  this.nextToken())
                : (61 === e && (s = 2), this.finishOp(C.relational, s))
            }),
            (t.prototype.readToken_eq_excl = function (t) {
              var e = this.input.charCodeAt(this.state.pos + 1)
              return 61 === e
                ? this.finishOp(
                    C.equality,
                    61 === this.input.charCodeAt(this.state.pos + 2) ? 3 : 2
                  )
                : 61 === t && 62 === e
                ? ((this.state.pos += 2), this.finishToken(C.arrow))
                : this.finishOp(61 === t ? C.eq : C.prefix, 1)
            }),
            (t.prototype.getTokenFromCode = function (t) {
              switch (t) {
                case 46:
                  return this.readToken_dot()
                case 40:
                  return ++this.state.pos, this.finishToken(C.parenL)
                case 41:
                  return ++this.state.pos, this.finishToken(C.parenR)
                case 59:
                  return ++this.state.pos, this.finishToken(C.semi)
                case 44:
                  return ++this.state.pos, this.finishToken(C.comma)
                case 91:
                  return ++this.state.pos, this.finishToken(C.bracketL)
                case 93:
                  return ++this.state.pos, this.finishToken(C.bracketR)
                case 123:
                  return this.hasPlugin('flow') &&
                    124 === this.input.charCodeAt(this.state.pos + 1)
                    ? this.finishOp(C.braceBarL, 2)
                    : (++this.state.pos, this.finishToken(C.braceL))
                case 125:
                  return ++this.state.pos, this.finishToken(C.braceR)
                case 58:
                  return this.hasPlugin('functionBind') &&
                    58 === this.input.charCodeAt(this.state.pos + 1)
                    ? this.finishOp(C.doubleColon, 2)
                    : (++this.state.pos, this.finishToken(C.colon))
                case 63:
                  return ++this.state.pos, this.finishToken(C.question)
                case 64:
                  return ++this.state.pos, this.finishToken(C.at)
                case 96:
                  return ++this.state.pos, this.finishToken(C.backQuote)
                case 48:
                  var e = this.input.charCodeAt(this.state.pos + 1)
                  if (120 === e || 88 === e) return this.readRadixNumber(16)
                  if (111 === e || 79 === e) return this.readRadixNumber(8)
                  if (98 === e || 66 === e) return this.readRadixNumber(2)
                case 49:
                case 50:
                case 51:
                case 52:
                case 53:
                case 54:
                case 55:
                case 56:
                case 57:
                  return this.readNumber(!1)
                case 34:
                case 39:
                  return this.readString(t)
                case 47:
                  return this.readToken_slash()
                case 37:
                case 42:
                  return this.readToken_mult_modulo(t)
                case 124:
                case 38:
                  return this.readToken_pipe_amp(t)
                case 94:
                  return this.readToken_caret()
                case 43:
                case 45:
                  return this.readToken_plus_min(t)
                case 60:
                case 62:
                  return this.readToken_lt_gt(t)
                case 61:
                case 33:
                  return this.readToken_eq_excl(t)
                case 126:
                  return this.finishOp(C.prefix, 1)
              }
              this.raise(this.state.pos, "Unexpected character '" + D(t) + "'")
            }),
            (t.prototype.finishOp = function (t, e) {
              var s = this.input.slice(this.state.pos, this.state.pos + e)
              return (this.state.pos += e), this.finishToken(t, s)
            }),
            (t.prototype.readRegexp = function () {
              for (var t = this.state.pos, e = void 0, s = void 0; ; ) {
                this.state.pos >= this.input.length &&
                  this.raise(t, 'Unterminated regular expression')
                var i = this.input.charAt(this.state.pos)
                if (
                  (T.test(i) &&
                    this.raise(t, 'Unterminated regular expression'),
                  e)
                )
                  e = !1
                else {
                  if ('[' === i) s = !0
                  else if (']' === i && s) s = !1
                  else if ('/' === i && !s) break
                  e = '\\' === i
                }
                ++this.state.pos
              }
              var r = this.input.slice(t, this.state.pos)
              ++this.state.pos
              var a = this.readWord1()
              if (a) {
                ;/^[gmsiyu]*$/.test(a) ||
                  this.raise(t, 'Invalid regular expression flag')
              }
              return this.finishToken(C.regexp, {
                pattern: r,
                flags: a,
              })
            }),
            (t.prototype.readInt = function (t, e) {
              for (
                var s = this.state.pos, i = 0, r = 0, a = null == e ? 1 / 0 : e;
                r < a;
                ++r
              ) {
                var n = this.input.charCodeAt(this.state.pos),
                  o = void 0
                if (
                  (o =
                    n >= 97
                      ? n - 97 + 10
                      : n >= 65
                      ? n - 65 + 10
                      : n >= 48 && n <= 57
                      ? n - 48
                      : 1 / 0) >= t
                )
                  break
                ++this.state.pos, (i = i * t + o)
              }
              return this.state.pos === s ||
                (null != e && this.state.pos - s !== e)
                ? null
                : i
            }),
            (t.prototype.readRadixNumber = function (t) {
              this.state.pos += 2
              var e = this.readInt(t)
              return (
                null == e &&
                  this.raise(
                    this.state.start + 2,
                    'Expected number in radix ' + t
                  ),
                f(this.fullCharCodeAtPos()) &&
                  this.raise(
                    this.state.pos,
                    'Identifier directly after number'
                  ),
                this.finishToken(C.num, e)
              )
            }),
            (t.prototype.readNumber = function (t) {
              var e = this.state.pos,
                s = 48 === this.input.charCodeAt(e),
                i = !1
              t || null !== this.readInt(10) || this.raise(e, 'Invalid number'),
                s && this.state.pos == e + 1 && (s = !1)
              var r = this.input.charCodeAt(this.state.pos)
              46 !== r ||
                s ||
                (++this.state.pos,
                this.readInt(10),
                (i = !0),
                (r = this.input.charCodeAt(this.state.pos))),
                (69 !== r && 101 !== r) ||
                  s ||
                  ((43 !== (r = this.input.charCodeAt(++this.state.pos)) &&
                    45 !== r) ||
                    ++this.state.pos,
                  null === this.readInt(10) && this.raise(e, 'Invalid number'),
                  (i = !0)),
                f(this.fullCharCodeAtPos()) &&
                  this.raise(this.state.pos, 'Identifier directly after number')
              var a = this.input.slice(e, this.state.pos),
                n = void 0
              return (
                i
                  ? (n = parseFloat(a))
                  : s && 1 !== a.length
                  ? this.state.strict
                    ? this.raise(e, 'Invalid number')
                    : (n = /[89]/.test(a) ? parseInt(a, 10) : parseInt(a, 8))
                  : (n = parseInt(a, 10)),
                this.finishToken(C.num, n)
              )
            }),
            (t.prototype.readCodePoint = function (t) {
              var e = void 0
              if (123 === this.input.charCodeAt(this.state.pos)) {
                var s = ++this.state.pos
                if (
                  ((e = this.readHexChar(
                    this.input.indexOf('}', this.state.pos) - this.state.pos,
                    t
                  )),
                  ++this.state.pos,
                  null === e)
                )
                  --this.state.invalidTemplateEscapePosition
                else if (e > 1114111) {
                  if (!t)
                    return (
                      (this.state.invalidTemplateEscapePosition = s - 2), null
                    )
                  this.raise(s, 'Code point out of bounds')
                }
              } else e = this.readHexChar(4, t)
              return e
            }),
            (t.prototype.readString = function (t) {
              for (var e = '', s = ++this.state.pos; ; ) {
                this.state.pos >= this.input.length &&
                  this.raise(this.state.start, 'Unterminated string constant')
                var i = this.input.charCodeAt(this.state.pos)
                if (i === t) break
                92 === i
                  ? ((e += this.input.slice(s, this.state.pos)),
                    (e += this.readEscapedChar(!1)),
                    (s = this.state.pos))
                  : (k(i) &&
                      this.raise(
                        this.state.start,
                        'Unterminated string constant'
                      ),
                    ++this.state.pos)
              }
              return (
                (e += this.input.slice(s, this.state.pos++)),
                this.finishToken(C.string, e)
              )
            }),
            (t.prototype.readTmplToken = function () {
              for (var t = '', e = this.state.pos, s = !1; ; ) {
                this.state.pos >= this.input.length &&
                  this.raise(this.state.start, 'Unterminated template')
                var i = this.input.charCodeAt(this.state.pos)
                if (
                  96 === i ||
                  (36 === i &&
                    123 === this.input.charCodeAt(this.state.pos + 1))
                )
                  return this.state.pos === this.state.start &&
                    this.match(C.template)
                    ? 36 === i
                      ? ((this.state.pos += 2),
                        this.finishToken(C.dollarBraceL))
                      : (++this.state.pos, this.finishToken(C.backQuote))
                    : ((t += this.input.slice(e, this.state.pos)),
                      this.finishToken(C.template, s ? null : t))
                if (92 === i) {
                  t += this.input.slice(e, this.state.pos)
                  var r = this.readEscapedChar(!0)
                  null === r ? (s = !0) : (t += r), (e = this.state.pos)
                } else if (k(i)) {
                  switch (
                    ((t += this.input.slice(e, this.state.pos)),
                    ++this.state.pos,
                    i)
                  ) {
                    case 13:
                      10 === this.input.charCodeAt(this.state.pos) &&
                        ++this.state.pos
                    case 10:
                      t += '\n'
                      break
                    default:
                      t += String.fromCharCode(i)
                  }
                  ++this.state.curLine,
                    (this.state.lineStart = this.state.pos),
                    (e = this.state.pos)
                } else ++this.state.pos
              }
            }),
            (t.prototype.readEscapedChar = function (t) {
              var e = !t,
                s = this.input.charCodeAt(++this.state.pos)
              switch ((++this.state.pos, s)) {
                case 110:
                  return '\n'
                case 114:
                  return '\r'
                case 120:
                  var i = this.readHexChar(2, e)
                  return null === i ? null : String.fromCharCode(i)
                case 117:
                  var r = this.readCodePoint(e)
                  return null === r ? null : D(r)
                case 116:
                  return '\t'
                case 98:
                  return '\b'
                case 118:
                  return '\v'
                case 102:
                  return '\f'
                case 13:
                  10 === this.input.charCodeAt(this.state.pos) &&
                    ++this.state.pos
                case 10:
                  return (
                    (this.state.lineStart = this.state.pos),
                    ++this.state.curLine,
                    ''
                  )
                default:
                  if (s >= 48 && s <= 55) {
                    var a = this.state.pos - 1,
                      n = this.input
                        .substr(this.state.pos - 1, 3)
                        .match(/^[0-7]+/)[0],
                      o = parseInt(n, 8)
                    if (
                      (o > 255 && ((n = n.slice(0, -1)), (o = parseInt(n, 8))),
                      o > 0)
                    ) {
                      if (t)
                        return (
                          (this.state.invalidTemplateEscapePosition = a), null
                        )
                      this.state.strict
                        ? this.raise(a, 'Octal literal in strict mode')
                        : this.state.containsOctal ||
                          ((this.state.containsOctal = !0),
                          (this.state.octalPosition = a))
                    }
                    return (
                      (this.state.pos += n.length - 1), String.fromCharCode(o)
                    )
                  }
                  return String.fromCharCode(s)
              }
            }),
            (t.prototype.readHexChar = function (t, e) {
              var s = this.state.pos,
                i = this.readInt(16, t)
              return (
                null === i &&
                  (e
                    ? this.raise(s, 'Bad character escape sequence')
                    : ((this.state.pos = s - 1),
                      (this.state.invalidTemplateEscapePosition = s - 1))),
                i
              )
            }),
            (t.prototype.readWord1 = function () {
              this.state.containsEsc = !1
              for (
                var t = '', e = !0, s = this.state.pos;
                this.state.pos < this.input.length;

              ) {
                var i = this.fullCharCodeAtPos()
                if (d(i)) this.state.pos += i <= 65535 ? 1 : 2
                else {
                  if (92 !== i) break
                  ;(this.state.containsEsc = !0),
                    (t += this.input.slice(s, this.state.pos))
                  var r = this.state.pos
                  117 !== this.input.charCodeAt(++this.state.pos) &&
                    this.raise(
                      this.state.pos,
                      'Expecting Unicode escape sequence \\uXXXX'
                    ),
                    ++this.state.pos
                  var a = this.readCodePoint(!0)
                  ;(e ? f : d)(a, !0) ||
                    this.raise(r, 'Invalid Unicode escape'),
                    (t += D(a)),
                    (s = this.state.pos)
                }
                e = !1
              }
              return t + this.input.slice(s, this.state.pos)
            }),
            (t.prototype.readWord = function () {
              var t = this.readWord1(),
                e = C.name
              return (
                !this.state.containsEsc && this.isKeyword(t) && (e = P[t]),
                this.finishToken(e, t)
              )
            }),
            (t.prototype.braceIsBlock = function (t) {
              if (t === C.colon) {
                var e = this.curContext()
                if (e === I.braceStatement || e === I.braceExpression)
                  return !e.isExpr
              }
              return t === C._return
                ? T.test(
                    this.input.slice(this.state.lastTokEnd, this.state.start)
                  )
                : t === C._else ||
                    t === C.semi ||
                    t === C.eof ||
                    t === C.parenR ||
                    (t === C.braceL
                      ? this.curContext() === I.braceStatement
                      : !this.state.exprAllowed)
            }),
            (t.prototype.updateContext = function (t) {
              var e = this.state.type,
                s = void 0
              e.keyword && t === C.dot
                ? (this.state.exprAllowed = !1)
                : (s = e.updateContext)
                ? s.call(this, t)
                : (this.state.exprAllowed = e.beforeExpr)
            }),
            t
          )
        })(),
        F = {},
        M = [
          'jsx',
          'doExpressions',
          'objectRestSpread',
          'decorators',
          'classProperties',
          'exportExtensions',
          'asyncGenerators',
          'functionBind',
          'functionSent',
          'dynamicImport',
          'flow',
        ],
        B = (function (t) {
          function e(s, i) {
            v(this, e),
              (s = (function (t) {
                var e = {}
                for (var s in m) e[s] = t && s in t ? t[s] : m[s]
                return e
              })(s))
            var r = b(this, t.call(this, s, i))
            return (
              (r.options = s),
              (r.inModule = 'module' === r.options.sourceType),
              (r.input = i),
              (r.plugins = r.loadPlugins(r.options.plugins)),
              (r.filename = s.sourceFilename),
              0 === r.state.pos &&
                '#' === r.input[0] &&
                '!' === r.input[1] &&
                r.skipLineComment(2),
              r
            )
          }
          return (
            x(e, t),
            (e.prototype.isReservedWord = function (t) {
              return 'await' === t ? this.inModule : r[6](t)
            }),
            (e.prototype.hasPlugin = function (t) {
              return (
                !!(this.plugins['*'] && M.indexOf(t) > -1) || !!this.plugins[t]
              )
            }),
            (e.prototype.extend = function (t, e) {
              this[t] = e(this[t])
            }),
            (e.prototype.loadAllPlugins = function () {
              var t = this,
                e = Object.keys(F).filter(function (t) {
                  return 'flow' !== t && 'estree' !== t
                })
              e.push('flow'),
                e.forEach(function (e) {
                  var s = F[e]
                  s && s(t)
                })
            }),
            (e.prototype.loadPlugins = function (t) {
              if (t.indexOf('*') >= 0) return this.loadAllPlugins(), { '*': !0 }
              var e = {}
              t.indexOf('flow') >= 0 &&
                (t = t.filter(function (t) {
                  return 'flow' !== t
                })).push('flow'),
                t.indexOf('estree') >= 0 &&
                  (t = t.filter(function (t) {
                    return 'estree' !== t
                  })).unshift('estree')
              var s = t,
                i = Array.isArray(s),
                r = 0
              for (s = i ? s : s[Symbol.iterator](); ; ) {
                var a
                if (i) {
                  if (r >= s.length) break
                  a = s[r++]
                } else {
                  if ((r = s.next()).done) break
                  a = r.value
                }
                var n = a
                if (!e[n]) {
                  e[n] = !0
                  var o = F[n]
                  o && o(this)
                }
              }
              return e
            }),
            (e.prototype.parse = function () {
              var t = this.startNode(),
                e = this.startNode()
              return this.nextToken(), this.parseTopLevel(t, e)
            }),
            e
          )
        })(R),
        U = B.prototype
      ;(U.addExtra = function (t, e, s) {
        t && ((t.extra = t.extra || {})[e] = s)
      }),
        (U.isRelational = function (t) {
          return this.match(C.relational) && this.state.value === t
        }),
        (U.expectRelational = function (t) {
          this.isRelational(t)
            ? this.next()
            : this.unexpected(null, C.relational)
        }),
        (U.isContextual = function (t) {
          return this.match(C.name) && this.state.value === t
        }),
        (U.eatContextual = function (t) {
          return this.state.value === t && this.eat(C.name)
        }),
        (U.expectContextual = function (t, e) {
          this.eatContextual(t) || this.unexpected(null, e)
        }),
        (U.canInsertSemicolon = function () {
          return (
            this.match(C.eof) ||
            this.match(C.braceR) ||
            T.test(this.input.slice(this.state.lastTokEnd, this.state.start))
          )
        }),
        (U.isLineTerminator = function () {
          return this.eat(C.semi) || this.canInsertSemicolon()
        }),
        (U.semicolon = function () {
          this.isLineTerminator() || this.unexpected(null, C.semi)
        }),
        (U.expect = function (t, e) {
          return this.eat(t) || this.unexpected(e, t)
        }),
        (U.unexpected = function (t) {
          var e =
            arguments.length > 1 && void 0 !== arguments[1]
              ? arguments[1]
              : 'Unexpected token'
          e &&
            'object' === (void 0 === e ? 'undefined' : y(e)) &&
            e.label &&
            (e = 'Unexpected token, expected ' + e.label),
            this.raise(null != t ? t : this.state.start, e)
        })
      var q = B.prototype
      q.parseTopLevel = function (t, e) {
        return (
          (e.sourceType = this.options.sourceType),
          this.parseBlockBody(e, !0, !0, C.eof),
          (t.program = this.finishNode(e, 'Program')),
          (t.comments = this.state.comments),
          (t.tokens = this.state.tokens),
          this.finishNode(t, 'File')
        )
      }
      var V = { kind: 'loop' },
        X = { kind: 'switch' }
      ;(q.stmtToDirective = function (t) {
        var e = t.expression,
          s = this.startNodeAt(e.start, e.loc.start),
          i = this.startNodeAt(t.start, t.loc.start),
          r = this.input.slice(e.start, e.end),
          a = (s.value = r.slice(1, -1))
        return (
          this.addExtra(s, 'raw', r),
          this.addExtra(s, 'rawValue', a),
          (i.value = this.finishNodeAt(
            s,
            'DirectiveLiteral',
            e.end,
            e.loc.end
          )),
          this.finishNodeAt(i, 'Directive', t.end, t.loc.end)
        )
      }),
        (q.parseStatement = function (t, e) {
          this.match(C.at) && this.parseDecorators(!0)
          var s = this.state.type,
            i = this.startNode()
          switch (s) {
            case C._break:
            case C._continue:
              return this.parseBreakContinueStatement(i, s.keyword)
            case C._debugger:
              return this.parseDebuggerStatement(i)
            case C._do:
              return this.parseDoStatement(i)
            case C._for:
              return this.parseForStatement(i)
            case C._function:
              return t || this.unexpected(), this.parseFunctionStatement(i)
            case C._class:
              return t || this.unexpected(), this.parseClass(i, !0)
            case C._if:
              return this.parseIfStatement(i)
            case C._return:
              return this.parseReturnStatement(i)
            case C._switch:
              return this.parseSwitchStatement(i)
            case C._throw:
              return this.parseThrowStatement(i)
            case C._try:
              return this.parseTryStatement(i)
            case C._let:
            case C._const:
              t || this.unexpected()
            case C._var:
              return this.parseVarStatement(i, s)
            case C._while:
              return this.parseWhileStatement(i)
            case C._with:
              return this.parseWithStatement(i)
            case C.braceL:
              return this.parseBlock()
            case C.semi:
              return this.parseEmptyStatement(i)
            case C._export:
            case C._import:
              if (
                this.hasPlugin('dynamicImport') &&
                this.lookahead().type === C.parenL
              )
                break
              return (
                this.options.allowImportExportEverywhere ||
                  (e ||
                    this.raise(
                      this.state.start,
                      "'import' and 'export' may only appear at the top level"
                    ),
                  this.inModule ||
                    this.raise(
                      this.state.start,
                      "'import' and 'export' may appear only with 'sourceType: \"module\"'"
                    )),
                s === C._import ? this.parseImport(i) : this.parseExport(i)
              )
            case C.name:
              if ('async' === this.state.value) {
                var r = this.state.clone()
                if (
                  (this.next(),
                  this.match(C._function) && !this.canInsertSemicolon())
                )
                  return (
                    this.expect(C._function), this.parseFunction(i, !0, !1, !0)
                  )
                this.state = r
              }
          }
          var a = this.state.value,
            n = this.parseExpression()
          return s === C.name && 'Identifier' === n.type && this.eat(C.colon)
            ? this.parseLabeledStatement(i, a, n)
            : this.parseExpressionStatement(i, n)
        }),
        (q.takeDecorators = function (t) {
          this.state.decorators.length &&
            ((t.decorators = this.state.decorators),
            (this.state.decorators = []))
        }),
        (q.parseDecorators = function (t) {
          for (; this.match(C.at); ) {
            var e = this.parseDecorator()
            this.state.decorators.push(e)
          }
          ;(t && this.match(C._export)) ||
            this.match(C._class) ||
            this.raise(
              this.state.start,
              'Leading decorators must be attached to a class declaration'
            )
        }),
        (q.parseDecorator = function () {
          this.hasPlugin('decorators') || this.unexpected()
          var t = this.startNode()
          return (
            this.next(),
            (t.expression = this.parseMaybeAssign()),
            this.finishNode(t, 'Decorator')
          )
        }),
        (q.parseBreakContinueStatement = function (t, e) {
          var s = 'break' === e
          this.next(),
            this.isLineTerminator()
              ? (t.label = null)
              : this.match(C.name)
              ? ((t.label = this.parseIdentifier()), this.semicolon())
              : this.unexpected()
          var i = void 0
          for (i = 0; i < this.state.labels.length; ++i) {
            var r = this.state.labels[i]
            if (null == t.label || r.name === t.label.name) {
              if (null != r.kind && (s || 'loop' === r.kind)) break
              if (t.label && s) break
            }
          }
          return (
            i === this.state.labels.length &&
              this.raise(t.start, 'Unsyntactic ' + e),
            this.finishNode(t, s ? 'BreakStatement' : 'ContinueStatement')
          )
        }),
        (q.parseDebuggerStatement = function (t) {
          return (
            this.next(),
            this.semicolon(),
            this.finishNode(t, 'DebuggerStatement')
          )
        }),
        (q.parseDoStatement = function (t) {
          return (
            this.next(),
            this.state.labels.push(V),
            (t.body = this.parseStatement(!1)),
            this.state.labels.pop(),
            this.expect(C._while),
            (t.test = this.parseParenExpression()),
            this.eat(C.semi),
            this.finishNode(t, 'DoWhileStatement')
          )
        }),
        (q.parseForStatement = function (t) {
          this.next(), this.state.labels.push(V)
          var e = !1
          if (
            (this.hasPlugin('asyncGenerators') &&
              this.state.inAsync &&
              this.isContextual('await') &&
              ((e = !0), this.next()),
            this.expect(C.parenL),
            this.match(C.semi))
          )
            return e && this.unexpected(), this.parseFor(t, null)
          if (
            this.match(C._var) ||
            this.match(C._let) ||
            this.match(C._const)
          ) {
            var s = this.startNode(),
              i = this.state.type
            return (
              this.next(),
              this.parseVar(s, !0, i),
              this.finishNode(s, 'VariableDeclaration'),
              (!this.match(C._in) && !this.isContextual('of')) ||
              1 !== s.declarations.length ||
              s.declarations[0].init
                ? (e && this.unexpected(), this.parseFor(t, s))
                : this.parseForIn(t, s, e)
            )
          }
          var r = { start: 0 },
            a = this.parseExpression(!0, r)
          if (this.match(C._in) || this.isContextual('of')) {
            var n = this.isContextual('of')
              ? 'for-of statement'
              : 'for-in statement'
            return (
              this.toAssignable(a, void 0, n),
              this.checkLVal(a, void 0, void 0, n),
              this.parseForIn(t, a, e)
            )
          }
          return (
            r.start && this.unexpected(r.start),
            e && this.unexpected(),
            this.parseFor(t, a)
          )
        }),
        (q.parseFunctionStatement = function (t) {
          return this.next(), this.parseFunction(t, !0)
        }),
        (q.parseIfStatement = function (t) {
          return (
            this.next(),
            (t.test = this.parseParenExpression()),
            (t.consequent = this.parseStatement(!1)),
            (t.alternate = this.eat(C._else) ? this.parseStatement(!1) : null),
            this.finishNode(t, 'IfStatement')
          )
        }),
        (q.parseReturnStatement = function (t) {
          return (
            this.state.inFunction ||
              this.options.allowReturnOutsideFunction ||
              this.raise(this.state.start, "'return' outside of function"),
            this.next(),
            this.isLineTerminator()
              ? (t.argument = null)
              : ((t.argument = this.parseExpression()), this.semicolon()),
            this.finishNode(t, 'ReturnStatement')
          )
        }),
        (q.parseSwitchStatement = function (t) {
          this.next(),
            (t.discriminant = this.parseParenExpression()),
            (t.cases = []),
            this.expect(C.braceL),
            this.state.labels.push(X)
          for (var e, s = void 0; !this.match(C.braceR); )
            if (this.match(C._case) || this.match(C._default)) {
              var i = this.match(C._case)
              s && this.finishNode(s, 'SwitchCase'),
                t.cases.push((s = this.startNode())),
                (s.consequent = []),
                this.next(),
                i
                  ? (s.test = this.parseExpression())
                  : (e &&
                      this.raise(
                        this.state.lastTokStart,
                        'Multiple default clauses'
                      ),
                    (e = !0),
                    (s.test = null)),
                this.expect(C.colon)
            } else
              s ? s.consequent.push(this.parseStatement(!0)) : this.unexpected()
          return (
            s && this.finishNode(s, 'SwitchCase'),
            this.next(),
            this.state.labels.pop(),
            this.finishNode(t, 'SwitchStatement')
          )
        }),
        (q.parseThrowStatement = function (t) {
          return (
            this.next(),
            T.test(this.input.slice(this.state.lastTokEnd, this.state.start)) &&
              this.raise(this.state.lastTokEnd, 'Illegal newline after throw'),
            (t.argument = this.parseExpression()),
            this.semicolon(),
            this.finishNode(t, 'ThrowStatement')
          )
        })
      var W = []
      ;(q.parseTryStatement = function (t) {
        if (
          (this.next(),
          (t.block = this.parseBlock()),
          (t.handler = null),
          this.match(C._catch))
        ) {
          var e = this.startNode()
          this.next(),
            this.expect(C.parenL),
            (e.param = this.parseBindingAtom()),
            this.checkLVal(e.param, !0, Object.create(null), 'catch clause'),
            this.expect(C.parenR),
            (e.body = this.parseBlock()),
            (t.handler = this.finishNode(e, 'CatchClause'))
        }
        return (
          (t.guardedHandlers = W),
          (t.finalizer = this.eat(C._finally) ? this.parseBlock() : null),
          t.handler ||
            t.finalizer ||
            this.raise(t.start, 'Missing catch or finally clause'),
          this.finishNode(t, 'TryStatement')
        )
      }),
        (q.parseVarStatement = function (t, e) {
          return (
            this.next(),
            this.parseVar(t, !1, e),
            this.semicolon(),
            this.finishNode(t, 'VariableDeclaration')
          )
        }),
        (q.parseWhileStatement = function (t) {
          return (
            this.next(),
            (t.test = this.parseParenExpression()),
            this.state.labels.push(V),
            (t.body = this.parseStatement(!1)),
            this.state.labels.pop(),
            this.finishNode(t, 'WhileStatement')
          )
        }),
        (q.parseWithStatement = function (t) {
          return (
            this.state.strict &&
              this.raise(this.state.start, "'with' in strict mode"),
            this.next(),
            (t.object = this.parseParenExpression()),
            (t.body = this.parseStatement(!1)),
            this.finishNode(t, 'WithStatement')
          )
        }),
        (q.parseEmptyStatement = function (t) {
          return this.next(), this.finishNode(t, 'EmptyStatement')
        }),
        (q.parseLabeledStatement = function (t, e, s) {
          var i = this.state.labels,
            r = Array.isArray(i),
            a = 0
          for (i = r ? i : i[Symbol.iterator](); ; ) {
            var n
            if (r) {
              if (a >= i.length) break
              n = i[a++]
            } else {
              if ((a = i.next()).done) break
              n = a.value
            }
            n.name === e &&
              this.raise(s.start, "Label '" + e + "' is already declared")
          }
          for (
            var o = this.state.type.isLoop
                ? 'loop'
                : this.match(C._switch)
                ? 'switch'
                : null,
              h = this.state.labels.length - 1;
            h >= 0;
            h--
          ) {
            var c = this.state.labels[h]
            if (c.statementStart !== t.start) break
            ;(c.statementStart = this.state.start), (c.kind = o)
          }
          return (
            this.state.labels.push({
              name: e,
              kind: o,
              statementStart: this.state.start,
            }),
            (t.body = this.parseStatement(!0)),
            this.state.labels.pop(),
            (t.label = s),
            this.finishNode(t, 'LabeledStatement')
          )
        }),
        (q.parseExpressionStatement = function (t, e) {
          return (
            (t.expression = e),
            this.semicolon(),
            this.finishNode(t, 'ExpressionStatement')
          )
        }),
        (q.parseBlock = function (t) {
          var e = this.startNode()
          return (
            this.expect(C.braceL),
            this.parseBlockBody(e, t, !1, C.braceR),
            this.finishNode(e, 'BlockStatement')
          )
        }),
        (q.isValidDirective = function (t) {
          return (
            'ExpressionStatement' === t.type &&
            'StringLiteral' === t.expression.type &&
            !t.expression.extra.parenthesized
          )
        }),
        (q.parseBlockBody = function (t, e, s, i) {
          ;(t.body = []), (t.directives = [])
          for (var r = !1, a = void 0, n = void 0; !this.eat(i); ) {
            r ||
              !this.state.containsOctal ||
              n ||
              (n = this.state.octalPosition)
            var o = this.parseStatement(!0, s)
            if (e && !r && this.isValidDirective(o)) {
              var h = this.stmtToDirective(o)
              t.directives.push(h),
                void 0 === a &&
                  'use strict' === h.value.value &&
                  ((a = this.state.strict),
                  this.setStrict(!0),
                  n && this.raise(n, 'Octal literal in strict mode'))
            } else (r = !0), t.body.push(o)
          }
          !1 === a && this.setStrict(!1)
        }),
        (q.parseFor = function (t, e) {
          return (
            (t.init = e),
            this.expect(C.semi),
            (t.test = this.match(C.semi) ? null : this.parseExpression()),
            this.expect(C.semi),
            (t.update = this.match(C.parenR) ? null : this.parseExpression()),
            this.expect(C.parenR),
            (t.body = this.parseStatement(!1)),
            this.state.labels.pop(),
            this.finishNode(t, 'ForStatement')
          )
        }),
        (q.parseForIn = function (t, e, s) {
          var i = void 0
          return (
            s
              ? (this.eatContextual('of'), (i = 'ForAwaitStatement'))
              : ((i = this.match(C._in) ? 'ForInStatement' : 'ForOfStatement'),
                this.next()),
            (t.left = e),
            (t.right = this.parseExpression()),
            this.expect(C.parenR),
            (t.body = this.parseStatement(!1)),
            this.state.labels.pop(),
            this.finishNode(t, i)
          )
        }),
        (q.parseVar = function (t, e, s) {
          for (t.declarations = [], t.kind = s.keyword; ; ) {
            var i = this.startNode()
            if (
              (this.parseVarHead(i),
              this.eat(C.eq)
                ? (i.init = this.parseMaybeAssign(e))
                : s !== C._const || this.match(C._in) || this.isContextual('of')
                ? 'Identifier' === i.id.type ||
                  (e && (this.match(C._in) || this.isContextual('of')))
                  ? (i.init = null)
                  : this.raise(
                      this.state.lastTokEnd,
                      'Complex binding patterns require an initialization value'
                    )
                : this.unexpected(),
              t.declarations.push(this.finishNode(i, 'VariableDeclarator')),
              !this.eat(C.comma))
            )
              break
          }
          return t
        }),
        (q.parseVarHead = function (t) {
          ;(t.id = this.parseBindingAtom()),
            this.checkLVal(t.id, !0, void 0, 'variable declaration')
        }),
        (q.parseFunction = function (t, e, s, i, r) {
          var a = this.state.inMethod
          return (
            (this.state.inMethod = !1),
            this.initFunction(t, i),
            this.match(C.star) &&
              (t.async && !this.hasPlugin('asyncGenerators')
                ? this.unexpected()
                : ((t.generator = !0), this.next())),
            !e ||
              r ||
              this.match(C.name) ||
              this.match(C._yield) ||
              this.unexpected(),
            (this.match(C.name) || this.match(C._yield)) &&
              (t.id = this.parseBindingIdentifier()),
            this.parseFunctionParams(t),
            this.parseFunctionBody(t, s),
            (this.state.inMethod = a),
            this.finishNode(t, e ? 'FunctionDeclaration' : 'FunctionExpression')
          )
        }),
        (q.parseFunctionParams = function (t) {
          this.expect(C.parenL), (t.params = this.parseBindingList(C.parenR))
        }),
        (q.parseClass = function (t, e, s) {
          return (
            this.next(),
            this.takeDecorators(t),
            this.parseClassId(t, e, s),
            this.parseClassSuper(t),
            this.parseClassBody(t),
            this.finishNode(t, e ? 'ClassDeclaration' : 'ClassExpression')
          )
        }),
        (q.isClassProperty = function () {
          return this.match(C.eq) || this.match(C.semi) || this.match(C.braceR)
        }),
        (q.isClassMethod = function () {
          return this.match(C.parenL)
        }),
        (q.isNonstaticConstructor = function (t) {
          return !(
            t.computed ||
            t.static ||
            ('constructor' !== t.key.name && 'constructor' !== t.key.value)
          )
        }),
        (q.parseClassBody = function (t) {
          var e = this.state.strict
          this.state.strict = !0
          var s = !1,
            i = !1,
            r = [],
            a = this.startNode()
          for (a.body = [], this.expect(C.braceL); !this.eat(C.braceR); )
            if (this.eat(C.semi))
              r.length > 0 &&
                this.raise(
                  this.state.lastTokEnd,
                  'Decorators must not be followed by a semicolon'
                )
            else if (this.match(C.at)) r.push(this.parseDecorator())
            else {
              var n = this.startNode()
              if (
                (r.length && ((n.decorators = r), (r = [])),
                (n.static = !1),
                this.match(C.name) && 'static' === this.state.value)
              ) {
                var o = this.parseIdentifier(!0)
                if (this.isClassMethod()) {
                  ;(n.kind = 'method'),
                    (n.computed = !1),
                    (n.key = o),
                    this.parseClassMethod(a, n, !1, !1)
                  continue
                }
                if (this.isClassProperty()) {
                  ;(n.computed = !1),
                    (n.key = o),
                    a.body.push(this.parseClassProperty(n))
                  continue
                }
                n.static = !0
              }
              if (this.eat(C.star))
                (n.kind = 'method'),
                  this.parsePropertyName(n),
                  this.isNonstaticConstructor(n) &&
                    this.raise(n.key.start, "Constructor can't be a generator"),
                  n.computed ||
                    !n.static ||
                    ('prototype' !== n.key.name &&
                      'prototype' !== n.key.value) ||
                    this.raise(
                      n.key.start,
                      'Classes may not have static property named prototype'
                    ),
                  this.parseClassMethod(a, n, !0, !1)
              else {
                var h = this.match(C.name),
                  c = this.parsePropertyName(n)
                if (
                  (n.computed ||
                    !n.static ||
                    ('prototype' !== n.key.name &&
                      'prototype' !== n.key.value) ||
                    this.raise(
                      n.key.start,
                      'Classes may not have static property named prototype'
                    ),
                  this.isClassMethod())
                )
                  this.isNonstaticConstructor(n)
                    ? (i
                        ? this.raise(
                            c.start,
                            'Duplicate constructor in the same class'
                          )
                        : n.decorators &&
                          this.raise(
                            n.start,
                            "You can't attach decorators to a class constructor"
                          ),
                      (i = !0),
                      (n.kind = 'constructor'))
                    : (n.kind = 'method'),
                    this.parseClassMethod(a, n, !1, !1)
                else if (this.isClassProperty())
                  this.isNonstaticConstructor(n) &&
                    this.raise(
                      n.key.start,
                      "Classes may not have a non-static field named 'constructor'"
                    ),
                    a.body.push(this.parseClassProperty(n))
                else if (h && 'async' === c.name && !this.isLineTerminator()) {
                  var l = this.hasPlugin('asyncGenerators') && this.eat(C.star)
                  ;(n.kind = 'method'),
                    this.parsePropertyName(n),
                    this.isNonstaticConstructor(n) &&
                      this.raise(
                        n.key.start,
                        "Constructor can't be an async function"
                      ),
                    this.parseClassMethod(a, n, l, !0)
                } else
                  !h ||
                  ('get' !== c.name && 'set' !== c.name) ||
                  (this.isLineTerminator() && this.match(C.star))
                    ? this.hasPlugin('classConstructorCall') &&
                      h &&
                      'call' === c.name &&
                      this.match(C.name) &&
                      'constructor' === this.state.value
                      ? (s
                          ? this.raise(
                              n.start,
                              'Duplicate constructor call in the same class'
                            )
                          : n.decorators &&
                            this.raise(
                              n.start,
                              "You can't attach decorators to a class constructor"
                            ),
                        (s = !0),
                        (n.kind = 'constructorCall'),
                        this.parsePropertyName(n),
                        this.parseClassMethod(a, n, !1, !1))
                      : this.isLineTerminator()
                      ? (this.isNonstaticConstructor(n) &&
                          this.raise(
                            n.key.start,
                            "Classes may not have a non-static field named 'constructor'"
                          ),
                        a.body.push(this.parseClassProperty(n)))
                      : this.unexpected()
                    : ((n.kind = c.name),
                      this.parsePropertyName(n),
                      this.isNonstaticConstructor(n) &&
                        this.raise(
                          n.key.start,
                          "Constructor can't have get/set modifier"
                        ),
                      this.parseClassMethod(a, n, !1, !1),
                      this.checkGetterSetterParamCount(n))
              }
            }
          r.length &&
            this.raise(
              this.state.start,
              'You have trailing decorators with no method'
            ),
            (t.body = this.finishNode(a, 'ClassBody')),
            (this.state.strict = e)
        }),
        (q.parseClassProperty = function (t) {
          return (
            (this.state.inClassProperty = !0),
            this.match(C.eq)
              ? (this.hasPlugin('classProperties') || this.unexpected(),
                this.next(),
                (t.value = this.parseMaybeAssign()))
              : (t.value = null),
            this.semicolon(),
            (this.state.inClassProperty = !1),
            this.finishNode(t, 'ClassProperty')
          )
        }),
        (q.parseClassMethod = function (t, e, s, i) {
          this.parseMethod(e, s, i),
            t.body.push(this.finishNode(e, 'ClassMethod'))
        }),
        (q.parseClassId = function (t, e, s) {
          this.match(C.name)
            ? (t.id = this.parseIdentifier())
            : s || !e
            ? (t.id = null)
            : this.unexpected()
        }),
        (q.parseClassSuper = function (t) {
          t.superClass = this.eat(C._extends)
            ? this.parseExprSubscripts()
            : null
        }),
        (q.parseExport = function (t) {
          if ((this.next(), this.match(C.star))) {
            var e = this.startNode()
            if (
              (this.next(),
              !this.hasPlugin('exportExtensions') || !this.eatContextual('as'))
            )
              return (
                this.parseExportFrom(t, !0),
                this.finishNode(t, 'ExportAllDeclaration')
              )
            ;(e.exported = this.parseIdentifier()),
              (t.specifiers = [this.finishNode(e, 'ExportNamespaceSpecifier')]),
              this.parseExportSpecifiersMaybe(t),
              this.parseExportFrom(t, !0)
          } else if (
            this.hasPlugin('exportExtensions') &&
            this.isExportDefaultSpecifier()
          ) {
            var s = this.startNode()
            if (
              ((s.exported = this.parseIdentifier(!0)),
              (t.specifiers = [this.finishNode(s, 'ExportDefaultSpecifier')]),
              this.match(C.comma) && this.lookahead().type === C.star)
            ) {
              this.expect(C.comma)
              var i = this.startNode()
              this.expect(C.star),
                this.expectContextual('as'),
                (i.exported = this.parseIdentifier()),
                t.specifiers.push(
                  this.finishNode(i, 'ExportNamespaceSpecifier')
                )
            } else this.parseExportSpecifiersMaybe(t)
            this.parseExportFrom(t, !0)
          } else {
            if (this.eat(C._default)) {
              var r = this.startNode(),
                a = !1
              return (
                this.eat(C._function)
                  ? (r = this.parseFunction(r, !0, !1, !1, !0))
                  : this.match(C._class)
                  ? (r = this.parseClass(r, !0, !0))
                  : ((a = !0), (r = this.parseMaybeAssign())),
                (t.declaration = r),
                a && this.semicolon(),
                this.checkExport(t, !0, !0),
                this.finishNode(t, 'ExportDefaultDeclaration')
              )
            }
            this.shouldParseExportDeclaration()
              ? ((t.specifiers = []),
                (t.source = null),
                (t.declaration = this.parseExportDeclaration(t)))
              : ((t.declaration = null),
                (t.specifiers = this.parseExportSpecifiers()),
                this.parseExportFrom(t))
          }
          return (
            this.checkExport(t, !0),
            this.finishNode(t, 'ExportNamedDeclaration')
          )
        }),
        (q.parseExportDeclaration = function () {
          return this.parseStatement(!0)
        }),
        (q.isExportDefaultSpecifier = function () {
          if (this.match(C.name)) return 'async' !== this.state.value
          if (!this.match(C._default)) return !1
          var t = this.lookahead()
          return t.type === C.comma || (t.type === C.name && 'from' === t.value)
        }),
        (q.parseExportSpecifiersMaybe = function (t) {
          this.eat(C.comma) &&
            (t.specifiers = t.specifiers.concat(this.parseExportSpecifiers()))
        }),
        (q.parseExportFrom = function (t, e) {
          this.eatContextual('from')
            ? ((t.source = this.match(C.string)
                ? this.parseExprAtom()
                : this.unexpected()),
              this.checkExport(t))
            : e
            ? this.unexpected()
            : (t.source = null),
            this.semicolon()
        }),
        (q.shouldParseExportDeclaration = function () {
          return (
            'var' === this.state.type.keyword ||
            'const' === this.state.type.keyword ||
            'let' === this.state.type.keyword ||
            'function' === this.state.type.keyword ||
            'class' === this.state.type.keyword ||
            this.isContextual('async')
          )
        }),
        (q.checkExport = function (t, e, s) {
          if (e)
            if (s) this.checkDuplicateExports(t, 'default')
            else if (t.specifiers && t.specifiers.length) {
              var i = t.specifiers,
                r = Array.isArray(i),
                a = 0
              for (i = r ? i : i[Symbol.iterator](); ; ) {
                var n
                if (r) {
                  if (a >= i.length) break
                  n = i[a++]
                } else {
                  if ((a = i.next()).done) break
                  n = a.value
                }
                var o = n
                this.checkDuplicateExports(o, o.exported.name)
              }
            } else if (t.declaration)
              if (
                'FunctionDeclaration' === t.declaration.type ||
                'ClassDeclaration' === t.declaration.type
              )
                this.checkDuplicateExports(t, t.declaration.id.name)
              else if ('VariableDeclaration' === t.declaration.type) {
                var h = t.declaration.declarations,
                  c = Array.isArray(h),
                  l = 0
                for (h = c ? h : h[Symbol.iterator](); ; ) {
                  var p
                  if (c) {
                    if (l >= h.length) break
                    p = h[l++]
                  } else {
                    if ((l = h.next()).done) break
                    p = l.value
                  }
                  var u = p
                  this.checkDeclaration(u.id)
                }
              }
          if (this.state.decorators.length) {
            var f =
              t.declaration &&
              ('ClassDeclaration' === t.declaration.type ||
                'ClassExpression' === t.declaration.type)
            ;(t.declaration && f) ||
              this.raise(
                t.start,
                'You can only use decorators on an export when exporting a class'
              ),
              this.takeDecorators(t.declaration)
          }
        }),
        (q.checkDeclaration = function (t) {
          if ('ObjectPattern' === t.type) {
            var e = t.properties,
              s = Array.isArray(e),
              i = 0
            for (e = s ? e : e[Symbol.iterator](); ; ) {
              var r
              if (s) {
                if (i >= e.length) break
                r = e[i++]
              } else {
                if ((i = e.next()).done) break
                r = i.value
              }
              var a = r
              this.checkDeclaration(a)
            }
          } else if ('ArrayPattern' === t.type) {
            var n = t.elements,
              o = Array.isArray(n),
              h = 0
            for (n = o ? n : n[Symbol.iterator](); ; ) {
              var c
              if (o) {
                if (h >= n.length) break
                c = n[h++]
              } else {
                if ((h = n.next()).done) break
                c = h.value
              }
              var l = c
              l && this.checkDeclaration(l)
            }
          } else
            'ObjectProperty' === t.type
              ? this.checkDeclaration(t.value)
              : 'RestElement' === t.type || 'RestProperty' === t.type
              ? this.checkDeclaration(t.argument)
              : 'Identifier' === t.type && this.checkDuplicateExports(t, t.name)
        }),
        (q.checkDuplicateExports = function (t, e) {
          this.state.exportedIdentifiers.indexOf(e) > -1 &&
            this.raiseDuplicateExportError(t, e),
            this.state.exportedIdentifiers.push(e)
        }),
        (q.raiseDuplicateExportError = function (t, e) {
          this.raise(
            t.start,
            'default' === e
              ? 'Only one default export allowed per module.'
              : '`' +
                  e +
                  '` has already been exported. Exported identifiers must be unique.'
          )
        }),
        (q.parseExportSpecifiers = function () {
          var t = [],
            e = !0,
            s = void 0
          for (this.expect(C.braceL); !this.eat(C.braceR); ) {
            if (e) e = !1
            else if ((this.expect(C.comma), this.eat(C.braceR))) break
            var i = this.match(C._default)
            i && !s && (s = !0)
            var r = this.startNode()
            ;(r.local = this.parseIdentifier(i)),
              (r.exported = this.eatContextual('as')
                ? this.parseIdentifier(!0)
                : r.local.__clone()),
              t.push(this.finishNode(r, 'ExportSpecifier'))
          }
          return s && !this.isContextual('from') && this.unexpected(), t
        }),
        (q.parseImport = function (t) {
          return (
            this.eat(C._import),
            this.match(C.string)
              ? ((t.specifiers = []), (t.source = this.parseExprAtom()))
              : ((t.specifiers = []),
                this.parseImportSpecifiers(t),
                this.expectContextual('from'),
                (t.source = this.match(C.string)
                  ? this.parseExprAtom()
                  : this.unexpected())),
            this.semicolon(),
            this.finishNode(t, 'ImportDeclaration')
          )
        }),
        (q.parseImportSpecifiers = function (t) {
          var e = !0
          if (this.match(C.name)) {
            var s = this.state.start,
              i = this.state.startLoc
            if (
              (t.specifiers.push(
                this.parseImportSpecifierDefault(this.parseIdentifier(), s, i)
              ),
              !this.eat(C.comma))
            )
              return
          }
          if (this.match(C.star)) {
            var r = this.startNode()
            return (
              this.next(),
              this.expectContextual('as'),
              (r.local = this.parseIdentifier()),
              this.checkLVal(r.local, !0, void 0, 'import namespace specifier'),
              void t.specifiers.push(
                this.finishNode(r, 'ImportNamespaceSpecifier')
              )
            )
          }
          for (this.expect(C.braceL); !this.eat(C.braceR); ) {
            if (e) e = !1
            else if (
              (this.eat(C.colon) &&
                this.unexpected(
                  null,
                  'ES2015 named imports do not destructure. Use another statement for destructuring after the import.'
                ),
              this.expect(C.comma),
              this.eat(C.braceR))
            )
              break
            this.parseImportSpecifier(t)
          }
        }),
        (q.parseImportSpecifier = function (t) {
          var e = this.startNode()
          ;(e.imported = this.parseIdentifier(!0)),
            this.eatContextual('as')
              ? (e.local = this.parseIdentifier())
              : (this.checkReservedWord(e.imported.name, e.start, !0, !0),
                (e.local = e.imported.__clone())),
            this.checkLVal(e.local, !0, void 0, 'import specifier'),
            t.specifiers.push(this.finishNode(e, 'ImportSpecifier'))
        }),
        (q.parseImportSpecifierDefault = function (t, e, s) {
          var i = this.startNodeAt(e, s)
          return (
            (i.local = t),
            this.checkLVal(i.local, !0, void 0, 'default import specifier'),
            this.finishNode(i, 'ImportDefaultSpecifier')
          )
        })
      var K = B.prototype
      ;(K.toAssignable = function (t, e, s) {
        if (t)
          switch (t.type) {
            case 'Identifier':
            case 'ObjectPattern':
            case 'ArrayPattern':
            case 'AssignmentPattern':
              break
            case 'ObjectExpression':
              t.type = 'ObjectPattern'
              var i = t.properties,
                r = Array.isArray(i),
                a = 0
              for (i = r ? i : i[Symbol.iterator](); ; ) {
                var n
                if (r) {
                  if (a >= i.length) break
                  n = i[a++]
                } else {
                  if ((a = i.next()).done) break
                  n = a.value
                }
                var o = n
                'ObjectMethod' === o.type
                  ? 'get' === o.kind || 'set' === o.kind
                    ? this.raise(
                        o.key.start,
                        "Object pattern can't contain getter or setter"
                      )
                    : this.raise(
                        o.key.start,
                        "Object pattern can't contain methods"
                      )
                  : this.toAssignable(o, e, 'object destructuring pattern')
              }
              break
            case 'ObjectProperty':
              this.toAssignable(t.value, e, s)
              break
            case 'SpreadProperty':
              t.type = 'RestProperty'
              var h = t.argument
              this.toAssignable(h, e, s)
              break
            case 'ArrayExpression':
              ;(t.type = 'ArrayPattern'),
                this.toAssignableList(t.elements, e, s)
              break
            case 'AssignmentExpression':
              '=' === t.operator
                ? ((t.type = 'AssignmentPattern'), delete t.operator)
                : this.raise(
                    t.left.end,
                    "Only '=' operator can be used for specifying default value."
                  )
              break
            case 'MemberExpression':
              if (!e) break
            default:
              var c = 'Invalid left-hand side' + (s ? ' in ' + s : 'expression')
              this.raise(t.start, c)
          }
        return t
      }),
        (K.toAssignableList = function (t, e, s) {
          var i = t.length
          if (i) {
            var r = t[i - 1]
            if (r && 'RestElement' === r.type) --i
            else if (r && 'SpreadElement' === r.type) {
              r.type = 'RestElement'
              var a = r.argument
              this.toAssignable(a, e, s),
                'Identifier' !== a.type &&
                  'MemberExpression' !== a.type &&
                  'ArrayPattern' !== a.type &&
                  this.unexpected(a.start),
                --i
            }
          }
          for (var n = 0; n < i; n++) {
            var o = t[n]
            o && this.toAssignable(o, e, s)
          }
          return t
        }),
        (K.toReferencedList = function (t) {
          return t
        }),
        (K.parseSpread = function (t) {
          var e = this.startNode()
          return (
            this.next(),
            (e.argument = this.parseMaybeAssign(!1, t)),
            this.finishNode(e, 'SpreadElement')
          )
        }),
        (K.parseRest = function () {
          var t = this.startNode()
          return (
            this.next(),
            (t.argument = this.parseBindingIdentifier()),
            this.finishNode(t, 'RestElement')
          )
        }),
        (K.shouldAllowYieldIdentifier = function () {
          return (
            this.match(C._yield) &&
            !this.state.strict &&
            !this.state.inGenerator
          )
        }),
        (K.parseBindingIdentifier = function () {
          return this.parseIdentifier(this.shouldAllowYieldIdentifier())
        }),
        (K.parseBindingAtom = function () {
          switch (this.state.type) {
            case C._yield:
              ;(this.state.strict || this.state.inGenerator) &&
                this.unexpected()
            case C.name:
              return this.parseIdentifier(!0)
            case C.bracketL:
              var t = this.startNode()
              return (
                this.next(),
                (t.elements = this.parseBindingList(C.bracketR, !0)),
                this.finishNode(t, 'ArrayPattern')
              )
            case C.braceL:
              return this.parseObj(!0)
            default:
              this.unexpected()
          }
        }),
        (K.parseBindingList = function (t, e) {
          for (var s = [], i = !0; !this.eat(t); )
            if ((i ? (i = !1) : this.expect(C.comma), e && this.match(C.comma)))
              s.push(null)
            else {
              if (this.eat(t)) break
              if (this.match(C.ellipsis)) {
                s.push(this.parseAssignableListItemTypes(this.parseRest())),
                  this.expect(t)
                break
              }
              for (var r = []; this.match(C.at); ) r.push(this.parseDecorator())
              var a = this.parseMaybeDefault()
              r.length && (a.decorators = r),
                this.parseAssignableListItemTypes(a),
                s.push(this.parseMaybeDefault(a.start, a.loc.start, a))
            }
          return s
        }),
        (K.parseAssignableListItemTypes = function (t) {
          return t
        }),
        (K.parseMaybeDefault = function (t, e, s) {
          if (
            ((e = e || this.state.startLoc),
            (t = t || this.state.start),
            (s = s || this.parseBindingAtom()),
            !this.eat(C.eq))
          )
            return s
          var i = this.startNodeAt(t, e)
          return (
            (i.left = s),
            (i.right = this.parseMaybeAssign()),
            this.finishNode(i, 'AssignmentPattern')
          )
        }),
        (K.checkLVal = function (t, e, s, i) {
          switch (t.type) {
            case 'Identifier':
              if ((this.checkReservedWord(t.name, t.start, !1, !0), s)) {
                var r = '_' + t.name
                s[r]
                  ? this.raise(t.start, 'Argument name clash in strict mode')
                  : (s[r] = !0)
              }
              break
            case 'MemberExpression':
              e &&
                this.raise(
                  t.start,
                  (e ? 'Binding' : 'Assigning to') + ' member expression'
                )
              break
            case 'ObjectPattern':
              var a = t.properties,
                n = Array.isArray(a),
                o = 0
              for (a = n ? a : a[Symbol.iterator](); ; ) {
                var h
                if (n) {
                  if (o >= a.length) break
                  h = a[o++]
                } else {
                  if ((o = a.next()).done) break
                  h = o.value
                }
                var c = h
                'ObjectProperty' === c.type && (c = c.value),
                  this.checkLVal(c, e, s, 'object destructuring pattern')
              }
              break
            case 'ArrayPattern':
              var l = t.elements,
                p = Array.isArray(l),
                u = 0
              for (l = p ? l : l[Symbol.iterator](); ; ) {
                var f
                if (p) {
                  if (u >= l.length) break
                  f = l[u++]
                } else {
                  if ((u = l.next()).done) break
                  f = u.value
                }
                var d = f
                d && this.checkLVal(d, e, s, 'array destructuring pattern')
              }
              break
            case 'AssignmentPattern':
              this.checkLVal(t.left, e, s, 'assignment pattern')
              break
            case 'RestProperty':
              this.checkLVal(t.argument, e, s, 'rest property')
              break
            case 'RestElement':
              this.checkLVal(t.argument, e, s, 'rest element')
              break
            default:
              var m =
                (e ? 'Binding invalid' : 'Invalid') +
                ' left-hand side' +
                (i ? ' in ' + i : 'expression')
              this.raise(t.start, m)
          }
        })
      var G = B.prototype
      ;(G.checkPropClash = function (t, e) {
        if (!t.computed && !t.kind) {
          var s = t.key
          '__proto__' ===
            ('Identifier' === s.type ? s.name : String(s.value)) &&
            (e.proto &&
              this.raise(s.start, 'Redefinition of __proto__ property'),
            (e.proto = !0))
        }
      }),
        (G.getExpression = function () {
          this.nextToken()
          var t = this.parseExpression()
          return this.match(C.eof) || this.unexpected(), t
        }),
        (G.parseExpression = function (t, e) {
          var s = this.state.start,
            i = this.state.startLoc,
            r = this.parseMaybeAssign(t, e)
          if (this.match(C.comma)) {
            var a = this.startNodeAt(s, i)
            for (a.expressions = [r]; this.eat(C.comma); )
              a.expressions.push(this.parseMaybeAssign(t, e))
            return (
              this.toReferencedList(a.expressions),
              this.finishNode(a, 'SequenceExpression')
            )
          }
          return r
        }),
        (G.parseMaybeAssign = function (t, e, s, i) {
          var r = this.state.start,
            a = this.state.startLoc
          if (this.match(C._yield) && this.state.inGenerator) {
            var n = this.parseYield()
            return s && (n = s.call(this, n, r, a)), n
          }
          var o = void 0
          e ? (o = !1) : ((e = { start: 0 }), (o = !0)),
            (this.match(C.parenL) || this.match(C.name)) &&
              (this.state.potentialArrowAt = this.state.start)
          var h = this.parseMaybeConditional(t, e, i)
          if ((s && (h = s.call(this, h, r, a)), this.state.type.isAssign)) {
            var c = this.startNodeAt(r, a)
            if (
              ((c.operator = this.state.value),
              (c.left = this.match(C.eq)
                ? this.toAssignable(h, void 0, 'assignment expression')
                : h),
              (e.start = 0),
              this.checkLVal(h, void 0, void 0, 'assignment expression'),
              h.extra && h.extra.parenthesized)
            ) {
              var l = void 0
              'ObjectPattern' === h.type
                ? (l = '`({a}) = 0` use `({a} = 0)`')
                : 'ArrayPattern' === h.type &&
                  (l = '`([a]) = 0` use `([a] = 0)`'),
                l &&
                  this.raise(
                    h.start,
                    "You're trying to assign to a parenthesized expression, eg. instead of " +
                      l
                  )
            }
            return (
              this.next(),
              (c.right = this.parseMaybeAssign(t)),
              this.finishNode(c, 'AssignmentExpression')
            )
          }
          return o && e.start && this.unexpected(e.start), h
        }),
        (G.parseMaybeConditional = function (t, e, s) {
          var i = this.state.start,
            r = this.state.startLoc,
            a = this.parseExprOps(t, e)
          return e && e.start ? a : this.parseConditional(a, t, i, r, s)
        }),
        (G.parseConditional = function (t, e, s, i) {
          if (this.eat(C.question)) {
            var r = this.startNodeAt(s, i)
            return (
              (r.test = t),
              (r.consequent = this.parseMaybeAssign()),
              this.expect(C.colon),
              (r.alternate = this.parseMaybeAssign(e)),
              this.finishNode(r, 'ConditionalExpression')
            )
          }
          return t
        }),
        (G.parseExprOps = function (t, e) {
          var s = this.state.start,
            i = this.state.startLoc,
            r = this.parseMaybeUnary(e)
          return e && e.start ? r : this.parseExprOp(r, s, i, -1, t)
        }),
        (G.parseExprOp = function (t, e, s, i, r) {
          var a = this.state.type.binop
          if (!(null == a || (r && this.match(C._in))) && a > i) {
            var n = this.startNodeAt(e, s)
            ;(n.left = t),
              (n.operator = this.state.value),
              '**' !== n.operator ||
                'UnaryExpression' !== t.type ||
                !t.extra ||
                t.extra.parenthesizedArgument ||
                t.extra.parenthesized ||
                this.raise(
                  t.argument.start,
                  'Illegal expression. Wrap left hand side or entire exponentiation in parentheses.'
                )
            var o = this.state.type
            this.next()
            var h = this.state.start,
              c = this.state.startLoc
            return (
              (n.right = this.parseExprOp(
                this.parseMaybeUnary(),
                h,
                c,
                o.rightAssociative ? a - 1 : a,
                r
              )),
              this.finishNode(
                n,
                o === C.logicalOR || o === C.logicalAND
                  ? 'LogicalExpression'
                  : 'BinaryExpression'
              ),
              this.parseExprOp(n, e, s, i, r)
            )
          }
          return t
        }),
        (G.parseMaybeUnary = function (t) {
          if (this.state.type.prefix) {
            var e = this.startNode(),
              s = this.match(C.incDec)
            ;(e.operator = this.state.value), (e.prefix = !0), this.next()
            var i = this.state.type
            return (
              (e.argument = this.parseMaybeUnary()),
              this.addExtra(
                e,
                'parenthesizedArgument',
                !(
                  i !== C.parenL ||
                  (e.argument.extra && e.argument.extra.parenthesized)
                )
              ),
              t && t.start && this.unexpected(t.start),
              s
                ? this.checkLVal(e.argument, void 0, void 0, 'prefix operation')
                : this.state.strict &&
                  'delete' === e.operator &&
                  'Identifier' === e.argument.type &&
                  this.raise(e.start, 'Deleting local variable in strict mode'),
              this.finishNode(e, s ? 'UpdateExpression' : 'UnaryExpression')
            )
          }
          var r = this.state.start,
            a = this.state.startLoc,
            n = this.parseExprSubscripts(t)
          if (t && t.start) return n
          for (; this.state.type.postfix && !this.canInsertSemicolon(); ) {
            var o = this.startNodeAt(r, a)
            ;(o.operator = this.state.value),
              (o.prefix = !1),
              (o.argument = n),
              this.checkLVal(n, void 0, void 0, 'postfix operation'),
              this.next(),
              (n = this.finishNode(o, 'UpdateExpression'))
          }
          return n
        }),
        (G.parseExprSubscripts = function (t) {
          var e = this.state.start,
            s = this.state.startLoc,
            i = this.state.potentialArrowAt,
            r = this.parseExprAtom(t)
          return ('ArrowFunctionExpression' === r.type && r.start === i) ||
            (t && t.start)
            ? r
            : this.parseSubscripts(r, e, s)
        }),
        (G.parseSubscripts = function (t, e, s, i) {
          for (;;) {
            if (!i && this.eat(C.doubleColon)) {
              var r = this.startNodeAt(e, s)
              return (
                (r.object = t),
                (r.callee = this.parseNoCallExpr()),
                this.parseSubscripts(
                  this.finishNode(r, 'BindExpression'),
                  e,
                  s,
                  i
                )
              )
            }
            if (this.eat(C.dot)) {
              var a = this.startNodeAt(e, s)
              ;(a.object = t),
                (a.property = this.parseIdentifier(!0)),
                (a.computed = !1),
                (t = this.finishNode(a, 'MemberExpression'))
            } else if (this.eat(C.bracketL)) {
              var n = this.startNodeAt(e, s)
              ;(n.object = t),
                (n.property = this.parseExpression()),
                (n.computed = !0),
                this.expect(C.bracketR),
                (t = this.finishNode(n, 'MemberExpression'))
            } else if (!i && this.match(C.parenL)) {
              var o =
                this.state.potentialArrowAt === t.start &&
                'Identifier' === t.type &&
                'async' === t.name &&
                !this.canInsertSemicolon()
              this.next()
              var h = this.startNodeAt(e, s)
              if (
                ((h.callee = t),
                (h.arguments = this.parseCallExpressionArguments(C.parenR, o)),
                'Import' === h.callee.type &&
                  1 !== h.arguments.length &&
                  this.raise(h.start, 'import() requires exactly one argument'),
                (t = this.finishNode(h, 'CallExpression')),
                o && this.shouldParseAsyncArrow())
              )
                return this.parseAsyncArrowFromCallExpression(
                  this.startNodeAt(e, s),
                  h
                )
              this.toReferencedList(h.arguments)
            } else {
              if (!this.match(C.backQuote)) return t
              var c = this.startNodeAt(e, s)
              ;(c.tag = t),
                (c.quasi = this.parseTemplate(!0)),
                (t = this.finishNode(c, 'TaggedTemplateExpression'))
            }
          }
        }),
        (G.parseCallExpressionArguments = function (t, e) {
          for (var s = [], i = void 0, r = !0; !this.eat(t); ) {
            if (r) r = !1
            else if ((this.expect(C.comma), this.eat(t))) break
            this.match(C.parenL) && !i && (i = this.state.start),
              s.push(
                this.parseExprListItem(
                  !1,
                  e ? { start: 0 } : void 0,
                  e ? { start: 0 } : void 0
                )
              )
          }
          return e && i && this.shouldParseAsyncArrow() && this.unexpected(), s
        }),
        (G.shouldParseAsyncArrow = function () {
          return this.match(C.arrow)
        }),
        (G.parseAsyncArrowFromCallExpression = function (t, e) {
          return (
            this.expect(C.arrow), this.parseArrowExpression(t, e.arguments, !0)
          )
        }),
        (G.parseNoCallExpr = function () {
          var t = this.state.start,
            e = this.state.startLoc
          return this.parseSubscripts(this.parseExprAtom(), t, e, !0)
        }),
        (G.parseExprAtom = function (t) {
          var e = this.state.potentialArrowAt === this.state.start,
            s = void 0
          switch (this.state.type) {
            case C._super:
              return (
                this.state.inMethod ||
                  this.state.inClassProperty ||
                  this.options.allowSuperOutsideMethod ||
                  this.raise(
                    this.state.start,
                    "'super' outside of function or class"
                  ),
                (s = this.startNode()),
                this.next(),
                this.match(C.parenL) ||
                  this.match(C.bracketL) ||
                  this.match(C.dot) ||
                  this.unexpected(),
                this.match(C.parenL) &&
                  'constructor' !== this.state.inMethod &&
                  !this.options.allowSuperOutsideMethod &&
                  this.raise(s.start, 'super() outside of class constructor'),
                this.finishNode(s, 'Super')
              )
            case C._import:
              return (
                this.hasPlugin('dynamicImport') || this.unexpected(),
                (s = this.startNode()),
                this.next(),
                this.match(C.parenL) || this.unexpected(null, C.parenL),
                this.finishNode(s, 'Import')
              )
            case C._this:
              return (
                (s = this.startNode()),
                this.next(),
                this.finishNode(s, 'ThisExpression')
              )
            case C._yield:
              this.state.inGenerator && this.unexpected()
            case C.name:
              s = this.startNode()
              var i = 'await' === this.state.value && this.state.inAsync,
                r = this.shouldAllowYieldIdentifier(),
                a = this.parseIdentifier(i || r)
              if ('await' === a.name) {
                if (this.state.inAsync || this.inModule)
                  return this.parseAwait(s)
              } else {
                if (
                  'async' === a.name &&
                  this.match(C._function) &&
                  !this.canInsertSemicolon()
                )
                  return this.next(), this.parseFunction(s, !1, !1, !0)
                if (e && 'async' === a.name && this.match(C.name)) {
                  var n = [this.parseIdentifier()]
                  return (
                    this.expect(C.arrow), this.parseArrowExpression(s, n, !0)
                  )
                }
              }
              return e && !this.canInsertSemicolon() && this.eat(C.arrow)
                ? this.parseArrowExpression(s, [a])
                : a
            case C._do:
              if (this.hasPlugin('doExpressions')) {
                var o = this.startNode()
                this.next()
                var h = this.state.inFunction,
                  c = this.state.labels
                return (
                  (this.state.labels = []),
                  (this.state.inFunction = !1),
                  (o.body = this.parseBlock(!1, !0)),
                  (this.state.inFunction = h),
                  (this.state.labels = c),
                  this.finishNode(o, 'DoExpression')
                )
              }
            case C.regexp:
              var l = this.state.value
              return (
                ((s = this.parseLiteral(l.value, 'RegExpLiteral')).pattern =
                  l.pattern),
                (s.flags = l.flags),
                s
              )
            case C.num:
              return this.parseLiteral(this.state.value, 'NumericLiteral')
            case C.string:
              return this.parseLiteral(this.state.value, 'StringLiteral')
            case C._null:
              return (
                (s = this.startNode()),
                this.next(),
                this.finishNode(s, 'NullLiteral')
              )
            case C._true:
            case C._false:
              return (
                ((s = this.startNode()).value = this.match(C._true)),
                this.next(),
                this.finishNode(s, 'BooleanLiteral')
              )
            case C.parenL:
              return this.parseParenAndDistinguishExpression(null, null, e)
            case C.bracketL:
              return (
                (s = this.startNode()),
                this.next(),
                (s.elements = this.parseExprList(C.bracketR, !0, t)),
                this.toReferencedList(s.elements),
                this.finishNode(s, 'ArrayExpression')
              )
            case C.braceL:
              return this.parseObj(!1, t)
            case C._function:
              return this.parseFunctionExpression()
            case C.at:
              this.parseDecorators()
            case C._class:
              return (
                (s = this.startNode()),
                this.takeDecorators(s),
                this.parseClass(s, !1)
              )
            case C._new:
              return this.parseNew()
            case C.backQuote:
              return this.parseTemplate(!1)
            case C.doubleColon:
              ;(s = this.startNode()), this.next(), (s.object = null)
              var p = (s.callee = this.parseNoCallExpr())
              if ('MemberExpression' === p.type)
                return this.finishNode(s, 'BindExpression')
              this.raise(
                p.start,
                'Binding should be performed on object property.'
              )
            default:
              this.unexpected()
          }
        }),
        (G.parseFunctionExpression = function () {
          var t = this.startNode(),
            e = this.parseIdentifier(!0)
          return this.state.inGenerator &&
            this.eat(C.dot) &&
            this.hasPlugin('functionSent')
            ? this.parseMetaProperty(t, e, 'sent')
            : this.parseFunction(t, !1)
        }),
        (G.parseMetaProperty = function (t, e, s) {
          return (
            (t.meta = e),
            (t.property = this.parseIdentifier(!0)),
            t.property.name !== s &&
              this.raise(
                t.property.start,
                'The only valid meta property for new is ' + e.name + '.' + s
              ),
            this.finishNode(t, 'MetaProperty')
          )
        }),
        (G.parseLiteral = function (t, e, s, i) {
          ;(s = s || this.state.start), (i = i || this.state.startLoc)
          var r = this.startNodeAt(s, i)
          return (
            this.addExtra(r, 'rawValue', t),
            this.addExtra(r, 'raw', this.input.slice(s, this.state.end)),
            (r.value = t),
            this.next(),
            this.finishNode(r, e)
          )
        }),
        (G.parseParenExpression = function () {
          this.expect(C.parenL)
          var t = this.parseExpression()
          return this.expect(C.parenR), t
        }),
        (G.parseParenAndDistinguishExpression = function (t, e, s) {
          ;(t = t || this.state.start), (e = e || this.state.startLoc)
          var i = void 0
          this.expect(C.parenL)
          for (
            var r = this.state.start,
              a = this.state.startLoc,
              n = [],
              o = { start: 0 },
              h = { start: 0 },
              c = !0,
              l = void 0,
              p = void 0;
            !this.match(C.parenR);

          ) {
            if (c) c = !1
            else if (
              (this.expect(C.comma, h.start || null), this.match(C.parenR))
            ) {
              p = this.state.start
              break
            }
            if (this.match(C.ellipsis)) {
              var u = this.state.start,
                f = this.state.startLoc
              ;(l = this.state.start),
                n.push(this.parseParenItem(this.parseRest(), u, f))
              break
            }
            n.push(this.parseMaybeAssign(!1, o, this.parseParenItem, h))
          }
          var d = this.state.start,
            m = this.state.startLoc
          this.expect(C.parenR)
          var y = this.startNodeAt(t, e)
          if (s && this.shouldParseArrow() && (y = this.parseArrow(y))) {
            var v = n,
              x = Array.isArray(v),
              b = 0
            for (v = x ? v : v[Symbol.iterator](); ; ) {
              var g
              if (x) {
                if (b >= v.length) break
                g = v[b++]
              } else {
                if ((b = v.next()).done) break
                g = b.value
              }
              var E = g
              E.extra &&
                E.extra.parenthesized &&
                this.unexpected(E.extra.parenStart)
            }
            return this.parseArrowExpression(y, n)
          }
          return (
            n.length || this.unexpected(this.state.lastTokStart),
            p && this.unexpected(p),
            l && this.unexpected(l),
            o.start && this.unexpected(o.start),
            h.start && this.unexpected(h.start),
            n.length > 1
              ? (((i = this.startNodeAt(r, a)).expressions = n),
                this.toReferencedList(i.expressions),
                this.finishNodeAt(i, 'SequenceExpression', d, m))
              : (i = n[0]),
            this.addExtra(i, 'parenthesized', !0),
            this.addExtra(i, 'parenStart', t),
            i
          )
        }),
        (G.shouldParseArrow = function () {
          return !this.canInsertSemicolon()
        }),
        (G.parseArrow = function (t) {
          if (this.eat(C.arrow)) return t
        }),
        (G.parseParenItem = function (t) {
          return t
        }),
        (G.parseNew = function () {
          var t = this.startNode(),
            e = this.parseIdentifier(!0)
          if (this.eat(C.dot)) {
            var s = this.parseMetaProperty(t, e, 'target')
            return (
              this.state.inFunction ||
                this.raise(
                  s.property.start,
                  'new.target can only be used in functions'
                ),
              s
            )
          }
          return (
            (t.callee = this.parseNoCallExpr()),
            this.eat(C.parenL)
              ? ((t.arguments = this.parseExprList(C.parenR)),
                this.toReferencedList(t.arguments))
              : (t.arguments = []),
            this.finishNode(t, 'NewExpression')
          )
        }),
        (G.parseTemplateElement = function (t) {
          var e = this.startNode()
          return (
            null === this.state.value &&
              (t && this.hasPlugin('templateInvalidEscapes')
                ? (this.state.invalidTemplateEscapePosition = null)
                : this.raise(
                    this.state.invalidTemplateEscapePosition,
                    'Invalid escape sequence in template'
                  )),
            (e.value = {
              raw: this.input
                .slice(this.state.start, this.state.end)
                .replace(/\r\n?/g, '\n'),
              cooked: this.state.value,
            }),
            this.next(),
            (e.tail = this.match(C.backQuote)),
            this.finishNode(e, 'TemplateElement')
          )
        }),
        (G.parseTemplate = function (t) {
          var e = this.startNode()
          this.next(), (e.expressions = [])
          var s = this.parseTemplateElement(t)
          for (e.quasis = [s]; !s.tail; )
            this.expect(C.dollarBraceL),
              e.expressions.push(this.parseExpression()),
              this.expect(C.braceR),
              e.quasis.push((s = this.parseTemplateElement(t)))
          return this.next(), this.finishNode(e, 'TemplateLiteral')
        }),
        (G.parseObj = function (t, e) {
          var s = [],
            i = Object.create(null),
            r = !0,
            a = this.startNode()
          ;(a.properties = []), this.next()
          for (var n = null; !this.eat(C.braceR); ) {
            if (r) r = !1
            else if ((this.expect(C.comma), this.eat(C.braceR))) break
            for (; this.match(C.at); ) s.push(this.parseDecorator())
            var o = this.startNode(),
              h = !1,
              c = !1,
              l = void 0,
              p = void 0
            if (
              (s.length && ((o.decorators = s), (s = [])),
              this.hasPlugin('objectRestSpread') && this.match(C.ellipsis))
            ) {
              if (
                (((o = this.parseSpread(t ? { start: 0 } : void 0)).type = t
                  ? 'RestProperty'
                  : 'SpreadProperty'),
                t && this.toAssignable(o.argument, !0, 'object pattern'),
                a.properties.push(o),
                !t)
              )
                continue
              var u = this.state.start
              if (null === n) {
                if (this.eat(C.braceR)) break
                if (this.match(C.comma) && this.lookahead().type === C.braceR)
                  continue
                n = u
                continue
              }
              this.unexpected(
                n,
                'Cannot have multiple rest elements when destructuring'
              )
            }
            if (
              ((o.method = !1),
              (o.shorthand = !1),
              (t || e) && ((l = this.state.start), (p = this.state.startLoc)),
              t || (h = this.eat(C.star)),
              !t && this.isContextual('async'))
            ) {
              h && this.unexpected()
              var f = this.parseIdentifier()
              this.match(C.colon) ||
              this.match(C.parenL) ||
              this.match(C.braceR) ||
              this.match(C.eq) ||
              this.match(C.comma)
                ? ((o.key = f), (o.computed = !1))
                : ((c = !0),
                  this.hasPlugin('asyncGenerators') && (h = this.eat(C.star)),
                  this.parsePropertyName(o))
            } else this.parsePropertyName(o)
            this.parseObjPropValue(o, l, p, h, c, t, e),
              this.checkPropClash(o, i),
              o.shorthand && this.addExtra(o, 'shorthand', !0),
              a.properties.push(o)
          }
          return (
            null !== n &&
              this.unexpected(
                n,
                'The rest element has to be the last element when destructuring'
              ),
            s.length &&
              this.raise(
                this.state.start,
                'You have trailing decorators with no property'
              ),
            this.finishNode(a, t ? 'ObjectPattern' : 'ObjectExpression')
          )
        }),
        (G.isGetterOrSetterMethod = function (t, e) {
          return (
            !e &&
            !t.computed &&
            'Identifier' === t.key.type &&
            ('get' === t.key.name || 'set' === t.key.name) &&
            (this.match(C.string) ||
              this.match(C.num) ||
              this.match(C.bracketL) ||
              this.match(C.name) ||
              this.state.type.keyword)
          )
        }),
        (G.checkGetterSetterParamCount = function (t) {
          var e = 'get' === t.kind ? 0 : 1
          if (t.params.length !== e) {
            var s = t.start
            'get' === t.kind
              ? this.raise(s, 'getter should have no params')
              : this.raise(s, 'setter should have exactly one param')
          }
        }),
        (G.parseObjectMethod = function (t, e, s, i) {
          return s || e || this.match(C.parenL)
            ? (i && this.unexpected(),
              (t.kind = 'method'),
              (t.method = !0),
              this.parseMethod(t, e, s),
              this.finishNode(t, 'ObjectMethod'))
            : this.isGetterOrSetterMethod(t, i)
            ? ((e || s) && this.unexpected(),
              (t.kind = t.key.name),
              this.parsePropertyName(t),
              this.parseMethod(t),
              this.checkGetterSetterParamCount(t),
              this.finishNode(t, 'ObjectMethod'))
            : void 0
        }),
        (G.parseObjectProperty = function (t, e, s, i, r) {
          return this.eat(C.colon)
            ? ((t.value = i
                ? this.parseMaybeDefault(this.state.start, this.state.startLoc)
                : this.parseMaybeAssign(!1, r)),
              this.finishNode(t, 'ObjectProperty'))
            : t.computed || 'Identifier' !== t.key.type
            ? void 0
            : (this.checkReservedWord(t.key.name, t.key.start, !0, !0),
              i
                ? (t.value = this.parseMaybeDefault(e, s, t.key.__clone()))
                : this.match(C.eq) && r
                ? (r.start || (r.start = this.state.start),
                  (t.value = this.parseMaybeDefault(e, s, t.key.__clone())))
                : (t.value = t.key.__clone()),
              (t.shorthand = !0),
              this.finishNode(t, 'ObjectProperty'))
        }),
        (G.parseObjPropValue = function (t, e, s, i, r, a, n) {
          var o =
            this.parseObjectMethod(t, i, r, a) ||
            this.parseObjectProperty(t, e, s, a, n)
          return o || this.unexpected(), o
        }),
        (G.parsePropertyName = function (t) {
          if (this.eat(C.bracketL))
            (t.computed = !0),
              (t.key = this.parseMaybeAssign()),
              this.expect(C.bracketR)
          else {
            t.computed = !1
            var e = this.state.inPropertyName
            ;(this.state.inPropertyName = !0),
              (t.key =
                this.match(C.num) || this.match(C.string)
                  ? this.parseExprAtom()
                  : this.parseIdentifier(!0)),
              (this.state.inPropertyName = e)
          }
          return t.key
        }),
        (G.initFunction = function (t, e) {
          ;(t.id = null),
            (t.generator = !1),
            (t.expression = !1),
            (t.async = !!e)
        }),
        (G.parseMethod = function (t, e, s) {
          var i = this.state.inMethod
          return (
            (this.state.inMethod = t.kind || !0),
            this.initFunction(t, s),
            this.expect(C.parenL),
            (t.params = this.parseBindingList(C.parenR)),
            (t.generator = !!e),
            this.parseFunctionBody(t),
            (this.state.inMethod = i),
            t
          )
        }),
        (G.parseArrowExpression = function (t, e, s) {
          return (
            this.initFunction(t, s),
            (t.params = this.toAssignableList(
              e,
              !0,
              'arrow function parameters'
            )),
            this.parseFunctionBody(t, !0),
            this.finishNode(t, 'ArrowFunctionExpression')
          )
        }),
        (G.isStrictBody = function (t, e) {
          if (!e && t.body.directives.length) {
            var s = t.body.directives,
              i = Array.isArray(s),
              r = 0
            for (s = i ? s : s[Symbol.iterator](); ; ) {
              var a
              if (i) {
                if (r >= s.length) break
                a = s[r++]
              } else {
                if ((r = s.next()).done) break
                a = r.value
              }
              if ('use strict' === a.value.value) return !0
            }
          }
          return !1
        }),
        (G.parseFunctionBody = function (t, e) {
          var s = e && !this.match(C.braceL),
            i = this.state.inAsync
          if (((this.state.inAsync = t.async), s))
            (t.body = this.parseMaybeAssign()), (t.expression = !0)
          else {
            var r = this.state.inFunction,
              a = this.state.inGenerator,
              n = this.state.labels
            ;(this.state.inFunction = !0),
              (this.state.inGenerator = t.generator),
              (this.state.labels = []),
              (t.body = this.parseBlock(!0)),
              (t.expression = !1),
              (this.state.inFunction = r),
              (this.state.inGenerator = a),
              (this.state.labels = n)
          }
          this.state.inAsync = i
          var o = this.isStrictBody(t, s),
            h = this.state.strict || e || o
          if (
            (o &&
              t.id &&
              'Identifier' === t.id.type &&
              'yield' === t.id.name &&
              this.raise(t.id.start, 'Binding yield in strict mode'),
            h)
          ) {
            var c = Object.create(null),
              l = this.state.strict
            o && (this.state.strict = !0),
              t.id && this.checkLVal(t.id, !0, void 0, 'function name')
            var p = t.params,
              u = Array.isArray(p),
              f = 0
            for (p = u ? p : p[Symbol.iterator](); ; ) {
              var d
              if (u) {
                if (f >= p.length) break
                d = p[f++]
              } else {
                if ((f = p.next()).done) break
                d = f.value
              }
              var m = d
              o &&
                'Identifier' !== m.type &&
                this.raise(m.start, 'Non-simple parameter in strict mode'),
                this.checkLVal(m, !0, c, 'function parameter list')
            }
            this.state.strict = l
          }
        }),
        (G.parseExprList = function (t, e, s) {
          for (var i = [], r = !0; !this.eat(t); ) {
            if (r) r = !1
            else if ((this.expect(C.comma), this.eat(t))) break
            i.push(this.parseExprListItem(e, s))
          }
          return i
        }),
        (G.parseExprListItem = function (t, e, s) {
          return t && this.match(C.comma)
            ? null
            : this.match(C.ellipsis)
            ? this.parseSpread(e)
            : this.parseMaybeAssign(!1, e, this.parseParenItem, s)
        }),
        (G.parseIdentifier = function (t) {
          var e = this.startNode()
          return (
            t ||
              this.checkReservedWord(
                this.state.value,
                this.state.start,
                !!this.state.type.keyword,
                !1
              ),
            this.match(C.name)
              ? (e.name = this.state.value)
              : this.state.type.keyword
              ? (e.name = this.state.type.keyword)
              : this.unexpected(),
            !t &&
              'await' === e.name &&
              this.state.inAsync &&
              this.raise(
                e.start,
                'invalid use of await inside of an async function'
              ),
            (e.loc.identifierName = e.name),
            this.next(),
            this.finishNode(e, 'Identifier')
          )
        }),
        (G.checkReservedWord = function (t, e, s, i) {
          ;(this.isReservedWord(t) || (s && this.isKeyword(t))) &&
            this.raise(e, t + ' is a reserved word'),
            this.state.strict &&
              (r.strict(t) || (i && r.strictBind(t))) &&
              this.raise(e, t + ' is a reserved word in strict mode')
        }),
        (G.parseAwait = function (t) {
          return (
            this.state.inAsync || this.unexpected(),
            this.match(C.star) &&
              this.raise(
                t.start,
                'await* has been removed from the async functions proposal. Use Promise.all() instead.'
              ),
            (t.argument = this.parseMaybeUnary()),
            this.finishNode(t, 'AwaitExpression')
          )
        }),
        (G.parseYield = function () {
          var t = this.startNode()
          return (
            this.next(),
            this.match(C.semi) ||
            this.canInsertSemicolon() ||
            (!this.match(C.star) && !this.state.type.startsExpr)
              ? ((t.delegate = !1), (t.argument = null))
              : ((t.delegate = this.eat(C.star)),
                (t.argument = this.parseMaybeAssign())),
            this.finishNode(t, 'YieldExpression')
          )
        })
      var z = B.prototype,
        H = ['leadingComments', 'trailingComments', 'innerComments'],
        J = (function () {
          function t(e, s, i) {
            v(this, t),
              (this.type = ''),
              (this.start = e),
              (this.end = 0),
              (this.loc = new _(s)),
              i && (this.loc.filename = i)
          }
          return (
            (t.prototype.__clone = function () {
              var e = new t()
              for (var s in this) H.indexOf(s) < 0 && (e[s] = this[s])
              return e
            }),
            t
          )
        })()
      function Y(t, e, s, i) {
        return (
          (t.type = e), (t.end = s), (t.loc.end = i), this.processComment(t), t
        )
      }
      function Q(t) {
        return t[t.length - 1]
      }
      ;(z.startNode = function () {
        return new J(this.state.start, this.state.startLoc, this.filename)
      }),
        (z.startNodeAt = function (t, e) {
          return new J(t, e, this.filename)
        }),
        (z.finishNode = function (t, e) {
          return Y.call(
            this,
            t,
            e,
            this.state.lastTokEnd,
            this.state.lastTokEndLoc
          )
        }),
        (z.finishNodeAt = function (t, e, s, i) {
          return Y.call(this, t, e, s, i)
        }),
        (B.prototype.raise = function (t, e) {
          var s = (function (t, e) {
            for (var s = 1, i = 0; ; ) {
              A.lastIndex = i
              var r = A.exec(t)
              if (!(r && r.index < e)) return new O(s, e - i)
              ++s, (i = r.index + r[0].length)
            }
          })(this.input, t)
          e += ' (' + s.line + ':' + s.column + ')'
          var i = new SyntaxError(e)
          throw ((i.pos = t), (i.loc = s), i)
        })
      var $ = B.prototype
      ;($.addComment = function (t) {
        this.filename && (t.loc.filename = this.filename),
          this.state.trailingComments.push(t),
          this.state.leadingComments.push(t)
      }),
        ($.processComment = function (t) {
          if (!('Program' === t.type && t.body.length > 0)) {
            var e = this.state.commentStack,
              s = void 0,
              i = void 0,
              r = void 0,
              a = void 0,
              n = void 0
            if (this.state.trailingComments.length > 0)
              this.state.trailingComments[0].start >= t.end
                ? ((r = this.state.trailingComments),
                  (this.state.trailingComments = []))
                : (this.state.trailingComments.length = 0)
            else {
              var o = Q(e)
              e.length > 0 &&
                o.trailingComments &&
                o.trailingComments[0].start >= t.end &&
                ((r = o.trailingComments), (o.trailingComments = null))
            }
            for (
              e.length > 0 && Q(e).start >= t.start && (s = e.pop());
              e.length > 0 && Q(e).start >= t.start;

            )
              i = e.pop()
            if (
              (!i && s && (i = s), s && this.state.leadingComments.length > 0)
            ) {
              var h = Q(this.state.leadingComments)
              if ('ObjectProperty' === s.type) {
                if (h.start >= t.start && this.state.commentPreviousNode) {
                  for (n = 0; n < this.state.leadingComments.length; n++)
                    this.state.leadingComments[n].end <
                      this.state.commentPreviousNode.end &&
                      (this.state.leadingComments.splice(n, 1), n--)
                  this.state.leadingComments.length > 0 &&
                    ((s.trailingComments = this.state.leadingComments),
                    (this.state.leadingComments = []))
                }
              } else if (
                'CallExpression' === t.type &&
                t.arguments &&
                t.arguments.length
              ) {
                var c = Q(t.arguments)
                c &&
                  h.start >= c.start &&
                  h.end <= t.end &&
                  this.state.commentPreviousNode &&
                  this.state.leadingComments.length > 0 &&
                  ((c.trailingComments = this.state.leadingComments),
                  (this.state.leadingComments = []))
              }
            }
            if (i) {
              if (i.leadingComments)
                if (i !== t && Q(i.leadingComments).end <= t.start)
                  (t.leadingComments = i.leadingComments),
                    (i.leadingComments = null)
                else
                  for (a = i.leadingComments.length - 2; a >= 0; --a)
                    if (i.leadingComments[a].end <= t.start) {
                      t.leadingComments = i.leadingComments.splice(0, a + 1)
                      break
                    }
            } else if (this.state.leadingComments.length > 0)
              if (Q(this.state.leadingComments).end <= t.start) {
                if (this.state.commentPreviousNode)
                  for (n = 0; n < this.state.leadingComments.length; n++)
                    this.state.leadingComments[n].end <
                      this.state.commentPreviousNode.end &&
                      (this.state.leadingComments.splice(n, 1), n--)
                this.state.leadingComments.length > 0 &&
                  ((t.leadingComments = this.state.leadingComments),
                  (this.state.leadingComments = []))
              } else {
                for (
                  a = 0;
                  a < this.state.leadingComments.length &&
                  !(this.state.leadingComments[a].end > t.start);
                  a++
                );
                ;(t.leadingComments = this.state.leadingComments.slice(0, a)),
                  0 === t.leadingComments.length && (t.leadingComments = null),
                  0 === (r = this.state.leadingComments.slice(a)).length &&
                    (r = null)
              }
            ;(this.state.commentPreviousNode = t),
              r &&
                (r.length && r[0].start >= t.start && Q(r).end <= t.end
                  ? (t.innerComments = r)
                  : (t.trailingComments = r)),
              e.push(t)
          }
        })
      var Z = B.prototype
      function tt(t) {
        return (
          t && 'Property' === t.type && 'init' === t.kind && !1 === t.method
        )
      }
      ;(Z.estreeParseRegExpLiteral = function (t) {
        var e = t.pattern,
          s = t.flags,
          i = null
        try {
          i = new RegExp(e, s)
        } catch (t) {}
        var r = this.estreeParseLiteral(i)
        return (r.regex = { pattern: e, flags: s }), r
      }),
        (Z.estreeParseLiteral = function (t) {
          return this.parseLiteral(t, 'Literal')
        }),
        (Z.directiveToStmt = function (t) {
          var e = t.value,
            s = this.startNodeAt(t.start, t.loc.start),
            i = this.startNodeAt(e.start, e.loc.start)
          return (
            (i.value = e.value),
            (i.raw = e.extra.raw),
            (s.expression = this.finishNodeAt(i, 'Literal', e.end, e.loc.end)),
            (s.directive = e.extra.raw.slice(1, -1)),
            this.finishNodeAt(s, 'ExpressionStatement', t.end, t.loc.end)
          )
        })
      var et = [
          'any',
          'mixed',
          'empty',
          'bool',
          'boolean',
          'number',
          'string',
          'void',
          'null',
        ],
        st = B.prototype
      ;(st.flowParseTypeInitialiser = function (t) {
        var e = this.state.inType
        ;(this.state.inType = !0), this.expect(t || C.colon)
        var s = this.flowParseType()
        return (this.state.inType = e), s
      }),
        (st.flowParsePredicate = function () {
          var t = this.startNode(),
            e = this.state.startLoc,
            s = this.state.start
          this.expect(C.modulo)
          var i = this.state.startLoc
          return (
            this.expectContextual('checks'),
            (e.line === i.line && e.column === i.column - 1) ||
              this.raise(
                s,
                'Spaces between ´%´ and ´checks´ are not allowed here.'
              ),
            this.eat(C.parenL)
              ? ((t.expression = this.parseExpression()),
                this.expect(C.parenR),
                this.finishNode(t, 'DeclaredPredicate'))
              : this.finishNode(t, 'InferredPredicate')
          )
        }),
        (st.flowParseTypeAndPredicateInitialiser = function () {
          var t = this.state.inType
          ;(this.state.inType = !0), this.expect(C.colon)
          var e = null,
            s = null
          return (
            this.match(C.modulo)
              ? ((this.state.inType = t), (s = this.flowParsePredicate()))
              : ((e = this.flowParseType()),
                (this.state.inType = t),
                this.match(C.modulo) && (s = this.flowParsePredicate())),
            [e, s]
          )
        }),
        (st.flowParseDeclareClass = function (t) {
          return (
            this.next(),
            this.flowParseInterfaceish(t, !0),
            this.finishNode(t, 'DeclareClass')
          )
        }),
        (st.flowParseDeclareFunction = function (t) {
          this.next()
          var e = (t.id = this.parseIdentifier()),
            s = this.startNode(),
            i = this.startNode()
          this.isRelational('<')
            ? (s.typeParameters = this.flowParseTypeParameterDeclaration())
            : (s.typeParameters = null),
            this.expect(C.parenL)
          var r = this.flowParseFunctionTypeParams()
          ;(s.params = r.params), (s.rest = r.rest), this.expect(C.parenR)
          var a,
            n = this.flowParseTypeAndPredicateInitialiser()
          return (
            (s.returnType = n[0]),
            (a = n[1]),
            (i.typeAnnotation = this.finishNode(s, 'FunctionTypeAnnotation')),
            (i.predicate = a),
            (e.typeAnnotation = this.finishNode(i, 'TypeAnnotation')),
            this.finishNode(e, e.type),
            this.semicolon(),
            this.finishNode(t, 'DeclareFunction')
          )
        }),
        (st.flowParseDeclare = function (t) {
          return this.match(C._class)
            ? this.flowParseDeclareClass(t)
            : this.match(C._function)
            ? this.flowParseDeclareFunction(t)
            : this.match(C._var)
            ? this.flowParseDeclareVariable(t)
            : this.isContextual('module')
            ? this.lookahead().type === C.dot
              ? this.flowParseDeclareModuleExports(t)
              : this.flowParseDeclareModule(t)
            : this.isContextual('type')
            ? this.flowParseDeclareTypeAlias(t)
            : this.isContextual('opaque')
            ? this.flowParseDeclareOpaqueType(t)
            : this.isContextual('interface')
            ? this.flowParseDeclareInterface(t)
            : this.match(C._export)
            ? this.flowParseDeclareExportDeclaration(t)
            : void this.unexpected()
        }),
        (st.flowParseDeclareExportDeclaration = function (t) {
          if ((this.expect(C._export), this.isContextual('opaque')))
            return (
              (t.declaration = this.flowParseDeclare(this.startNode())),
              (t.default = !1),
              this.finishNode(t, 'DeclareExportDeclaration')
            )
          throw this.unexpected()
        }),
        (st.flowParseDeclareVariable = function (t) {
          return (
            this.next(),
            (t.id = this.flowParseTypeAnnotatableIdentifier()),
            this.semicolon(),
            this.finishNode(t, 'DeclareVariable')
          )
        }),
        (st.flowParseDeclareModule = function (t) {
          this.next(),
            this.match(C.string)
              ? (t.id = this.parseExprAtom())
              : (t.id = this.parseIdentifier())
          var e = (t.body = this.startNode()),
            s = (e.body = [])
          for (this.expect(C.braceL); !this.match(C.braceR); ) {
            var i = this.startNode()
            if (this.match(C._import)) {
              var r = this.lookahead()
              'type' !== r.value &&
                'typeof' !== r.value &&
                this.unexpected(
                  null,
                  'Imports within a `declare module` body must always be `import type` or `import typeof`'
                ),
                this.parseImport(i)
            } else
              this.expectContextual(
                'declare',
                'Only declares and type imports are allowed inside declare module'
              ),
                (i = this.flowParseDeclare(i, !0))
            s.push(i)
          }
          return (
            this.expect(C.braceR),
            this.finishNode(e, 'BlockStatement'),
            this.finishNode(t, 'DeclareModule')
          )
        }),
        (st.flowParseDeclareModuleExports = function (t) {
          return (
            this.expectContextual('module'),
            this.expect(C.dot),
            this.expectContextual('exports'),
            (t.typeAnnotation = this.flowParseTypeAnnotation()),
            this.semicolon(),
            this.finishNode(t, 'DeclareModuleExports')
          )
        }),
        (st.flowParseDeclareTypeAlias = function (t) {
          return (
            this.next(),
            this.flowParseTypeAlias(t),
            this.finishNode(t, 'DeclareTypeAlias')
          )
        }),
        (st.flowParseDeclareOpaqueType = function (t) {
          return (
            this.next(),
            this.flowParseOpaqueType(t, !0),
            this.finishNode(t, 'DeclareOpaqueType')
          )
        }),
        (st.flowParseDeclareInterface = function (t) {
          return (
            this.next(),
            this.flowParseInterfaceish(t),
            this.finishNode(t, 'DeclareInterface')
          )
        }),
        (st.flowParseInterfaceish = function (t) {
          if (
            ((t.id = this.parseIdentifier()),
            this.isRelational('<')
              ? (t.typeParameters = this.flowParseTypeParameterDeclaration())
              : (t.typeParameters = null),
            (t.extends = []),
            (t.mixins = []),
            this.eat(C._extends))
          )
            do {
              t.extends.push(this.flowParseInterfaceExtends())
            } while (this.eat(C.comma))
          if (this.isContextual('mixins')) {
            this.next()
            do {
              t.mixins.push(this.flowParseInterfaceExtends())
            } while (this.eat(C.comma))
          }
          t.body = this.flowParseObjectType(!0, !1, !1)
        }),
        (st.flowParseInterfaceExtends = function () {
          var t = this.startNode()
          return (
            (t.id = this.flowParseQualifiedTypeIdentifier()),
            this.isRelational('<')
              ? (t.typeParameters = this.flowParseTypeParameterInstantiation())
              : (t.typeParameters = null),
            this.finishNode(t, 'InterfaceExtends')
          )
        }),
        (st.flowParseInterface = function (t) {
          return (
            this.flowParseInterfaceish(t, !1),
            this.finishNode(t, 'InterfaceDeclaration')
          )
        }),
        (st.flowParseRestrictedIdentifier = function (t) {
          return (
            et.indexOf(this.state.value) > -1 &&
              this.raise(
                this.state.start,
                'Cannot overwrite primitive type ' + this.state.value
              ),
            this.parseIdentifier(t)
          )
        }),
        (st.flowParseTypeAlias = function (t) {
          return (
            (t.id = this.flowParseRestrictedIdentifier()),
            this.isRelational('<')
              ? (t.typeParameters = this.flowParseTypeParameterDeclaration())
              : (t.typeParameters = null),
            (t.right = this.flowParseTypeInitialiser(C.eq)),
            this.semicolon(),
            this.finishNode(t, 'TypeAlias')
          )
        }),
        (st.flowParseOpaqueType = function (t, e) {
          return (
            this.expectContextual('type'),
            (t.id = this.flowParseRestrictedIdentifier()),
            this.isRelational('<')
              ? (t.typeParameters = this.flowParseTypeParameterDeclaration())
              : (t.typeParameters = null),
            (t.supertype = null),
            this.match(C.colon) &&
              (t.supertype = this.flowParseTypeInitialiser(C.colon)),
            (t.impltype = null),
            e || (t.impltype = this.flowParseTypeInitialiser(C.eq)),
            this.semicolon(),
            this.finishNode(t, 'OpaqueType')
          )
        }),
        (st.flowParseTypeParameter = function () {
          var t = this.startNode(),
            e = this.flowParseVariance(),
            s = this.flowParseTypeAnnotatableIdentifier()
          return (
            (t.name = s.name),
            (t.variance = e),
            (t.bound = s.typeAnnotation),
            this.match(C.eq) &&
              (this.eat(C.eq), (t.default = this.flowParseType())),
            this.finishNode(t, 'TypeParameter')
          )
        }),
        (st.flowParseTypeParameterDeclaration = function () {
          var t = this.state.inType,
            e = this.startNode()
          ;(e.params = []),
            (this.state.inType = !0),
            this.isRelational('<') || this.match(C.jsxTagStart)
              ? this.next()
              : this.unexpected()
          do {
            e.params.push(this.flowParseTypeParameter()),
              this.isRelational('>') || this.expect(C.comma)
          } while (!this.isRelational('>'))
          return (
            this.expectRelational('>'),
            (this.state.inType = t),
            this.finishNode(e, 'TypeParameterDeclaration')
          )
        }),
        (st.flowParseTypeParameterInstantiation = function () {
          var t = this.startNode(),
            e = this.state.inType
          for (
            t.params = [], this.state.inType = !0, this.expectRelational('<');
            !this.isRelational('>');

          )
            t.params.push(this.flowParseType()),
              this.isRelational('>') || this.expect(C.comma)
          return (
            this.expectRelational('>'),
            (this.state.inType = e),
            this.finishNode(t, 'TypeParameterInstantiation')
          )
        }),
        (st.flowParseObjectPropertyKey = function () {
          return this.match(C.num) || this.match(C.string)
            ? this.parseExprAtom()
            : this.parseIdentifier(!0)
        }),
        (st.flowParseObjectTypeIndexer = function (t, e, s) {
          return (
            (t.static = e),
            this.expect(C.bracketL),
            this.lookahead().type === C.colon
              ? ((t.id = this.flowParseObjectPropertyKey()),
                (t.key = this.flowParseTypeInitialiser()))
              : ((t.id = null), (t.key = this.flowParseType())),
            this.expect(C.bracketR),
            (t.value = this.flowParseTypeInitialiser()),
            (t.variance = s),
            this.flowObjectTypeSemicolon(),
            this.finishNode(t, 'ObjectTypeIndexer')
          )
        }),
        (st.flowParseObjectTypeMethodish = function (t) {
          for (
            t.params = [],
              t.rest = null,
              t.typeParameters = null,
              this.isRelational('<') &&
                (t.typeParameters = this.flowParseTypeParameterDeclaration()),
              this.expect(C.parenL);
            !this.match(C.parenR) && !this.match(C.ellipsis);

          )
            t.params.push(this.flowParseFunctionTypeParam()),
              this.match(C.parenR) || this.expect(C.comma)
          return (
            this.eat(C.ellipsis) &&
              (t.rest = this.flowParseFunctionTypeParam()),
            this.expect(C.parenR),
            (t.returnType = this.flowParseTypeInitialiser()),
            this.finishNode(t, 'FunctionTypeAnnotation')
          )
        }),
        (st.flowParseObjectTypeMethod = function (t, e, s, i) {
          var r = this.startNodeAt(t, e)
          return (
            (r.value = this.flowParseObjectTypeMethodish(
              this.startNodeAt(t, e)
            )),
            (r.static = s),
            (r.key = i),
            (r.optional = !1),
            this.flowObjectTypeSemicolon(),
            this.finishNode(r, 'ObjectTypeProperty')
          )
        }),
        (st.flowParseObjectTypeCallProperty = function (t, e) {
          var s = this.startNode()
          return (
            (t.static = e),
            (t.value = this.flowParseObjectTypeMethodish(s)),
            this.flowObjectTypeSemicolon(),
            this.finishNode(t, 'ObjectTypeCallProperty')
          )
        }),
        (st.flowParseObjectType = function (t, e, s) {
          var i = this.state.inType
          this.state.inType = !0
          var r = this.startNode(),
            a = void 0,
            n = void 0,
            o = !1
          ;(r.callProperties = []), (r.properties = []), (r.indexers = [])
          var h = void 0,
            c = void 0
          for (
            e && this.match(C.braceBarL)
              ? (this.expect(C.braceBarL), (h = C.braceBarR), (c = !0))
              : (this.expect(C.braceL), (h = C.braceR), (c = !1)),
              r.exact = c;
            !this.match(h);

          ) {
            var l = !1,
              p = this.state.start,
              u = this.state.startLoc
            ;(a = this.startNode()),
              t &&
                this.isContextual('static') &&
                this.lookahead().type !== C.colon &&
                (this.next(), (o = !0))
            var f = this.state.start,
              d = this.flowParseVariance()
            this.match(C.bracketL)
              ? r.indexers.push(this.flowParseObjectTypeIndexer(a, o, d))
              : this.match(C.parenL) || this.isRelational('<')
              ? (d && this.unexpected(f),
                r.callProperties.push(
                  this.flowParseObjectTypeCallProperty(a, o)
                ))
              : this.match(C.ellipsis)
              ? (s ||
                  this.unexpected(
                    null,
                    'Spread operator cannot appear in class or interface definitions'
                  ),
                d &&
                  this.unexpected(
                    d.start,
                    'Spread properties cannot have variance'
                  ),
                this.expect(C.ellipsis),
                (a.argument = this.flowParseType()),
                this.flowObjectTypeSemicolon(),
                r.properties.push(
                  this.finishNode(a, 'ObjectTypeSpreadProperty')
                ))
              : ((n = this.flowParseObjectPropertyKey()),
                this.isRelational('<') || this.match(C.parenL)
                  ? (d && this.unexpected(d.start),
                    r.properties.push(
                      this.flowParseObjectTypeMethod(p, u, o, n)
                    ))
                  : (this.eat(C.question) && (l = !0),
                    (a.key = n),
                    (a.value = this.flowParseTypeInitialiser()),
                    (a.optional = l),
                    (a.static = o),
                    (a.variance = d),
                    this.flowObjectTypeSemicolon(),
                    r.properties.push(
                      this.finishNode(a, 'ObjectTypeProperty')
                    ))),
              (o = !1)
          }
          this.expect(h)
          var m = this.finishNode(r, 'ObjectTypeAnnotation')
          return (this.state.inType = i), m
        }),
        (st.flowObjectTypeSemicolon = function () {
          this.eat(C.semi) ||
            this.eat(C.comma) ||
            this.match(C.braceR) ||
            this.match(C.braceBarR) ||
            this.unexpected()
        }),
        (st.flowParseQualifiedTypeIdentifier = function (t, e, s) {
          ;(t = t || this.state.start), (e = e || this.state.startLoc)
          for (var i = s || this.parseIdentifier(); this.eat(C.dot); ) {
            var r = this.startNodeAt(t, e)
            ;(r.qualification = i),
              (r.id = this.parseIdentifier()),
              (i = this.finishNode(r, 'QualifiedTypeIdentifier'))
          }
          return i
        }),
        (st.flowParseGenericType = function (t, e, s) {
          var i = this.startNodeAt(t, e)
          return (
            (i.typeParameters = null),
            (i.id = this.flowParseQualifiedTypeIdentifier(t, e, s)),
            this.isRelational('<') &&
              (i.typeParameters = this.flowParseTypeParameterInstantiation()),
            this.finishNode(i, 'GenericTypeAnnotation')
          )
        }),
        (st.flowParseTypeofType = function () {
          var t = this.startNode()
          return (
            this.expect(C._typeof),
            (t.argument = this.flowParsePrimaryType()),
            this.finishNode(t, 'TypeofTypeAnnotation')
          )
        }),
        (st.flowParseTupleType = function () {
          var t = this.startNode()
          for (
            t.types = [], this.expect(C.bracketL);
            this.state.pos < this.input.length &&
            !this.match(C.bracketR) &&
            (t.types.push(this.flowParseType()), !this.match(C.bracketR));

          )
            this.expect(C.comma)
          return (
            this.expect(C.bracketR), this.finishNode(t, 'TupleTypeAnnotation')
          )
        }),
        (st.flowParseFunctionTypeParam = function () {
          var t = null,
            e = !1,
            s = null,
            i = this.startNode(),
            r = this.lookahead()
          return (
            r.type === C.colon || r.type === C.question
              ? ((t = this.parseIdentifier()),
                this.eat(C.question) && (e = !0),
                (s = this.flowParseTypeInitialiser()))
              : (s = this.flowParseType()),
            (i.name = t),
            (i.optional = e),
            (i.typeAnnotation = s),
            this.finishNode(i, 'FunctionTypeParam')
          )
        }),
        (st.reinterpretTypeAsFunctionTypeParam = function (t) {
          var e = this.startNodeAt(t.start, t.loc.start)
          return (
            (e.name = null),
            (e.optional = !1),
            (e.typeAnnotation = t),
            this.finishNode(e, 'FunctionTypeParam')
          )
        }),
        (st.flowParseFunctionTypeParams = function () {
          for (
            var t =
                arguments.length > 0 && void 0 !== arguments[0]
                  ? arguments[0]
                  : [],
              e = { params: t, rest: null };
            !this.match(C.parenR) && !this.match(C.ellipsis);

          )
            e.params.push(this.flowParseFunctionTypeParam()),
              this.match(C.parenR) || this.expect(C.comma)
          return (
            this.eat(C.ellipsis) &&
              (e.rest = this.flowParseFunctionTypeParam()),
            e
          )
        }),
        (st.flowIdentToTypeAnnotation = function (t, e, s, i) {
          switch (i.name) {
            case 'any':
              return this.finishNode(s, 'AnyTypeAnnotation')
            case 'void':
              return this.finishNode(s, 'VoidTypeAnnotation')
            case 'bool':
            case 'boolean':
              return this.finishNode(s, 'BooleanTypeAnnotation')
            case 'mixed':
              return this.finishNode(s, 'MixedTypeAnnotation')
            case 'empty':
              return this.finishNode(s, 'EmptyTypeAnnotation')
            case 'number':
              return this.finishNode(s, 'NumberTypeAnnotation')
            case 'string':
              return this.finishNode(s, 'StringTypeAnnotation')
            default:
              return this.flowParseGenericType(t, e, i)
          }
        }),
        (st.flowParsePrimaryType = function () {
          var t = this.state.start,
            e = this.state.startLoc,
            s = this.startNode(),
            i = void 0,
            r = void 0,
            a = !1,
            n = this.state.noAnonFunctionType
          switch (this.state.type) {
            case C.name:
              return this.flowIdentToTypeAnnotation(
                t,
                e,
                s,
                this.parseIdentifier()
              )
            case C.braceL:
              return this.flowParseObjectType(!1, !1, !0)
            case C.braceBarL:
              return this.flowParseObjectType(!1, !0, !0)
            case C.bracketL:
              return this.flowParseTupleType()
            case C.relational:
              if ('<' === this.state.value)
                return (
                  (s.typeParameters = this.flowParseTypeParameterDeclaration()),
                  this.expect(C.parenL),
                  (i = this.flowParseFunctionTypeParams()),
                  (s.params = i.params),
                  (s.rest = i.rest),
                  this.expect(C.parenR),
                  this.expect(C.arrow),
                  (s.returnType = this.flowParseType()),
                  this.finishNode(s, 'FunctionTypeAnnotation')
                )
              break
            case C.parenL:
              if (
                (this.next(), !this.match(C.parenR) && !this.match(C.ellipsis))
              )
                if (this.match(C.name)) {
                  var o = this.lookahead().type
                  a = o !== C.question && o !== C.colon
                } else a = !0
              if (a) {
                if (
                  ((this.state.noAnonFunctionType = !1),
                  (r = this.flowParseType()),
                  (this.state.noAnonFunctionType = n),
                  this.state.noAnonFunctionType ||
                    !(
                      this.match(C.comma) ||
                      (this.match(C.parenR) &&
                        this.lookahead().type === C.arrow)
                    ))
                )
                  return this.expect(C.parenR), r
                this.eat(C.comma)
              }
              return (
                (i = r
                  ? this.flowParseFunctionTypeParams([
                      this.reinterpretTypeAsFunctionTypeParam(r),
                    ])
                  : this.flowParseFunctionTypeParams()),
                (s.params = i.params),
                (s.rest = i.rest),
                this.expect(C.parenR),
                this.expect(C.arrow),
                (s.returnType = this.flowParseType()),
                (s.typeParameters = null),
                this.finishNode(s, 'FunctionTypeAnnotation')
              )
            case C.string:
              return this.parseLiteral(
                this.state.value,
                'StringLiteralTypeAnnotation'
              )
            case C._true:
            case C._false:
              return (
                (s.value = this.match(C._true)),
                this.next(),
                this.finishNode(s, 'BooleanLiteralTypeAnnotation')
              )
            case C.plusMin:
              if ('-' === this.state.value)
                return (
                  this.next(),
                  this.match(C.num) ||
                    this.unexpected(null, 'Unexpected token, expected number'),
                  this.parseLiteral(
                    -this.state.value,
                    'NumericLiteralTypeAnnotation',
                    s.start,
                    s.loc.start
                  )
                )
              this.unexpected()
            case C.num:
              return this.parseLiteral(
                this.state.value,
                'NumericLiteralTypeAnnotation'
              )
            case C._null:
              return (
                (s.value = this.match(C._null)),
                this.next(),
                this.finishNode(s, 'NullLiteralTypeAnnotation')
              )
            case C._this:
              return (
                (s.value = this.match(C._this)),
                this.next(),
                this.finishNode(s, 'ThisTypeAnnotation')
              )
            case C.star:
              return this.next(), this.finishNode(s, 'ExistentialTypeParam')
            default:
              if ('typeof' === this.state.type.keyword)
                return this.flowParseTypeofType()
          }
          this.unexpected()
        }),
        (st.flowParsePostfixType = function () {
          for (
            var t = this.state.start,
              e = this.state.startLoc,
              s = this.flowParsePrimaryType();
            !this.canInsertSemicolon() && this.match(C.bracketL);

          ) {
            var i = this.startNodeAt(t, e)
            ;(i.elementType = s),
              this.expect(C.bracketL),
              this.expect(C.bracketR),
              (s = this.finishNode(i, 'ArrayTypeAnnotation'))
          }
          return s
        }),
        (st.flowParsePrefixType = function () {
          var t = this.startNode()
          return this.eat(C.question)
            ? ((t.typeAnnotation = this.flowParsePrefixType()),
              this.finishNode(t, 'NullableTypeAnnotation'))
            : this.flowParsePostfixType()
        }),
        (st.flowParseAnonFunctionWithoutParens = function () {
          var t = this.flowParsePrefixType()
          if (!this.state.noAnonFunctionType && this.eat(C.arrow)) {
            var e = this.startNodeAt(t.start, t.loc.start)
            return (
              (e.params = [this.reinterpretTypeAsFunctionTypeParam(t)]),
              (e.rest = null),
              (e.returnType = this.flowParseType()),
              (e.typeParameters = null),
              this.finishNode(e, 'FunctionTypeAnnotation')
            )
          }
          return t
        }),
        (st.flowParseIntersectionType = function () {
          var t = this.startNode()
          this.eat(C.bitwiseAND)
          var e = this.flowParseAnonFunctionWithoutParens()
          for (t.types = [e]; this.eat(C.bitwiseAND); )
            t.types.push(this.flowParseAnonFunctionWithoutParens())
          return 1 === t.types.length
            ? e
            : this.finishNode(t, 'IntersectionTypeAnnotation')
        }),
        (st.flowParseUnionType = function () {
          var t = this.startNode()
          this.eat(C.bitwiseOR)
          var e = this.flowParseIntersectionType()
          for (t.types = [e]; this.eat(C.bitwiseOR); )
            t.types.push(this.flowParseIntersectionType())
          return 1 === t.types.length
            ? e
            : this.finishNode(t, 'UnionTypeAnnotation')
        }),
        (st.flowParseType = function () {
          var t = this.state.inType
          this.state.inType = !0
          var e = this.flowParseUnionType()
          return (this.state.inType = t), e
        }),
        (st.flowParseTypeAnnotation = function () {
          var t = this.startNode()
          return (
            (t.typeAnnotation = this.flowParseTypeInitialiser()),
            this.finishNode(t, 'TypeAnnotation')
          )
        }),
        (st.flowParseTypeAndPredicateAnnotation = function () {
          var t = this.startNode(),
            e = this.flowParseTypeAndPredicateInitialiser()
          return (
            (t.typeAnnotation = e[0]),
            (t.predicate = e[1]),
            this.finishNode(t, 'TypeAnnotation')
          )
        }),
        (st.flowParseTypeAnnotatableIdentifier = function () {
          var t = this.flowParseRestrictedIdentifier()
          return (
            this.match(C.colon) &&
              ((t.typeAnnotation = this.flowParseTypeAnnotation()),
              this.finishNode(t, t.type)),
            t
          )
        }),
        (st.typeCastToParameter = function (t) {
          return (
            (t.expression.typeAnnotation = t.typeAnnotation),
            this.finishNodeAt(
              t.expression,
              t.expression.type,
              t.typeAnnotation.end,
              t.typeAnnotation.loc.end
            )
          )
        }),
        (st.flowParseVariance = function () {
          var t = null
          return (
            this.match(C.plusMin) &&
              ('+' === this.state.value
                ? (t = 'plus')
                : '-' === this.state.value && (t = 'minus'),
              this.next()),
            t
          )
        })
      var it = String.fromCodePoint
      /*! https://mths.be/fromcodepoint v0.2.1 by @mathias */ if (!it) {
        var rt = String.fromCharCode,
          at = Math.floor
        it = function () {
          var t = 16384,
            e = [],
            s = void 0,
            i = void 0,
            r = -1,
            a = arguments.length
          if (!a) return ''
          for (var n = ''; ++r < a; ) {
            var o = Number(arguments[r])
            if (!isFinite(o) || o < 0 || o > 1114111 || at(o) != o)
              throw RangeError('Invalid code point: ' + o)
            o <= 65535
              ? e.push(o)
              : ((s = 55296 + ((o -= 65536) >> 10)),
                (i = (o % 1024) + 56320),
                e.push(s, i)),
              (r + 1 == a || e.length > t) &&
                ((n += rt.apply(null, e)), (e.length = 0))
          }
          return n
        }
      }
      var nt = it,
        ot = {
          quot: '"',
          amp: '&',
          apos: "'",
          lt: '<',
          gt: '>',
          nbsp: ' ',
          iexcl: '¡',
          cent: '¢',
          pound: '£',
          curren: '¤',
          yen: '¥',
          brvbar: '¦',
          sect: '§',
          uml: '¨',
          copy: '©',
          ordf: 'ª',
          laquo: '«',
          not: '¬',
          shy: '­',
          reg: '®',
          macr: '¯',
          deg: '°',
          plusmn: '±',
          sup2: '²',
          sup3: '³',
          acute: '´',
          micro: 'µ',
          para: '¶',
          middot: '·',
          cedil: '¸',
          sup1: '¹',
          ordm: 'º',
          raquo: '»',
          frac14: '¼',
          frac12: '½',
          frac34: '¾',
          iquest: '¿',
          Agrave: 'À',
          Aacute: 'Á',
          Acirc: 'Â',
          Atilde: 'Ã',
          Auml: 'Ä',
          Aring: 'Å',
          AElig: 'Æ',
          Ccedil: 'Ç',
          Egrave: 'È',
          Eacute: 'É',
          Ecirc: 'Ê',
          Euml: 'Ë',
          Igrave: 'Ì',
          Iacute: 'Í',
          Icirc: 'Î',
          Iuml: 'Ï',
          ETH: 'Ð',
          Ntilde: 'Ñ',
          Ograve: 'Ò',
          Oacute: 'Ó',
          Ocirc: 'Ô',
          Otilde: 'Õ',
          Ouml: 'Ö',
          times: '×',
          Oslash: 'Ø',
          Ugrave: 'Ù',
          Uacute: 'Ú',
          Ucirc: 'Û',
          Uuml: 'Ü',
          Yacute: 'Ý',
          THORN: 'Þ',
          szlig: 'ß',
          agrave: 'à',
          aacute: 'á',
          acirc: 'â',
          atilde: 'ã',
          auml: 'ä',
          aring: 'å',
          aelig: 'æ',
          ccedil: 'ç',
          egrave: 'è',
          eacute: 'é',
          ecirc: 'ê',
          euml: 'ë',
          igrave: 'ì',
          iacute: 'í',
          icirc: 'î',
          iuml: 'ï',
          eth: 'ð',
          ntilde: 'ñ',
          ograve: 'ò',
          oacute: 'ó',
          ocirc: 'ô',
          otilde: 'õ',
          ouml: 'ö',
          divide: '÷',
          oslash: 'ø',
          ugrave: 'ù',
          uacute: 'ú',
          ucirc: 'û',
          uuml: 'ü',
          yacute: 'ý',
          thorn: 'þ',
          yuml: 'ÿ',
          OElig: 'Œ',
          oelig: 'œ',
          Scaron: 'Š',
          scaron: 'š',
          Yuml: 'Ÿ',
          fnof: 'ƒ',
          circ: 'ˆ',
          tilde: '˜',
          Alpha: 'Α',
          Beta: 'Β',
          Gamma: 'Γ',
          Delta: 'Δ',
          Epsilon: 'Ε',
          Zeta: 'Ζ',
          Eta: 'Η',
          Theta: 'Θ',
          Iota: 'Ι',
          Kappa: 'Κ',
          Lambda: 'Λ',
          Mu: 'Μ',
          Nu: 'Ν',
          Xi: 'Ξ',
          Omicron: 'Ο',
          Pi: 'Π',
          Rho: 'Ρ',
          Sigma: 'Σ',
          Tau: 'Τ',
          Upsilon: 'Υ',
          Phi: 'Φ',
          Chi: 'Χ',
          Psi: 'Ψ',
          Omega: 'Ω',
          alpha: 'α',
          beta: 'β',
          gamma: 'γ',
          delta: 'δ',
          epsilon: 'ε',
          zeta: 'ζ',
          eta: 'η',
          theta: 'θ',
          iota: 'ι',
          kappa: 'κ',
          lambda: 'λ',
          mu: 'μ',
          nu: 'ν',
          xi: 'ξ',
          omicron: 'ο',
          pi: 'π',
          rho: 'ρ',
          sigmaf: 'ς',
          sigma: 'σ',
          tau: 'τ',
          upsilon: 'υ',
          phi: 'φ',
          chi: 'χ',
          psi: 'ψ',
          omega: 'ω',
          thetasym: 'ϑ',
          upsih: 'ϒ',
          piv: 'ϖ',
          ensp: ' ',
          emsp: ' ',
          thinsp: ' ',
          zwnj: '‌',
          zwj: '‍',
          lrm: '‎',
          rlm: '‏',
          ndash: '–',
          mdash: '—',
          lsquo: '‘',
          rsquo: '’',
          sbquo: '‚',
          ldquo: '“',
          rdquo: '”',
          bdquo: '„',
          dagger: '†',
          Dagger: '‡',
          bull: '•',
          hellip: '…',
          permil: '‰',
          prime: '′',
          Prime: '″',
          lsaquo: '‹',
          rsaquo: '›',
          oline: '‾',
          frasl: '⁄',
          euro: '€',
          image: 'ℑ',
          weierp: '℘',
          real: 'ℜ',
          trade: '™',
          alefsym: 'ℵ',
          larr: '←',
          uarr: '↑',
          rarr: '→',
          darr: '↓',
          harr: '↔',
          crarr: '↵',
          lArr: '⇐',
          uArr: '⇑',
          rArr: '⇒',
          dArr: '⇓',
          hArr: '⇔',
          forall: '∀',
          part: '∂',
          exist: '∃',
          empty: '∅',
          nabla: '∇',
          isin: '∈',
          notin: '∉',
          ni: '∋',
          prod: '∏',
          sum: '∑',
          minus: '−',
          lowast: '∗',
          radic: '√',
          prop: '∝',
          infin: '∞',
          ang: '∠',
          and: '∧',
          or: '∨',
          cap: '∩',
          cup: '∪',
          int: '∫',
          there4: '∴',
          sim: '∼',
          cong: '≅',
          asymp: '≈',
          ne: '≠',
          equiv: '≡',
          le: '≤',
          ge: '≥',
          sub: '⊂',
          sup: '⊃',
          nsub: '⊄',
          sube: '⊆',
          supe: '⊇',
          oplus: '⊕',
          otimes: '⊗',
          perp: '⊥',
          sdot: '⋅',
          lceil: '⌈',
          rceil: '⌉',
          lfloor: '⌊',
          rfloor: '⌋',
          lang: '〈',
          rang: '〉',
          loz: '◊',
          spades: '♠',
          clubs: '♣',
          hearts: '♥',
          diams: '♦',
        },
        ht = /^[\da-fA-F]+$/,
        ct = /^\d+$/
      ;(I.j_oTag = new S('<tag', !1)),
        (I.j_cTag = new S('</tag', !1)),
        (I.j_expr = new S('<tag>...</tag>', !0, !0)),
        (C.jsxName = new g('jsxName')),
        (C.jsxText = new g('jsxText', { beforeExpr: !0 })),
        (C.jsxTagStart = new g('jsxTagStart', { startsExpr: !0 })),
        (C.jsxTagEnd = new g('jsxTagEnd')),
        (C.jsxTagStart.updateContext = function () {
          this.state.context.push(I.j_expr),
            this.state.context.push(I.j_oTag),
            (this.state.exprAllowed = !1)
        }),
        (C.jsxTagEnd.updateContext = function (t) {
          var e = this.state.context.pop()
          ;(e === I.j_oTag && t === C.slash) || e === I.j_cTag
            ? (this.state.context.pop(),
              (this.state.exprAllowed = this.curContext() === I.j_expr))
            : (this.state.exprAllowed = !0)
        })
      var lt = B.prototype
      function pt(t) {
        return 'JSXIdentifier' === t.type
          ? t.name
          : 'JSXNamespacedName' === t.type
          ? t.namespace.name + ':' + t.name.name
          : 'JSXMemberExpression' === t.type
          ? pt(t.object) + '.' + pt(t.property)
          : void 0
      }
      ;(lt.jsxReadToken = function () {
        for (var t = '', e = this.state.pos; ; ) {
          this.state.pos >= this.input.length &&
            this.raise(this.state.start, 'Unterminated JSX contents')
          var s = this.input.charCodeAt(this.state.pos)
          switch (s) {
            case 60:
            case 123:
              return this.state.pos === this.state.start
                ? 60 === s && this.state.exprAllowed
                  ? (++this.state.pos, this.finishToken(C.jsxTagStart))
                  : this.getTokenFromCode(s)
                : ((t += this.input.slice(e, this.state.pos)),
                  this.finishToken(C.jsxText, t))
            case 38:
              ;(t += this.input.slice(e, this.state.pos)),
                (t += this.jsxReadEntity()),
                (e = this.state.pos)
              break
            default:
              k(s)
                ? ((t += this.input.slice(e, this.state.pos)),
                  (t += this.jsxReadNewLine(!0)),
                  (e = this.state.pos))
                : ++this.state.pos
          }
        }
      }),
        (lt.jsxReadNewLine = function (t) {
          var e = this.input.charCodeAt(this.state.pos),
            s = void 0
          return (
            ++this.state.pos,
            13 === e && 10 === this.input.charCodeAt(this.state.pos)
              ? (++this.state.pos, (s = t ? '\n' : '\r\n'))
              : (s = String.fromCharCode(e)),
            ++this.state.curLine,
            (this.state.lineStart = this.state.pos),
            s
          )
        }),
        (lt.jsxReadString = function (t) {
          for (var e = '', s = ++this.state.pos; ; ) {
            this.state.pos >= this.input.length &&
              this.raise(this.state.start, 'Unterminated string constant')
            var i = this.input.charCodeAt(this.state.pos)
            if (i === t) break
            38 === i
              ? ((e += this.input.slice(s, this.state.pos)),
                (e += this.jsxReadEntity()),
                (s = this.state.pos))
              : k(i)
              ? ((e += this.input.slice(s, this.state.pos)),
                (e += this.jsxReadNewLine(!1)),
                (s = this.state.pos))
              : ++this.state.pos
          }
          return (
            (e += this.input.slice(s, this.state.pos++)),
            this.finishToken(C.string, e)
          )
        }),
        (lt.jsxReadEntity = function () {
          for (
            var t = '',
              e = 0,
              s = void 0,
              i = this.input[this.state.pos],
              r = ++this.state.pos;
            this.state.pos < this.input.length && e++ < 10;

          ) {
            if (';' === (i = this.input[this.state.pos++])) {
              '#' === t[0]
                ? 'x' === t[1]
                  ? ((t = t.substr(2)), ht.test(t) && (s = nt(parseInt(t, 16))))
                  : ((t = t.substr(1)), ct.test(t) && (s = nt(parseInt(t, 10))))
                : (s = ot[t])
              break
            }
            t += i
          }
          return s || ((this.state.pos = r), '&')
        }),
        (lt.jsxReadWord = function () {
          var t = void 0,
            e = this.state.pos
          do {
            t = this.input.charCodeAt(++this.state.pos)
          } while (d(t) || 45 === t)
          return this.finishToken(
            C.jsxName,
            this.input.slice(e, this.state.pos)
          )
        }),
        (lt.jsxParseIdentifier = function () {
          var t = this.startNode()
          return (
            this.match(C.jsxName)
              ? (t.name = this.state.value)
              : this.state.type.keyword
              ? (t.name = this.state.type.keyword)
              : this.unexpected(),
            this.next(),
            this.finishNode(t, 'JSXIdentifier')
          )
        }),
        (lt.jsxParseNamespacedName = function () {
          var t = this.state.start,
            e = this.state.startLoc,
            s = this.jsxParseIdentifier()
          if (!this.eat(C.colon)) return s
          var i = this.startNodeAt(t, e)
          return (
            (i.namespace = s),
            (i.name = this.jsxParseIdentifier()),
            this.finishNode(i, 'JSXNamespacedName')
          )
        }),
        (lt.jsxParseElementName = function () {
          for (
            var t = this.state.start,
              e = this.state.startLoc,
              s = this.jsxParseNamespacedName();
            this.eat(C.dot);

          ) {
            var i = this.startNodeAt(t, e)
            ;(i.object = s),
              (i.property = this.jsxParseIdentifier()),
              (s = this.finishNode(i, 'JSXMemberExpression'))
          }
          return s
        }),
        (lt.jsxParseAttributeValue = function () {
          var t = void 0
          switch (this.state.type) {
            case C.braceL:
              if (
                'JSXEmptyExpression' !==
                (t = this.jsxParseExpressionContainer()).expression.type
              )
                return t
              this.raise(
                t.start,
                'JSX attributes must only be assigned a non-empty expression'
              )
            case C.jsxTagStart:
            case C.string:
              return ((t = this.parseExprAtom()).extra = null), t
            default:
              this.raise(
                this.state.start,
                'JSX value should be either an expression or a quoted JSX text'
              )
          }
        }),
        (lt.jsxParseEmptyExpression = function () {
          var t = this.startNodeAt(
            this.state.lastTokEnd,
            this.state.lastTokEndLoc
          )
          return this.finishNodeAt(
            t,
            'JSXEmptyExpression',
            this.state.start,
            this.state.startLoc
          )
        }),
        (lt.jsxParseSpreadChild = function () {
          var t = this.startNode()
          return (
            this.expect(C.braceL),
            this.expect(C.ellipsis),
            (t.expression = this.parseExpression()),
            this.expect(C.braceR),
            this.finishNode(t, 'JSXSpreadChild')
          )
        }),
        (lt.jsxParseExpressionContainer = function () {
          var t = this.startNode()
          return (
            this.next(),
            this.match(C.braceR)
              ? (t.expression = this.jsxParseEmptyExpression())
              : (t.expression = this.parseExpression()),
            this.expect(C.braceR),
            this.finishNode(t, 'JSXExpressionContainer')
          )
        }),
        (lt.jsxParseAttribute = function () {
          var t = this.startNode()
          return this.eat(C.braceL)
            ? (this.expect(C.ellipsis),
              (t.argument = this.parseMaybeAssign()),
              this.expect(C.braceR),
              this.finishNode(t, 'JSXSpreadAttribute'))
            : ((t.name = this.jsxParseNamespacedName()),
              (t.value = this.eat(C.eq) ? this.jsxParseAttributeValue() : null),
              this.finishNode(t, 'JSXAttribute'))
        }),
        (lt.jsxParseOpeningElementAt = function (t, e) {
          var s = this.startNodeAt(t, e)
          for (
            s.attributes = [], s.name = this.jsxParseElementName();
            !this.match(C.slash) && !this.match(C.jsxTagEnd);

          )
            s.attributes.push(this.jsxParseAttribute())
          return (
            (s.selfClosing = this.eat(C.slash)),
            this.expect(C.jsxTagEnd),
            this.finishNode(s, 'JSXOpeningElement')
          )
        }),
        (lt.jsxParseClosingElementAt = function (t, e) {
          var s = this.startNodeAt(t, e)
          return (
            (s.name = this.jsxParseElementName()),
            this.expect(C.jsxTagEnd),
            this.finishNode(s, 'JSXClosingElement')
          )
        }),
        (lt.jsxParseElementAt = function (t, e) {
          var s = this.startNodeAt(t, e),
            i = [],
            r = this.jsxParseOpeningElementAt(t, e),
            a = null
          if (!r.selfClosing) {
            t: for (;;)
              switch (this.state.type) {
                case C.jsxTagStart:
                  if (
                    ((t = this.state.start),
                    (e = this.state.startLoc),
                    this.next(),
                    this.eat(C.slash))
                  ) {
                    a = this.jsxParseClosingElementAt(t, e)
                    break t
                  }
                  i.push(this.jsxParseElementAt(t, e))
                  break
                case C.jsxText:
                  i.push(this.parseExprAtom())
                  break
                case C.braceL:
                  this.lookahead().type === C.ellipsis
                    ? i.push(this.jsxParseSpreadChild())
                    : i.push(this.jsxParseExpressionContainer())
                  break
                default:
                  this.unexpected()
              }
            pt(a.name) !== pt(r.name) &&
              this.raise(
                a.start,
                'Expected corresponding JSX closing tag for <' +
                  pt(r.name) +
                  '>'
              )
          }
          return (
            (s.openingElement = r),
            (s.closingElement = a),
            (s.children = i),
            this.match(C.relational) &&
              '<' === this.state.value &&
              this.raise(
                this.state.start,
                'Adjacent JSX elements must be wrapped in an enclosing tag'
              ),
            this.finishNode(s, 'JSXElement')
          )
        }),
        (lt.jsxParseElement = function () {
          var t = this.state.start,
            e = this.state.startLoc
          return this.next(), this.jsxParseElementAt(t, e)
        })
      ;(F.estree = function (t) {
        t.extend('checkDeclaration', function (t) {
          return function (e) {
            tt(e) ? this.checkDeclaration(e.value) : t.call(this, e)
          }
        }),
          t.extend('checkGetterSetterParamCount', function () {
            return function (t) {
              var e = 'get' === t.kind ? 0 : 1
              if (t.value.params.length !== e) {
                var s = t.start
                'get' === t.kind
                  ? this.raise(s, 'getter should have no params')
                  : this.raise(s, 'setter should have exactly one param')
              }
            }
          }),
          t.extend('checkLVal', function (t) {
            return function (e, s, i) {
              var r = this
              switch (e.type) {
                case 'ObjectPattern':
                  e.properties.forEach(function (t) {
                    r.checkLVal(
                      'Property' === t.type ? t.value : t,
                      s,
                      i,
                      'object destructuring pattern'
                    )
                  })
                  break
                default:
                  for (
                    var a = arguments.length,
                      n = Array(a > 3 ? a - 3 : 0),
                      o = 3;
                    o < a;
                    o++
                  )
                    n[o - 3] = arguments[o]
                  t.call.apply(t, [this, e, s, i].concat(n))
              }
            }
          }),
          t.extend('checkPropClash', function () {
            return function (t, e) {
              if (!t.computed && tt(t)) {
                var s = t.key
                '__proto__' ===
                  ('Identifier' === s.type ? s.name : String(s.value)) &&
                  (e.proto &&
                    this.raise(s.start, 'Redefinition of __proto__ property'),
                  (e.proto = !0))
              }
            }
          }),
          t.extend('isStrictBody', function () {
            return function (t, e) {
              if (!e && t.body.body.length > 0) {
                var s = t.body.body,
                  i = Array.isArray(s),
                  r = 0
                for (s = i ? s : s[Symbol.iterator](); ; ) {
                  var a
                  if (i) {
                    if (r >= s.length) break
                    a = s[r++]
                  } else {
                    if ((r = s.next()).done) break
                    a = r.value
                  }
                  var n = a
                  if (
                    'ExpressionStatement' !== n.type ||
                    'Literal' !== n.expression.type
                  )
                    break
                  if ('use strict' === n.expression.value) return !0
                }
              }
              return !1
            }
          }),
          t.extend('isValidDirective', function () {
            return function (t) {
              return !(
                'ExpressionStatement' !== t.type ||
                'Literal' !== t.expression.type ||
                'string' != typeof t.expression.value ||
                (t.expression.extra && t.expression.extra.parenthesized)
              )
            }
          }),
          t.extend('stmtToDirective', function (t) {
            return function (e) {
              var s = t.call(this, e),
                i = e.expression.value
              return (s.value.value = i), s
            }
          }),
          t.extend('parseBlockBody', function (t) {
            return function (e) {
              for (
                var s = this,
                  i = arguments.length,
                  r = Array(i > 1 ? i - 1 : 0),
                  a = 1;
                a < i;
                a++
              )
                r[a - 1] = arguments[a]
              t.call.apply(t, [this, e].concat(r)),
                e.directives.reverse().forEach(function (t) {
                  e.body.unshift(s.directiveToStmt(t))
                }),
                delete e.directives
            }
          }),
          t.extend('parseClassMethod', function () {
            return function (t, e, s, i) {
              this.parseMethod(e, s, i),
                e.typeParameters &&
                  ((e.value.typeParameters = e.typeParameters),
                  delete e.typeParameters),
                t.body.push(this.finishNode(e, 'MethodDefinition'))
            }
          }),
          t.extend('parseExprAtom', function (t) {
            return function () {
              switch (this.state.type) {
                case C.regexp:
                  return this.estreeParseRegExpLiteral(this.state.value)
                case C.num:
                case C.string:
                  return this.estreeParseLiteral(this.state.value)
                case C._null:
                  return this.estreeParseLiteral(null)
                case C._true:
                  return this.estreeParseLiteral(!0)
                case C._false:
                  return this.estreeParseLiteral(!1)
                default:
                  for (
                    var e = arguments.length, s = Array(e), i = 0;
                    i < e;
                    i++
                  )
                    s[i] = arguments[i]
                  return t.call.apply(t, [this].concat(s))
              }
            }
          }),
          t.extend('parseLiteral', function (t) {
            return function () {
              for (var e = arguments.length, s = Array(e), i = 0; i < e; i++)
                s[i] = arguments[i]
              var r = t.call.apply(t, [this].concat(s))
              return (r.raw = r.extra.raw), delete r.extra, r
            }
          }),
          t.extend('parseMethod', function (t) {
            return function (e) {
              var s = this.startNode()
              s.kind = e.kind
              for (
                var i = arguments.length, r = Array(i > 1 ? i - 1 : 0), a = 1;
                a < i;
                a++
              )
                r[a - 1] = arguments[a]
              return (
                delete (s = t.call.apply(t, [this, s].concat(r))).kind,
                (e.value = this.finishNode(s, 'FunctionExpression')),
                e
              )
            }
          }),
          t.extend('parseObjectMethod', function (t) {
            return function () {
              for (var e = arguments.length, s = Array(e), i = 0; i < e; i++)
                s[i] = arguments[i]
              var r = t.call.apply(t, [this].concat(s))
              return (
                r &&
                  ('method' === r.kind && (r.kind = 'init'),
                  (r.type = 'Property')),
                r
              )
            }
          }),
          t.extend('parseObjectProperty', function (t) {
            return function () {
              for (var e = arguments.length, s = Array(e), i = 0; i < e; i++)
                s[i] = arguments[i]
              var r = t.call.apply(t, [this].concat(s))
              return r && ((r.kind = 'init'), (r.type = 'Property')), r
            }
          }),
          t.extend('toAssignable', function (t) {
            return function (e, s) {
              for (
                var i = arguments.length, r = Array(i > 2 ? i - 2 : 0), a = 2;
                a < i;
                a++
              )
                r[a - 2] = arguments[a]
              if (tt(e))
                return this.toAssignable.apply(this, [e.value, s].concat(r)), e
              if ('ObjectExpression' === e.type) {
                e.type = 'ObjectPattern'
                var n = e.properties,
                  o = Array.isArray(n),
                  h = 0
                for (n = o ? n : n[Symbol.iterator](); ; ) {
                  var c
                  if (o) {
                    if (h >= n.length) break
                    c = n[h++]
                  } else {
                    if ((h = n.next()).done) break
                    c = h.value
                  }
                  var l = c
                  'get' === l.kind || 'set' === l.kind
                    ? this.raise(
                        l.key.start,
                        "Object pattern can't contain getter or setter"
                      )
                    : l.method
                    ? this.raise(
                        l.key.start,
                        "Object pattern can't contain methods"
                      )
                    : this.toAssignable(l, s, 'object destructuring pattern')
                }
                return e
              }
              return t.call.apply(t, [this, e, s].concat(r))
            }
          })
      }),
        (F.flow = function (t) {
          t.extend('parseFunctionBody', function (t) {
            return function (e, s) {
              return (
                this.match(C.colon) &&
                  !s &&
                  (e.returnType = this.flowParseTypeAndPredicateAnnotation()),
                t.call(this, e, s)
              )
            }
          }),
            t.extend('parseStatement', function (t) {
              return function (e, s) {
                if (
                  this.state.strict &&
                  this.match(C.name) &&
                  'interface' === this.state.value
                ) {
                  var i = this.startNode()
                  return this.next(), this.flowParseInterface(i)
                }
                return t.call(this, e, s)
              }
            }),
            t.extend('parseExpressionStatement', function (t) {
              return function (e, s) {
                if ('Identifier' === s.type)
                  if ('declare' === s.name) {
                    if (
                      this.match(C._class) ||
                      this.match(C.name) ||
                      this.match(C._function) ||
                      this.match(C._var) ||
                      this.match(C._export)
                    )
                      return this.flowParseDeclare(e)
                  } else if (this.match(C.name)) {
                    if ('interface' === s.name)
                      return this.flowParseInterface(e)
                    if ('type' === s.name) return this.flowParseTypeAlias(e)
                    if ('opaque' === s.name)
                      return this.flowParseOpaqueType(e, !1)
                  }
                return t.call(this, e, s)
              }
            }),
            t.extend('shouldParseExportDeclaration', function (t) {
              return function () {
                return (
                  this.isContextual('type') ||
                  this.isContextual('interface') ||
                  this.isContextual('opaque') ||
                  t.call(this)
                )
              }
            }),
            t.extend('isExportDefaultSpecifier', function (t) {
              return function () {
                return (
                  (!this.match(C.name) ||
                    ('type' !== this.state.value &&
                      'interface' !== this.state.value &&
                      'opaque' !== this.state.value)) &&
                  t.call(this)
                )
              }
            }),
            t.extend('parseConditional', function (t) {
              return function (e, s, i, r, a) {
                if (a && this.match(C.question)) {
                  var n = this.state.clone()
                  try {
                    return t.call(this, e, s, i, r)
                  } catch (t) {
                    if (t instanceof SyntaxError)
                      return (
                        (this.state = n),
                        (a.start = t.pos || this.state.start),
                        e
                      )
                    throw t
                  }
                }
                return t.call(this, e, s, i, r)
              }
            }),
            t.extend('parseParenItem', function (t) {
              return function (e, s, i) {
                if (
                  ((e = t.call(this, e, s, i)),
                  this.eat(C.question) && (e.optional = !0),
                  this.match(C.colon))
                ) {
                  var r = this.startNodeAt(s, i)
                  return (
                    (r.expression = e),
                    (r.typeAnnotation = this.flowParseTypeAnnotation()),
                    this.finishNode(r, 'TypeCastExpression')
                  )
                }
                return e
              }
            }),
            t.extend('parseExport', function (t) {
              return function (e) {
                return (
                  'ExportNamedDeclaration' === (e = t.call(this, e)).type &&
                    (e.exportKind = e.exportKind || 'value'),
                  e
                )
              }
            }),
            t.extend('parseExportDeclaration', function (t) {
              return function (e) {
                if (this.isContextual('type')) {
                  e.exportKind = 'type'
                  var s = this.startNode()
                  return (
                    this.next(),
                    this.match(C.braceL)
                      ? ((e.specifiers = this.parseExportSpecifiers()),
                        this.parseExportFrom(e),
                        null)
                      : this.flowParseTypeAlias(s)
                  )
                }
                if (this.isContextual('opaque')) {
                  e.exportKind = 'type'
                  var i = this.startNode()
                  return this.next(), this.flowParseOpaqueType(i, !1)
                }
                if (this.isContextual('interface')) {
                  e.exportKind = 'type'
                  var r = this.startNode()
                  return this.next(), this.flowParseInterface(r)
                }
                return t.call(this, e)
              }
            }),
            t.extend('parseClassId', function (t) {
              return function (e) {
                t.apply(this, arguments),
                  this.isRelational('<') &&
                    (e.typeParameters = this.flowParseTypeParameterDeclaration())
              }
            }),
            t.extend('isKeyword', function (t) {
              return function (e) {
                return (!this.state.inType || 'void' !== e) && t.call(this, e)
              }
            }),
            t.extend('readToken', function (t) {
              return function (e) {
                return !this.state.inType || (62 !== e && 60 !== e)
                  ? t.call(this, e)
                  : this.finishOp(C.relational, 1)
              }
            }),
            t.extend('jsx_readToken', function (t) {
              return function () {
                if (!this.state.inType) return t.call(this)
              }
            }),
            t.extend('toAssignable', function (t) {
              return function (e, s, i) {
                return 'TypeCastExpression' === e.type
                  ? t.call(this, this.typeCastToParameter(e), s, i)
                  : t.call(this, e, s, i)
              }
            }),
            t.extend('toAssignableList', function (t) {
              return function (e, s, i) {
                for (var r = 0; r < e.length; r++) {
                  var a = e[r]
                  a &&
                    'TypeCastExpression' === a.type &&
                    (e[r] = this.typeCastToParameter(a))
                }
                return t.call(this, e, s, i)
              }
            }),
            t.extend('toReferencedList', function () {
              return function (t) {
                for (var e = 0; e < t.length; e++) {
                  var s = t[e]
                  s &&
                    s._exprListItem &&
                    'TypeCastExpression' === s.type &&
                    this.raise(s.start, 'Unexpected type cast')
                }
                return t
              }
            }),
            t.extend('parseExprListItem', function (t) {
              return function () {
                for (
                  var e = this.startNode(),
                    s = arguments.length,
                    i = Array(s),
                    r = 0;
                  r < s;
                  r++
                )
                  i[r] = arguments[r]
                var a = t.call.apply(t, [this].concat(i))
                return this.match(C.colon)
                  ? ((e._exprListItem = !0),
                    (e.expression = a),
                    (e.typeAnnotation = this.flowParseTypeAnnotation()),
                    this.finishNode(e, 'TypeCastExpression'))
                  : a
              }
            }),
            t.extend('checkLVal', function (t) {
              return function (e) {
                if ('TypeCastExpression' !== e.type)
                  return t.apply(this, arguments)
              }
            }),
            t.extend('parseClassProperty', function (t) {
              return function (e) {
                return (
                  delete e.variancePos,
                  this.match(C.colon) &&
                    (e.typeAnnotation = this.flowParseTypeAnnotation()),
                  t.call(this, e)
                )
              }
            }),
            t.extend('isClassMethod', function (t) {
              return function () {
                return this.isRelational('<') || t.call(this)
              }
            }),
            t.extend('isClassProperty', function (t) {
              return function () {
                return this.match(C.colon) || t.call(this)
              }
            }),
            t.extend('isNonstaticConstructor', function (t) {
              return function (e) {
                return !this.match(C.colon) && t.call(this, e)
              }
            }),
            t.extend('parseClassMethod', function (t) {
              return function (e, s) {
                s.variance && this.unexpected(s.variancePos),
                  delete s.variance,
                  delete s.variancePos,
                  this.isRelational('<') &&
                    (s.typeParameters = this.flowParseTypeParameterDeclaration())
                for (
                  var i = arguments.length, r = Array(i > 2 ? i - 2 : 0), a = 2;
                  a < i;
                  a++
                )
                  r[a - 2] = arguments[a]
                t.call.apply(t, [this, e, s].concat(r))
              }
            }),
            t.extend('parseClassSuper', function (t) {
              return function (e, s) {
                if (
                  (t.call(this, e, s),
                  e.superClass &&
                    this.isRelational('<') &&
                    (e.superTypeParameters = this.flowParseTypeParameterInstantiation()),
                  this.isContextual('implements'))
                ) {
                  this.next()
                  var i = (e.implements = [])
                  do {
                    var r = this.startNode()
                    ;(r.id = this.parseIdentifier()),
                      this.isRelational('<')
                        ? (r.typeParameters = this.flowParseTypeParameterInstantiation())
                        : (r.typeParameters = null),
                      i.push(this.finishNode(r, 'ClassImplements'))
                  } while (this.eat(C.comma))
                }
              }
            }),
            t.extend('parsePropertyName', function (t) {
              return function (e) {
                var s = this.state.start,
                  i = this.flowParseVariance(),
                  r = t.call(this, e)
                return (e.variance = i), (e.variancePos = s), r
              }
            }),
            t.extend('parseObjPropValue', function (t) {
              return function (e) {
                e.variance && this.unexpected(e.variancePos),
                  delete e.variance,
                  delete e.variancePos
                var s = void 0
                this.isRelational('<') &&
                  ((s = this.flowParseTypeParameterDeclaration()),
                  this.match(C.parenL) || this.unexpected()),
                  t.apply(this, arguments),
                  s && ((e.value || e).typeParameters = s)
              }
            }),
            t.extend('parseAssignableListItemTypes', function () {
              return function (t) {
                return (
                  this.eat(C.question) && (t.optional = !0),
                  this.match(C.colon) &&
                    (t.typeAnnotation = this.flowParseTypeAnnotation()),
                  this.finishNode(t, t.type),
                  t
                )
              }
            }),
            t.extend('parseMaybeDefault', function (t) {
              return function () {
                for (var e = arguments.length, s = Array(e), i = 0; i < e; i++)
                  s[i] = arguments[i]
                var r = t.apply(this, s)
                return (
                  'AssignmentPattern' === r.type &&
                    r.typeAnnotation &&
                    r.right.start < r.typeAnnotation.start &&
                    this.raise(
                      r.typeAnnotation.start,
                      'Type annotations must come before default assignments, e.g. instead of `age = 25: number` use `age: number = 25`'
                    ),
                  r
                )
              }
            }),
            t.extend('parseImportSpecifiers', function (t) {
              return function (e) {
                e.importKind = 'value'
                var s = null
                if (
                  (this.match(C._typeof)
                    ? (s = 'typeof')
                    : this.isContextual('type') && (s = 'type'),
                  s)
                ) {
                  var i = this.lookahead()
                  ;((i.type === C.name && 'from' !== i.value) ||
                    i.type === C.braceL ||
                    i.type === C.star) &&
                    (this.next(), (e.importKind = s))
                }
                t.call(this, e)
              }
            }),
            t.extend('parseImportSpecifier', function () {
              return function (t) {
                var e = this.startNode(),
                  s = this.state.start,
                  i = this.parseIdentifier(!0),
                  r = null
                'type' === i.name
                  ? (r = 'type')
                  : 'typeof' === i.name && (r = 'typeof')
                var a = !1
                if (this.isContextual('as')) {
                  var n = this.parseIdentifier(!0)
                  null === r || this.match(C.name) || this.state.type.keyword
                    ? ((e.imported = i),
                      (e.importKind = null),
                      (e.local = this.parseIdentifier()))
                    : ((e.imported = n),
                      (e.importKind = r),
                      (e.local = n.__clone()))
                } else null !== r && (this.match(C.name) || this.state.type.keyword) ? ((e.imported = this.parseIdentifier(!0)), (e.importKind = r), this.eatContextual('as') ? (e.local = this.parseIdentifier()) : ((a = !0), (e.local = e.imported.__clone()))) : ((a = !0), (e.imported = i), (e.importKind = null), (e.local = e.imported.__clone()))
                ;('type' !== t.importKind && 'typeof' !== t.importKind) ||
                  ('type' !== e.importKind && 'typeof' !== e.importKind) ||
                  this.raise(
                    s,
                    '`The `type` and `typeof` keywords on named imports can only be used on regular `import` statements. It cannot be used with `import type` or `import typeof` statements`'
                  ),
                  a && this.checkReservedWord(e.local.name, e.start, !0, !0),
                  this.checkLVal(e.local, !0, void 0, 'import specifier'),
                  t.specifiers.push(this.finishNode(e, 'ImportSpecifier'))
              }
            }),
            t.extend('parseFunctionParams', function (t) {
              return function (e) {
                this.isRelational('<') &&
                  (e.typeParameters = this.flowParseTypeParameterDeclaration()),
                  t.call(this, e)
              }
            }),
            t.extend('parseVarHead', function (t) {
              return function (e) {
                t.call(this, e),
                  this.match(C.colon) &&
                    ((e.id.typeAnnotation = this.flowParseTypeAnnotation()),
                    this.finishNode(e.id, e.id.type))
              }
            }),
            t.extend('parseAsyncArrowFromCallExpression', function (t) {
              return function (e, s) {
                if (this.match(C.colon)) {
                  var i = this.state.noAnonFunctionType
                  ;(this.state.noAnonFunctionType = !0),
                    (e.returnType = this.flowParseTypeAnnotation()),
                    (this.state.noAnonFunctionType = i)
                }
                return t.call(this, e, s)
              }
            }),
            t.extend('shouldParseAsyncArrow', function (t) {
              return function () {
                return this.match(C.colon) || t.call(this)
              }
            }),
            t.extend('parseMaybeAssign', function (t) {
              return function () {
                for (
                  var e = null, s = arguments.length, i = Array(s), r = 0;
                  r < s;
                  r++
                )
                  i[r] = arguments[r]
                if (C.jsxTagStart && this.match(C.jsxTagStart)) {
                  var a = this.state.clone()
                  try {
                    return t.apply(this, i)
                  } catch (t) {
                    if (!(t instanceof SyntaxError)) throw t
                    ;(this.state = a), (this.state.context.length -= 2), (e = t)
                  }
                }
                if (null != e || this.isRelational('<')) {
                  var n = void 0,
                    o = void 0
                  try {
                    ;(o = this.flowParseTypeParameterDeclaration()),
                      ((n = t.apply(this, i)).typeParameters = o),
                      (n.start = o.start),
                      (n.loc.start = o.loc.start)
                  } catch (t) {
                    throw e || t
                  }
                  if ('ArrowFunctionExpression' === n.type) return n
                  if (null != e) throw e
                  this.raise(
                    o.start,
                    'Expected an arrow function after this type parameter declaration'
                  )
                }
                return t.apply(this, i)
              }
            }),
            t.extend('parseArrow', function (t) {
              return function (e) {
                if (this.match(C.colon)) {
                  var s = this.state.clone()
                  try {
                    var i = this.state.noAnonFunctionType
                    this.state.noAnonFunctionType = !0
                    var r = this.flowParseTypeAndPredicateAnnotation()
                    ;(this.state.noAnonFunctionType = i),
                      this.canInsertSemicolon() && this.unexpected(),
                      this.match(C.arrow) || this.unexpected(),
                      (e.returnType = r)
                  } catch (t) {
                    if (!(t instanceof SyntaxError)) throw t
                    this.state = s
                  }
                }
                return t.call(this, e)
              }
            }),
            t.extend('shouldParseArrow', function (t) {
              return function () {
                return this.match(C.colon) || t.call(this)
              }
            })
        }),
        (F.jsx = function (t) {
          t.extend('parseExprAtom', function (t) {
            return function (e) {
              if (this.match(C.jsxText)) {
                var s = this.parseLiteral(this.state.value, 'JSXText')
                return (s.extra = null), s
              }
              return this.match(C.jsxTagStart)
                ? this.jsxParseElement()
                : t.call(this, e)
            }
          }),
            t.extend('readToken', function (t) {
              return function (e) {
                if (this.state.inPropertyName) return t.call(this, e)
                var s = this.curContext()
                if (s === I.j_expr) return this.jsxReadToken()
                if (s === I.j_oTag || s === I.j_cTag) {
                  if (f(e)) return this.jsxReadWord()
                  if (62 === e)
                    return ++this.state.pos, this.finishToken(C.jsxTagEnd)
                  if ((34 === e || 39 === e) && s === I.j_oTag)
                    return this.jsxReadString(e)
                }
                return 60 === e && this.state.exprAllowed
                  ? (++this.state.pos, this.finishToken(C.jsxTagStart))
                  : t.call(this, e)
              }
            }),
            t.extend('updateContext', function (t) {
              return function (e) {
                if (this.match(C.braceL)) {
                  var s = this.curContext()
                  s === I.j_oTag
                    ? this.state.context.push(I.braceExpression)
                    : s === I.j_expr
                    ? this.state.context.push(I.templateQuasi)
                    : t.call(this, e),
                    (this.state.exprAllowed = !0)
                } else {
                  if (!this.match(C.slash) || e !== C.jsxTagStart)
                    return t.call(this, e)
                  ;(this.state.context.length -= 2),
                    this.state.context.push(I.j_cTag),
                    (this.state.exprAllowed = !1)
                }
              }
            })
        }),
        (e.parse = function (t, e) {
          return new B(e, t).parse()
        }),
        (e.parseExpression = function (t, e) {
          var s = new B(e, t)
          return (
            s.options.strictMode && (s.state.strict = !0), s.getExpression()
          )
        }),
        (e.tokTypes = C)
    },
    function (t, e, s) {
      'use strict'
      var i =
        (this && this.__assign) ||
        function () {
          return (i =
            Object.assign ||
            function (t) {
              for (var e, s = 1, i = arguments.length; s < i; s++)
                for (var r in (e = arguments[s]))
                  Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r])
              return t
            }).apply(this, arguments)
        }
      Object.defineProperty(e, '__esModule', { value: !0 })
      var r = s(4),
        a = s(16),
        n = s(17),
        o = s(18),
        h = s(19),
        c = i(
          i(i(i(i({}, r.es5), a.es2015), n.es2016), o.es2017),
          h.experimental
        )
      e.default = function t(e) {
        return (e.evaluate = t), (0, c[e.node.type])(e)
      }
    },
    function (e, s) {
      e.exports = t
    },
    function (t, e, s) {
      'use strict'
      Object.defineProperty(e, '__esModule', { value: !0 })
      var i = function (t) {
        this.constructor = t
      }
      e.Prototype = i
    },
    function (t, e, s) {
      'use strict'
      Object.defineProperty(e, '__esModule', { value: !0 })
      var i = function (t) {
        this.context = t
      }
      e.This = i
    },
    function (t, e, s) {
      'use strict'
      var i =
          (this && this.__assign) ||
          function () {
            return (i =
              Object.assign ||
              function (t) {
                for (var e, s = 1, i = arguments.length; s < i; s++)
                  for (var r in (e = arguments[s]))
                    Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r])
                return t
              }).apply(this, arguments)
          },
        r =
          (this && this.__spreadArrays) ||
          function () {
            for (var t = 0, e = 0, s = arguments.length; e < s; e++)
              t += arguments[e].length
            var i = Array(t),
              r = 0
            for (e = 0; e < s; e++)
              for (var a = arguments[e], n = 0, o = a.length; n < o; n++, r++)
                i[r] = a[n]
            return i
          }
      Object.defineProperty(e, '__esModule', { value: !0 })
      var a = s(5),
        n = s(2),
        o = s(6),
        h = s(1),
        c = s(7),
        l = s(0),
        p = s(8),
        u = s(9)
      function f(t, e, s) {
        return (
          e.push({
            filename: l.ANONYMOUS,
            stack: e.currentStackName,
            location: s.loc,
          }),
          (t.stack = t.toString() + '\n' + e.raw),
          t
        )
      }
      e.es2015 = {
        ArrowFunctionExpression: function (t) {
          var e = t.node,
            s = t.scope,
            i = function () {
              for (var i = [], r = 0; r < arguments.length; r++)
                i[r] = arguments[r]
              for (
                var a = s.createChild(h.ScopeType.Function), n = 0;
                n < e.params.length;
                n++
              ) {
                var o = e.params[n].name
                a.const(o, i[n])
              }
              var p = s.hasBinding(l.THIS)
              a.const(l.THIS, p ? p.value : null), a.const(l.ARGUMENTS, i)
              var u = t.evaluate(t.createChild(e.body, a))
              return c.Signal.isReturn(u) ? u.value : u
            }
          return (
            u.defineFunctionLength(i, e.params.length),
            u.defineFunctionName(i, e.id ? e.id.name : ''),
            i
          )
        },
        TemplateLiteral: function (t) {
          var e = t.node
          return []
            .concat(e.expressions, e.quasis)
            .sort(function (t, e) {
              return t.start - e.start
            })
            .map(function (e) {
              return t.evaluate(t.createChild(e))
            })
            .join('')
        },
        TemplateElement: function (t) {
          return t.node.value.raw
        },
        ForOfStatement: function (t) {
          var e,
            s = t.node,
            i = t.scope,
            r = t.ctx,
            a = t.stack,
            o = r.labelName,
            l = t.evaluate(t.createChild(s.right)),
            u = (e = i.hasBinding('Symbol')) ? e.value : void 0
          if (u && (!l || !l[u.iterator]))
            throw f(n.ErrInvalidIterable(s.right.name), a, s.right)
          if (p.isVariableDeclaration(s.left))
            for (
              var d = s.left.declarations[0].id.name, m = 0, y = l;
              m < y.length;
              m++
            ) {
              var v = y[m]
              ;((E = i.createChild(h.ScopeType.ForOf)).invasive = !0),
                (E.isolated = !1),
                E.declare(s.left.kind, d, v)
              var x = t.evaluate(t.createChild(s.body, E))
              if (c.Signal.isBreak(x)) {
                if (!x.value) break
                if (x.value === o) break
                return x
              }
              if (c.Signal.isContinue(x)) {
                if (!x.value) continue
                if (x.value === o) continue
                return x
              }
              if (c.Signal.isReturn(x)) return x
            }
          else if (p.isIdentifier(s.left)) {
            d = s.left.name
            for (var b = 0, g = l; b < g.length; b++) {
              var E
              v = g[b]
              ;((E = i.createChild(h.ScopeType.ForOf)).invasive = !0),
                i.var(d, v)
              x = t.evaluate(t.createChild(s.body, E))
              if (c.Signal.isBreak(x)) {
                if (!x.value) break
                if (x.value === o) break
                return x
              }
              if (c.Signal.isContinue(x)) {
                if (!x.value) continue
                if (x.value === o) continue
                return x
              }
              if (c.Signal.isReturn(x)) return x
            }
          }
        },
        ClassDeclaration: function (t) {
          for (
            var e = t.evaluate(
                t.createChild(
                  t.node.body,
                  t.scope.createChild(h.ScopeType.Class)
                )
              ),
              s = 0,
              i = (t.node.decorators || [])
                .map(function (e) {
                  return t.evaluate(t.createChild(e))
                })
                .reverse();
            s < i.length;
            s++
          ) {
            ;(0, i[s])(e)
          }
          t.scope.const(t.node.id.name, e)
        },
        ClassBody: function (t) {
          var e,
            s = t.node,
            i = t.scope,
            r = t.stack,
            a = s.body.find(function (t) {
              return p.isClassMethod(t) && 'constructor' === t.kind
            }),
            d = s.body.filter(function (t) {
              return p.isClassMethod(t) && 'constructor' !== t.kind
            }),
            m = s.body.filter(function (t) {
              return p.isClassProperty(t)
            }),
            y = t.parent.node
          return (function (e) {
            function v() {
              for (var c = this, p = [], u = 0; u < arguments.length; u++)
                p[u] = arguments[u]
              r.enter(y.id.name + '.constructor'), o._classCallCheck(this, v)
              var d = i.createChild(h.ScopeType.Constructor)
              if (
                (m.forEach(function (e) {
                  c[e.key.name] = t.evaluate(t.createChild(e.value, d))
                }),
                a)
              ) {
                a.params.forEach(function (t, e) {
                  d.const(t.name, p[e])
                }),
                  e || d.const(l.THIS, this),
                  d.const(l.NEW, { target: v })
                for (var x = 0, b = a.body.body; x < b.length; x++) {
                  var g = b[x]
                  t.evaluate(
                    t.createChild(g, d, {
                      SuperClass: e,
                      ClassConstructor: v,
                      ClassConstructorArguments: p,
                      ClassEntity: this,
                      classScope: d,
                    })
                  )
                }
              } else
                d.const(l.THIS, this),
                  o._possibleConstructorReturn(
                    this,
                    (v.__proto__ || Object.getPrototypeOf(v)).apply(this, p)
                  )
              if (!d.hasOwnBinding(l.THIS)) throw f(n.ErrNoSuper(), t.stack, s)
              return r.leave(), this
            }
            e && o._inherits(v, e),
              u.defineFunctionLength(v, a ? a.params.length : 0),
              u.defineFunctionName(v, y.id.name)
            var x = d
              .map(function (s) {
                var a,
                  n = s.id
                    ? s.id.name
                    : s.computed
                    ? t.evaluate(t.createChild(s.key))
                    : s.key.name,
                  o = i.createChild(h.ScopeType.Function),
                  f = function () {
                    for (var i = [], a = 0; a < arguments.length; a++)
                      i[a] = arguments[a]
                    r.enter(y.id.name + '.' + n),
                      o.const(l.THIS, this),
                      o.const(l.NEW, { target: void 0 }),
                      s.params.forEach(function (t, e) {
                        p.isIdentifier(t) && o.const(t.name, i[e])
                      })
                    var h = t.evaluate(
                      t.createChild(s.body, o, {
                        SuperClass: e,
                        ClassConstructor: v,
                        ClassMethodArguments: i,
                        ClassEntity: this,
                      })
                    )
                    if ((r.leave(), c.Signal.isReturn(h))) return h.value
                  }
                return (
                  u.defineFunctionLength(f, s.params.length),
                  u.defineFunctionName(f, n),
                  ((a = { key: s.key.name })[
                    'method' === s.kind ? 'value' : s.kind
                  ] = f),
                  a
                )
              })
              .concat([{ key: 'constructor', value: v }])
            return o._createClass(v, x), v
          })(
            y.superClass
              ? (e = i.hasBinding(y.superClass.name))
                ? e.value
                : null
              : null
          )
        },
        ClassMethod: function (t) {
          return t.evaluate(t.createChild(t.node.body))
        },
        ClassExpression: function (t) {},
        Super: function (t) {
          var e = t.ctx,
            s = e.SuperClass,
            i = e.ClassConstructor,
            r = e.ClassEntity,
            a = e.classScope
          if (!t.findParent('ClassBody'))
            throw new Error('super() only can use in ClassDeclaration')
          var n = t.parent
          if (n) {
            if (p.isCallExpression(n.node))
              return (
                a && !a.hasOwnBinding(l.THIS) && a.const(l.THIS, r),
                function () {
                  for (var t = [], e = 0; e < arguments.length; e++)
                    t[e] = arguments[e]
                  o._possibleConstructorReturn(
                    r,
                    (i.__proto__ || Object.getPrototypeOf(i)).apply(r, t)
                  )
                }.bind(r)
              )
            if (p.isMemberExpression(n.node)) return s.prototype
          }
        },
        SpreadElement: function (t) {
          return t.evaluate(t.createChild(t.node.argument))
        },
        ImportDeclaration: function (t) {
          var e = t.node,
            s = t.scope,
            i = t.stack,
            r = '',
            o = [],
            h = t.evaluate(t.createChild(e.source))
          e.specifiers.forEach(function (e) {
            if (p.isImportDefaultSpecifier(e)) r = t.evaluate(t.createChild(e))
            else {
              if (!p.isImportSpecifier(e)) throw e
              o.push(t.evaluate(t.createChild(e)))
            }
          })
          var c = s.hasBinding(l.REQUIRE)
          if (void 0 === c) throw f(n.ErrNotDefined(l.REQUIRE), i, e)
          var u = c.value
          if (!a(u)) throw f(n.ErrIsNotFunction(l.REQUIRE), i, e)
          var d = u(h) || {}
          r && s.const(r, d.default ? d.default : d)
          for (var m = 0, y = o; m < y.length; m++) {
            var v = y[m]
            s.const(v, d[v])
          }
        },
        ExportDefaultDeclaration: function (t) {
          var e = t.node,
            s = t.scope.hasBinding(l.MODULE)
          if (s) {
            var r = s.value
            r.exports = i(
              i({}, r.exports),
              t.evaluate(t.createChild(e.declaration))
            )
          }
        },
        ExportNamedDeclaration: function (t) {
          t.node.specifiers.forEach(function (e) {
            return t.evaluate(t.createChild(e))
          })
        },
        AssignmentPattern: function (t) {
          var e = t.node,
            s = t.scope,
            i = t.ctx.value
          s.const(
            e.left.name,
            void 0 === i ? t.evaluate(t.createChild(e.right)) : i
          )
        },
        RestElement: function (t) {
          var e = t.node,
            s = t.scope,
            i = t.ctx.value
          s.const(e.argument.name, i)
        },
        YieldExpression: function (t) {
          ;(0, t.ctx.next)(t.evaluate(t.createChild(t.node.argument)))
        },
        TaggedTemplateExpression: function (t) {
          var e = t.node.quasi.quasis.map(function (t) {
              return t.value.cooked
            }),
            s = t.node.quasi.quasis.map(function (t) {
              return t.value.raw
            }),
            i = o._taggedTemplateLiteral(e, s),
            a = t.evaluate(t.createChild(t.node.tag)),
            n =
              t.node.quasi.expressions.map(function (e) {
                return t.evaluate(t.createChild(e))
              }) || []
          return a.apply(void 0, r([i], n))
        },
        MetaProperty: function (t) {
          return t.evaluate(t.createChild(t.node.meta))[t.node.property.name]
        },
      }
    },
    function (t, e, s) {
      'use strict'
      var i =
        (this && this.__assign) ||
        function () {
          return (i =
            Object.assign ||
            function (t) {
              for (var e, s = 1, i = arguments.length; s < i; s++)
                for (var r in (e = arguments[s]))
                  Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r])
              return t
            }).apply(this, arguments)
        }
      Object.defineProperty(e, '__esModule', { value: !0 })
      var r = s(4),
        a = i(i({}, r.BinaryExpressionOperatorEvaluateMap), {
          '**': function (t, e) {
            return Math.pow(t, e)
          },
        })
      e.es2016 = {
        BinaryExpression: function (t) {
          var e = t.node
          return a[e.operator](
            t.evaluate(t.createChild(e.left)),
            t.evaluate(t.createChild(e.right))
          )
        },
      }
    },
    function (t, e, s) {
      'use strict'
      Object.defineProperty(e, '__esModule', { value: !0 }),
        (e.es2017 = {
          AwaitExpression: function (t) {
            ;(0, t.ctx.next)(t.evaluate(t.createChild(t.node.argument)))
          },
        })
    },
    function (t, e, s) {
      'use strict'
      Object.defineProperty(e, '__esModule', { value: !0 })
      var i = s(1),
        r = s(0)
      e.experimental = {
        ImportSpecifier: function (t) {
          return t.node.local.name
        },
        ImportDefaultSpecifier: function (t) {
          return t.node.local.name
        },
        ExportSpecifier: function (t) {
          var e = t.node,
            s = t.scope.hasBinding(r.MODULE)
          s &&
            (s.value.exports[e.local.name] = t.evaluate(t.createChild(e.local)))
        },
        SpreadProperty: function (t) {
          var e = t.node,
            s = t.ctx.object
          Object.assign(s, t.evaluate(t.createChild(e.argument)))
        },
        DoExpression: function (t) {
          var e = t.scope.createChild(i.ScopeType.Do)
          return (e.invasive = !0), t.evaluate(t.createChild(t.node.body, e))
        },
        Decorator: function (t) {
          return t.evaluate(t.createChild(t.node.expression))
        },
      }
    },
    function (t, e, s) {
      'use strict'
      var i =
        (this && this.__assign) ||
        function () {
          return (i =
            Object.assign ||
            function (t) {
              for (var e, s = 1, i = arguments.length; s < i; s++)
                for (var r in (e = arguments[s]))
                  Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r])
              return t
            }).apply(this, arguments)
        }
      Object.defineProperty(e, '__esModule', { value: !0 })
      var r = (function () {
        function t(t, e, s, i, r) {
          ;(this.node = t),
            (this.parent = e),
            (this.scope = s),
            (this.ctx = i),
            (this.stack = r)
        }
        return (
          (t.prototype.createChild = function (e, s, r) {
            var a = new t(
              e,
              this,
              s
                ? 'number' == typeof s
                  ? this.scope.createChild(s)
                  : s
                : this.scope,
              i(i({}, this.ctx), r),
              this.stack
            )
            return (a.evaluate = this.evaluate), (a.preset = this.preset), a
          }),
          (t.prototype.findParent = function (t) {
            return this.parent
              ? this.parent.node.type === t
                ? this.parent
                : this.parent.findParent(t)
              : null
          }),
          t
        )
      })()
      e.Path = r
    },
    function (t, e, s) {
      'use strict'
      Object.defineProperty(e, '__esModule', { value: !0 })
      var i = s(3),
        r = s(2),
        a = s(1),
        n = s(22),
        o = (function () {
          function t(t, e) {
            ;(this.type = t),
              (this.parent = e),
              (this.invasive = !1),
              (this.level = 0),
              (this.isolated = !0),
              (this.origin = null),
              (this.content = {}),
              (this.context = new i.Context())
          }
          return (
            Object.defineProperty(t.prototype, 'length', {
              get: function () {
                return Object.keys(this.content).length
              },
              enumerable: !0,
              configurable: !0,
            }),
            Object.defineProperty(t.prototype, 'raw', {
              get: function () {
                var t = {}
                for (var e in this.content)
                  this.content.hasOwnProperty(e) &&
                    (t[e] = this.content[e].value)
                return t
              },
              enumerable: !0,
              configurable: !0,
            }),
            (t.prototype.setContext = function (t) {
              for (var e in ((this.context = t), t))
                t.hasOwnProperty(e) && this.var(e, t[e])
            }),
            (t.prototype.hasBinding = function (t) {
              return this.content.hasOwnProperty(t)
                ? this.content[t]
                : this.parent
                ? this.parent.hasBinding(t)
                : void 0
            }),
            (t.prototype.hasOwnBinding = function (t) {
              return this.content.hasOwnProperty(t) ? this.content[t] : void 0
            }),
            Object.defineProperty(t.prototype, 'global', {
              get: function () {
                return this.parent ? this.parent.global : this
              },
              enumerable: !0,
              configurable: !0,
            }),
            (t.prototype.let = function (t, e) {
              if (this.content.hasOwnProperty(t)) throw r.ErrDuplicateDeclard(t)
              return (this.content[t] = new n.Var(a.Kind.Let, t, e, this)), !0
            }),
            (t.prototype.const = function (t, e) {
              if (this.content.hasOwnProperty(t)) throw r.ErrDuplicateDeclard(t)
              return (this.content[t] = new n.Var(a.Kind.Const, t, e, this)), !0
            }),
            (t.prototype.var = function (t, e) {
              for (
                var s = this;
                null !== s.parent && !a.isolatedScopeMap[s.type];

              )
                s = s.parent
              if (s.content.hasOwnProperty(t)) {
                if (s.content[t].kind !== a.Kind.Var)
                  throw r.ErrDuplicateDeclard(t)
                ;(0 === s.level && s.context[t]) ||
                  (s.content[t] = new n.Var(a.Kind.Var, t, e, s))
              } else s.content[t] = new n.Var(a.Kind.Var, t, e, s)
              return !0
            }),
            (t.prototype.declare = function (t, e, s) {
              var i,
                r = this
              return ((i = {}),
              (i[a.Kind.Const] = function () {
                return r.const(e, s)
              }),
              (i[a.Kind.Let] = function () {
                return r.let(e, s)
              }),
              (i[a.Kind.Var] = function () {
                return r.var(e, s)
              }),
              i)[t]()
            }),
            (t.prototype.del = function (t) {
              return (
                this.content.hasOwnProperty(t) && delete this.content[t], !0
              )
            }),
            (t.prototype.createChild = function (e) {
              var s = new t(e, this)
              return (s.level = this.level + 1), s
            }),
            (t.prototype.fork = function (e) {
              var s = new t(e || this.type, null)
              for (var i in ((s.invasive = this.invasive),
              (s.level = this.level),
              (s.context = this.context),
              (s.parent = this.parent),
              (s.origin = this),
              this.content))
                if (this.content.hasOwnProperty(i)) {
                  var r = this.content[i]
                  s.declare(r.kind, r.name, r.value)
                }
              return s
            }),
            (t.prototype.locate = function (t) {
              return this.hasOwnBinding(t)
                ? this
                : this.parent
                ? this.parent.locate.call(this.parent, t)
                : void 0
            }),
            t
          )
        })()
      e.Scope = o
    },
    function (t, e, s) {
      'use strict'
      Object.defineProperty(e, '__esModule', { value: !0 })
      var i = (function () {
        function t(t, e, s, i) {
          ;(this.kind = t), (this.name = e), (this.val = s), (this.scope = i)
        }
        return (
          Object.defineProperty(t.prototype, 'value', {
            get: function () {
              return this.val
            },
            enumerable: !0,
            configurable: !0,
          }),
          (t.prototype.set = function (t) {
            this.val = t
          }),
          t
        )
      })()
      e.Var = i
    },
    function (t, e, s) {
      'use strict'
      Object.defineProperty(e, '__esModule', { value: !0 })
      var i = (function () {
        function t(t) {
          void 0 === t && (t = Error.stackTraceLimit || 10),
            (this.limitSize = t),
            (this.stackList = []),
            (this.items = [])
        }
        return (
          (t.prototype.enter = function (t) {
            this.stackList.push(t)
          }),
          (t.prototype.leave = function () {
            this.stackList.pop(), this.items.pop()
          }),
          (t.prototype.push = function (t) {
            this.size > this.limitSize && this.items.shift(), this.items.push(t)
          }),
          Object.defineProperty(t.prototype, 'currentStackName', {
            get: function () {
              return this.stackList.length
                ? this.stackList[this.stackList.length - 1]
                : ''
            },
            enumerable: !0,
            configurable: !0,
          }),
          (t.prototype.peek = function () {
            return this.items[this.items.length - 1]
          }),
          (t.prototype.isEmpty = function () {
            return 0 === this.items.length
          }),
          (t.prototype.clear = function () {
            this.items = []
          }),
          Object.defineProperty(t.prototype, 'raw', {
            get: function () {
              return this.items
                .reverse()
                .map(function (t) {
                  var e =
                    '<' +
                    t.filename +
                    '>:' +
                    t.location.start.line +
                    ':' +
                    (t.location.start.column + 1)
                  return t.stack ? 'at ' + t.stack + ' (' + e + ')' : 'at ' + e
                })
                .map(function (t) {
                  return '    ' + t
                })
                .join('\n')
            },
            enumerable: !0,
            configurable: !0,
          }),
          Object.defineProperty(t.prototype, 'size', {
            get: function () {
              return this.items.length
            },
            enumerable: !0,
            configurable: !0,
          }),
          t
        )
      })()
      e.Stack = i
    },
  ])
})
//# sourceMappingURL=vm.js.map
