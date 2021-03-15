;(function () {
  'use strict'
  var h,
    aa = aa || {},
    k = this,
    m = function (a) {
      return void 0 !== a
    },
    ba = function () {},
    ca = function (a) {
      var b = typeof a
      if ('object' == b)
        if (a) {
          if (a instanceof Array) return 'array'
          if (a instanceof Object) return b
          var c = Object.prototype.toString.call(a)
          if ('[object Window]' == c) return 'object'
          if (
            '[object Array]' == c ||
            ('number' == typeof a.length &&
              'undefined' != typeof a.splice &&
              'undefined' != typeof a.propertyIsEnumerable &&
              !a.propertyIsEnumerable('splice'))
          )
            return 'array'
          if (
            '[object Function]' == c ||
            ('undefined' != typeof a.call &&
              'undefined' != typeof a.propertyIsEnumerable &&
              !a.propertyIsEnumerable('call'))
          )
            return 'function'
        } else return 'null'
      else if ('function' == b && 'undefined' == typeof a.call) return 'object'
      return b
    },
    n = function (a) {
      return 'array' == ca(a)
    },
    da = function (a) {
      var b = ca(a)
      return 'array' == b || ('object' == b && 'number' == typeof a.length)
    },
    p = function (a) {
      return 'string' == typeof a
    },
    ea = function (a) {
      return 'number' == typeof a
    },
    q = function (a) {
      return 'function' == ca(a)
    },
    r = function (a) {
      var b = typeof a
      return ('object' == b && null != a) || 'function' == b
    },
    fa = function (a, b, c) {
      return a.call.apply(a.bind, arguments)
    },
    ga = function (a, b, c) {
      if (!a) throw Error()
      if (2 < arguments.length) {
        var d = Array.prototype.slice.call(arguments, 2)
        return function () {
          var c = Array.prototype.slice.call(arguments)
          Array.prototype.unshift.apply(c, d)
          return a.apply(b, c)
        }
      }
      return function () {
        return a.apply(b, arguments)
      }
    },
    t = function (a, b, c) {
      t =
        Function.prototype.bind &&
        -1 != Function.prototype.bind.toString().indexOf('native code')
          ? fa
          : ga
      return t.apply(null, arguments)
    },
    ha = function (a, b) {
      var c = Array.prototype.slice.call(arguments, 1)
      return function () {
        var b = c.slice()
        b.push.apply(b, arguments)
        return a.apply(this, b)
      }
    },
    u =
      Date.now ||
      function () {
        return +new Date()
      },
    v = function (a, b) {
      var c = a.split('.'),
        d = k
      c[0] in d || !d.execScript || d.execScript('var ' + c[0])
      for (var e; c.length && (e = c.shift()); )
        !c.length && m(b) ? (d[e] = b) : (d = d[e] ? d[e] : (d[e] = {}))
    },
    w = function (a, b) {
      function c() {}
      c.prototype = b.prototype
      a.W = b.prototype
      a.prototype = new c()
      a.re = function (a, c, f) {
        for (
          var g = Array(arguments.length - 2), l = 2;
          l < arguments.length;
          l++
        )
          g[l - 2] = arguments[l]
        return b.prototype[c].apply(a, g)
      }
    }
  var y = function (a) {
    if (Error.captureStackTrace) Error.captureStackTrace(this, y)
    else {
      var b = Error().stack
      b && (this.stack = b)
    }
    a && (this.message = String(a))
  }
  w(y, Error)
  y.prototype.name = 'CustomError'
  var ia = String.prototype.trim
      ? function (a) {
          return a.trim()
        }
      : function (a) {
          return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '')
        },
    ja = String.prototype.repeat
      ? function (a, b) {
          return a.repeat(b)
        }
      : function (a, b) {
          return Array(b + 1).join(a)
        },
    ka = function (a, b) {
      return a < b ? -1 : a > b ? 1 : 0
    }
  var la = Array.prototype.indexOf
      ? function (a, b, c) {
          return Array.prototype.indexOf.call(a, b, c)
        }
      : function (a, b, c) {
          c = null == c ? 0 : 0 > c ? Math.max(0, a.length + c) : c
          if (p(a)) return p(b) && 1 == b.length ? a.indexOf(b, c) : -1
          for (; c < a.length; c++) if (c in a && a[c] === b) return c
          return -1
        },
    ma = Array.prototype.forEach
      ? function (a, b, c) {
          Array.prototype.forEach.call(a, b, c)
        }
      : function (a, b, c) {
          for (var d = a.length, e = p(a) ? a.split('') : a, f = 0; f < d; f++)
            f in e && b.call(c, e[f], f, a)
        },
    na = Array.prototype.some
      ? function (a, b, c) {
          return Array.prototype.some.call(a, b, c)
        }
      : function (a, b, c) {
          for (var d = a.length, e = p(a) ? a.split('') : a, f = 0; f < d; f++)
            if (f in e && b.call(c, e[f], f, a)) return !0
          return !1
        },
    oa = Array.prototype.every
      ? function (a, b, c) {
          return Array.prototype.every.call(a, b, c)
        }
      : function (a, b, c) {
          for (var d = a.length, e = p(a) ? a.split('') : a, f = 0; f < d; f++)
            if (f in e && !b.call(c, e[f], f, a)) return !1
          return !0
        },
    qa = function (a) {
      var b
      a: {
        b = pa
        for (var c = a.length, d = p(a) ? a.split('') : a, e = 0; e < c; e++)
          if (e in d && b.call(void 0, d[e], e, a)) {
            b = e
            break a
          }
        b = -1
      }
      return 0 > b ? null : p(a) ? a.charAt(b) : a[b]
    },
    ra = function (a, b) {
      var c = la(a, b),
        d
      ;(d = 0 <= c) && Array.prototype.splice.call(a, c, 1)
      return d
    },
    sa = function (a) {
      return Array.prototype.concat.apply(Array.prototype, arguments)
    },
    ta = function (a, b, c) {
      return 2 >= arguments.length
        ? Array.prototype.slice.call(a, b)
        : Array.prototype.slice.call(a, b, c)
    }
  var ua =
      'StopIteration' in k
        ? k.StopIteration
        : { message: 'StopIteration', stack: '' },
    va = function () {}
  va.prototype.next = function () {
    throw ua
  }
  va.prototype.Yb = function () {
    return this
  }
  var wa = function (a, b, c) {
      for (var d in a) b.call(c, a[d], d, a)
    },
    xa = function (a) {
      var b = [],
        c = 0,
        d
      for (d in a) b[c++] = a[d]
      return b
    },
    ya = function (a) {
      var b = [],
        c = 0,
        d
      for (d in a) b[c++] = d
      return b
    },
    za = function (a) {
      return null !== a && 'withCredentials' in a
    },
    Aa = function (a, b) {
      var c
      a: {
        for (c in a) if (b.call(void 0, a[c], c, a)) break a
        c = void 0
      }
      return c && a[c]
    },
    Ba = 'constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf'.split(
      ' '
    ),
    Ca = function (a, b) {
      for (var c, d, e = 1; e < arguments.length; e++) {
        d = arguments[e]
        for (c in d) a[c] = d[c]
        for (var f = 0; f < Ba.length; f++)
          (c = Ba[f]),
            Object.prototype.hasOwnProperty.call(d, c) && (a[c] = d[c])
      }
    }
  var z = function (a, b) {
    this.B = {}
    this.b = []
    this.Qa = this.g = 0
    var c = arguments.length
    if (1 < c) {
      if (c % 2) throw Error('Uneven number of arguments')
      for (var d = 0; d < c; d += 2) this.set(arguments[d], arguments[d + 1])
    } else a && this.addAll(a)
  }
  z.prototype.v = function () {
    Da(this)
    for (var a = [], b = 0; b < this.b.length; b++) a.push(this.B[this.b[b]])
    return a
  }
  z.prototype.L = function () {
    Da(this)
    return this.b.concat()
  }
  z.prototype.$ = function (a) {
    return A(this.B, a)
  }
  z.prototype.remove = function (a) {
    return A(this.B, a)
      ? (delete this.B[a],
        this.g--,
        this.Qa++,
        this.b.length > 2 * this.g && Da(this),
        !0)
      : !1
  }
  var Da = function (a) {
    if (a.g != a.b.length) {
      for (var b = 0, c = 0; b < a.b.length; ) {
        var d = a.b[b]
        A(a.B, d) && (a.b[c++] = d)
        b++
      }
      a.b.length = c
    }
    if (a.g != a.b.length) {
      for (var e = {}, c = (b = 0); b < a.b.length; )
        (d = a.b[b]), A(e, d) || ((a.b[c++] = d), (e[d] = 1)), b++
      a.b.length = c
    }
  }
  h = z.prototype
  h.get = function (a, b) {
    return A(this.B, a) ? this.B[a] : b
  }
  h.set = function (a, b) {
    A(this.B, a) || (this.g++, this.b.push(a), this.Qa++)
    this.B[a] = b
  }
  h.addAll = function (a) {
    var b
    a instanceof z ? ((b = a.L()), (a = a.v())) : ((b = ya(a)), (a = xa(a)))
    for (var c = 0; c < b.length; c++) this.set(b[c], a[c])
  }
  h.forEach = function (a, b) {
    for (var c = this.L(), d = 0; d < c.length; d++) {
      var e = c[d],
        f = this.get(e)
      a.call(b, f, e, this)
    }
  }
  h.clone = function () {
    return new z(this)
  }
  h.Ub = function () {
    Da(this)
    for (var a = {}, b = 0; b < this.b.length; b++) {
      var c = this.b[b]
      a[c] = this.B[c]
    }
    return a
  }
  h.Yb = function (a) {
    Da(this)
    var b = 0,
      c = this.Qa,
      d = this,
      e = new va()
    e.next = function () {
      if (c != d.Qa)
        throw Error('The map has changed since the iterator was created')
      if (b >= d.b.length) throw ua
      var e = d.b[b++]
      return a ? e : d.B[e]
    }
    return e
  }
  var A = function (a, b) {
    return Object.prototype.hasOwnProperty.call(a, b)
  }
  var Ea,
    Fa,
    Ga = {
      id: 'hitType',
      name: 't',
      valueType: 'text',
      maxLength: void 0,
      defaultValue: void 0,
    },
    Ha = {
      id: 'sessionControl',
      name: 'sc',
      valueType: 'text',
      maxLength: void 0,
      defaultValue: void 0,
    },
    Ia = {
      id: 'description',
      name: 'cd',
      valueType: 'text',
      maxLength: 2048,
      defaultValue: void 0,
    },
    Ja = {
      id: 'eventCategory',
      name: 'ec',
      valueType: 'text',
      maxLength: 150,
      defaultValue: void 0,
    },
    Ka = {
      id: 'eventAction',
      name: 'ea',
      valueType: 'text',
      maxLength: 500,
      defaultValue: void 0,
    },
    La = {
      id: 'eventLabel',
      name: 'el',
      valueType: 'text',
      maxLength: 500,
      defaultValue: void 0,
    },
    Ma = {
      id: 'eventValue',
      name: 'ev',
      valueType: 'integer',
      maxLength: void 0,
      defaultValue: void 0,
    },
    Na = {
      Id: Ga,
      Xb: {
        id: 'anonymizeIp',
        name: 'aip',
        valueType: 'boolean',
        maxLength: void 0,
        defaultValue: void 0,
      },
      Td: {
        id: 'queueTime',
        name: 'qt',
        valueType: 'integer',
        maxLength: void 0,
        defaultValue: void 0,
      },
      pd: {
        id: 'cacheBuster',
        name: 'z',
        valueType: 'text',
        maxLength: void 0,
        defaultValue: void 0,
      },
      Zd: Ha,
      $d: {
        id: 'sessionGroup',
        name: 'sg',
        valueType: 'text',
        maxLength: void 0,
        defaultValue: void 0,
      },
      pe: {
        id: 'userId',
        name: 'uid',
        valueType: 'text',
        maxLength: void 0,
        defaultValue: void 0,
      },
      Qd: {
        id: 'nonInteraction',
        name: 'ni',
        valueType: 'boolean',
        maxLength: void 0,
        defaultValue: void 0,
      },
      zd: Ia,
      ie: {
        id: 'title',
        name: 'dt',
        valueType: 'text',
        maxLength: 1500,
        defaultValue: void 0,
      },
      ld: {
        id: 'appId',
        name: 'aid',
        valueType: 'text',
        maxLength: 150,
        defaultValue: void 0,
      },
      md: {
        id: 'appInstallerId',
        name: 'aiid',
        valueType: 'text',
        maxLength: 150,
        defaultValue: void 0,
      },
      Cd: Ja,
      Bd: Ka,
      Dd: La,
      Ed: Ma,
      be: {
        id: 'socialNetwork',
        name: 'sn',
        valueType: 'text',
        maxLength: 50,
        defaultValue: void 0,
      },
      ae: {
        id: 'socialAction',
        name: 'sa',
        valueType: 'text',
        maxLength: 50,
        defaultValue: void 0,
      },
      ce: {
        id: 'socialTarget',
        name: 'st',
        valueType: 'text',
        maxLength: 2048,
        defaultValue: void 0,
      },
      le: {
        id: 'transactionId',
        name: 'ti',
        valueType: 'text',
        maxLength: 500,
        defaultValue: void 0,
      },
      ke: {
        id: 'transactionAffiliation',
        name: 'ta',
        valueType: 'text',
        maxLength: 500,
        defaultValue: void 0,
      },
      me: {
        id: 'transactionRevenue',
        name: 'tr',
        valueType: 'currency',
        maxLength: void 0,
        defaultValue: void 0,
      },
      ne: {
        id: 'transactionShipping',
        name: 'ts',
        valueType: 'currency',
        maxLength: void 0,
        defaultValue: void 0,
      },
      oe: {
        id: 'transactionTax',
        name: 'tt',
        valueType: 'currency',
        maxLength: void 0,
        defaultValue: void 0,
      },
      xd: {
        id: 'currencyCode',
        name: 'cu',
        valueType: 'text',
        maxLength: 10,
        defaultValue: void 0,
      },
      Md: {
        id: 'itemPrice',
        name: 'ip',
        valueType: 'currency',
        maxLength: void 0,
        defaultValue: void 0,
      },
      Nd: {
        id: 'itemQuantity',
        name: 'iq',
        valueType: 'integer',
        maxLength: void 0,
        defaultValue: void 0,
      },
      Kd: {
        id: 'itemCode',
        name: 'ic',
        valueType: 'text',
        maxLength: 500,
        defaultValue: void 0,
      },
      Ld: {
        id: 'itemName',
        name: 'in',
        valueType: 'text',
        maxLength: 500,
        defaultValue: void 0,
      },
      Jd: {
        id: 'itemCategory',
        name: 'iv',
        valueType: 'text',
        maxLength: 500,
        defaultValue: void 0,
      },
      vd: {
        id: 'campaignSource',
        name: 'cs',
        valueType: 'text',
        maxLength: 100,
        defaultValue: void 0,
      },
      td: {
        id: 'campaignMedium',
        name: 'cm',
        valueType: 'text',
        maxLength: 50,
        defaultValue: void 0,
      },
      ud: {
        id: 'campaignName',
        name: 'cn',
        valueType: 'text',
        maxLength: 100,
        defaultValue: void 0,
      },
      sd: {
        id: 'campaignKeyword',
        name: 'ck',
        valueType: 'text',
        maxLength: 500,
        defaultValue: void 0,
      },
      qd: {
        id: 'campaignContent',
        name: 'cc',
        valueType: 'text',
        maxLength: 500,
        defaultValue: void 0,
      },
      rd: {
        id: 'campaignId',
        name: 'ci',
        valueType: 'text',
        maxLength: 100,
        defaultValue: void 0,
      },
      Hd: {
        id: 'gclid',
        name: 'gclid',
        valueType: 'text',
        maxLength: void 0,
        defaultValue: void 0,
      },
      yd: {
        id: 'dclid',
        name: 'dclid',
        valueType: 'text',
        maxLength: void 0,
        defaultValue: void 0,
      },
      Sd: {
        id: 'pageLoadTime',
        name: 'plt',
        valueType: 'integer',
        maxLength: void 0,
        defaultValue: void 0,
      },
      Ad: {
        id: 'dnsTime',
        name: 'dns',
        valueType: 'integer',
        maxLength: void 0,
        defaultValue: void 0,
      },
      de: {
        id: 'tcpConnectTime',
        name: 'tcp',
        valueType: 'integer',
        maxLength: void 0,
        defaultValue: void 0,
      },
      Yd: {
        id: 'serverResponseTime',
        name: 'srt',
        valueType: 'integer',
        maxLength: void 0,
        defaultValue: void 0,
      },
      Rd: {
        id: 'pageDownloadTime',
        name: 'pdt',
        valueType: 'integer',
        maxLength: void 0,
        defaultValue: void 0,
      },
      Ud: {
        id: 'redirectResponseTime',
        name: 'rrt',
        valueType: 'integer',
        maxLength: void 0,
        defaultValue: void 0,
      },
      ee: {
        id: 'timingCategory',
        name: 'utc',
        valueType: 'text',
        maxLength: 150,
        defaultValue: void 0,
      },
      he: {
        id: 'timingVar',
        name: 'utv',
        valueType: 'text',
        maxLength: 500,
        defaultValue: void 0,
      },
      ge: {
        id: 'timingValue',
        name: 'utt',
        valueType: 'integer',
        maxLength: void 0,
        defaultValue: void 0,
      },
      fe: {
        id: 'timingLabel',
        name: 'utl',
        valueType: 'text',
        maxLength: 500,
        defaultValue: void 0,
      },
      Fd: {
        id: 'exDescription',
        name: 'exd',
        valueType: 'text',
        maxLength: 150,
        defaultValue: void 0,
      },
      Gd: {
        id: 'exFatal',
        name: 'exf',
        valueType: 'boolean',
        maxLength: void 0,
        defaultValue: '1',
      },
    },
    Oa = function (a) {
      if (1 > a || 200 < a)
        throw Error('Expected dimension index range 1-200, but was : ' + a)
      return {
        id: 'dimension' + a,
        name: 'cd' + a,
        valueType: 'text',
        maxLength: 150,
        defaultValue: void 0,
      }
    },
    Pa = function (a) {
      if (1 > a || 200 < a)
        throw Error('Expected metric index range 1-200, but was : ' + a)
      return {
        id: 'metric' + a,
        name: 'cm' + a,
        valueType: 'integer',
        maxLength: void 0,
        defaultValue: void 0,
      }
    }
  var Qa = function (a) {
      if (1 > a) return '0'
      if (3 > a) return '1-2'
      a = Math.floor(Math.log(a - 1) / Math.log(2))
      return Math.pow(2, a) + 1 + '-' + Math.pow(2, a + 1)
    },
    Ra = function (a, b) {
      for (var c = 0, d = a.length - 1, e = 0; c <= d; ) {
        var f = Math.floor((c + d) / 2),
          e = a[f]
        if (b <= e) {
          d = 0 == f ? 0 : a[f - 1]
          if (b > d) return (d + 1).toString() + '-' + e.toString()
          d = f - 1
        } else if (b > e) {
          if (f >= a.length - 1) return (a[a.length - 1] + 1).toString() + '+'
          c = f + 1
        }
      }
      return '<= 0'
    }
  var B = function () {
      this.mb = []
    },
    Sa = function () {
      return new B()
    }
  h = B.prototype
  h.when = function (a) {
    this.mb.push(a)
    return this
  }
  h.Wb = function (a) {
    var b = arguments
    this.when(function (a) {
      return 0 <= la(b, a.Ab())
    })
    return this
  }
  h.hd = function (a, b) {
    var c = ta(arguments, 1)
    this.when(function (b) {
      b = b.ba().get(a)
      return 0 <= la(c, b)
    })
    return this
  }
  h.sb = function (a, b) {
    if (r(this.h)) throw Error('Filter has already been set.')
    this.h = r(b) ? t(a, b) : a
    return this
  }
  h.qa = function () {
    if (0 == this.mb.length)
      throw Error(
        'Must specify at least one predicate using #when or a helper method.'
      )
    if (!r(this.h))
      throw Error('Must specify a delegate filter using #applyFilter.')
    return t(function (a) {
      oa(this.mb, function (b) {
        return b(a)
      }) && this.h(a)
    }, this)
  }
  var C = function () {
    this.rb = !1
    this.Fb = ''
    this.Rb = !1
    this.Ga = null
  }
  C.prototype.cc = function (a) {
    this.rb = !0
    this.Fb = a || ' - '
    return this
  }
  C.prototype.$c = function () {
    this.Rb = !0
    return this
  }
  C.prototype.Kc = function () {
    return Ta(this, Qa)
  }
  C.prototype.Mc = function (a) {
    return Ta(this, ha(Ra, a))
  }
  var Ta = function (a, b) {
    if (null != a.Ga)
      throw Error('LabelerBuilder: Only one labeling strategy may be used.')
    a.Ga = t(function (a) {
      var d = a.ba().get(Ma),
        e = a.ba().get(La)
      ea(d) &&
        ((d = b(d)),
        null != e && this.rb && (d = e + this.Fb + d),
        a.ba().set(La, d))
    }, a)
    return a
  }
  C.prototype.qa = function () {
    if (null == this.Ga)
      throw Error(
        'LabelerBuilder: a labeling strategy must be specified prior to calling build().'
      )
    return Sa()
      .Wb('event')
      .sb(
        t(function (a) {
          this.Ga(a)
          this.Rb && a.ba().remove(Ma)
        }, this)
      )
      .qa()
  }
  var Ua = function (a, b) {
      var c = Array.prototype.slice.call(arguments),
        d = c.shift()
      if ('undefined' == typeof d)
        throw Error('[goog.string.format] Template required')
      return d.replace(/%([0\-\ \+]*)(\d+)?(\.(\d+))?([%sfdiu])/g, function (
        a,
        b,
        d,
        l,
        x,
        M,
        V,
        W
      ) {
        if ('%' == M) return '%'
        var Pb = c.shift()
        if ('undefined' == typeof Pb)
          throw Error('[goog.string.format] Not enough arguments')
        arguments[0] = Pb
        return D[M].apply(null, arguments)
      })
    },
    D = {
      s: function (a, b, c) {
        return isNaN(c) || '' == c || a.length >= Number(c)
          ? a
          : (a =
              -1 < b.indexOf('-', 0)
                ? a + ja(' ', Number(c) - a.length)
                : ja(' ', Number(c) - a.length) + a)
      },
      f: function (a, b, c, d, e) {
        d = a.toString()
        isNaN(e) || '' == e || (d = parseFloat(a).toFixed(e))
        var f
        f =
          0 > Number(a)
            ? '-'
            : 0 <= b.indexOf('+')
            ? '+'
            : 0 <= b.indexOf(' ')
            ? ' '
            : ''
        0 <= Number(a) && (d = f + d)
        if (isNaN(c) || d.length >= Number(c)) return d
        d = isNaN(e)
          ? Math.abs(Number(a)).toString()
          : Math.abs(Number(a)).toFixed(e)
        a = Number(c) - d.length - f.length
        return (d =
          0 <= b.indexOf('-', 0)
            ? f + d + ja(' ', a)
            : f + ja(0 <= b.indexOf('0', 0) ? '0' : ' ', a) + d)
      },
      d: function (a, b, c, d, e, f, g, l) {
        return D.f(parseInt(a, 10), b, c, d, 0, f, g, l)
      },
    }
  D.i = D.d
  D.u = D.d
  var Va = function (a) {
      if (a.v && 'function' == typeof a.v) return a.v()
      if (p(a)) return a.split('')
      if (da(a)) {
        for (var b = [], c = a.length, d = 0; d < c; d++) b.push(a[d])
        return b
      }
      return xa(a)
    },
    Wa = function (a, b) {
      if (a.forEach && 'function' == typeof a.forEach) a.forEach(b, void 0)
      else if (da(a) || p(a)) ma(a, b, void 0)
      else {
        var c
        if (a.L && 'function' == typeof a.L) c = a.L()
        else if (a.v && 'function' == typeof a.v) c = void 0
        else if (da(a) || p(a)) {
          c = []
          for (var d = a.length, e = 0; e < d; e++) c.push(e)
        } else c = ya(a)
        for (var d = Va(a), e = d.length, f = 0; f < e; f++)
          b.call(void 0, d[f], c && c[f], a)
      }
    }
  var E = function (a) {
    this.H = new z()
    if (0 < arguments.length % 2)
      throw Error('Uneven number of arguments to ParameterMap constructor.')
    for (var b = arguments, c = 0; c < b.length; c += 2)
      this.set(b[c], b[c + 1])
  }
  E.prototype.set = function (a, b) {
    if (null == b) throw Error('undefined-or-null value for key: ' + a.name)
    this.H.set(a.name, { key: a, value: b })
  }
  E.prototype.remove = function (a) {
    this.H.remove(a.name)
  }
  E.prototype.get = function (a) {
    a = this.H.get(a.name, null)
    return null === a ? null : a.value
  }
  E.prototype.addAll = function (a) {
    this.H.addAll(a.H)
  }
  var Xa = function (a, b) {
    ma(a.H.v(), function (a) {
      b(a.key, a.value)
    })
  }
  E.prototype.Ub = function () {
    var a = {}
    Xa(this, function (b, c) {
      a[b.id] = c
    })
    return a
  }
  E.prototype.clone = function () {
    var a = new E()
    a.H = this.H.clone()
    return a
  }
  E.prototype.toString = function () {
    var a = {}
    Xa(this, function (b, c) {
      a[b.id] = c
    })
    return JSON.stringify(a)
  }
  var F = function (a) {
    this.h = a
  }
  h = F.prototype
  h.ec = function (a) {
    var b = new F(t(this.U, this))
    b.P = Ja
    b.X = a
    return b
  }
  h.action = function (a) {
    var b = new F(t(this.U, this))
    b.P = Ka
    b.X = a
    return b
  }
  h.label = function (a) {
    var b = new F(t(this.U, this))
    b.P = La
    b.X = a
    return b
  }
  h.value = function (a) {
    var b = new F(t(this.U, this))
    b.P = Ma
    b.X = a
    return b
  }
  h.mc = function (a) {
    var b = new F(t(this.U, this))
    b.P = Oa(a.index)
    b.X = a.value
    return b
  }
  h.Cc = function (a) {
    var b = new F(t(this.U, this))
    b.P = Pa(a.index)
    b.X = a.value
    return b
  }
  h.send = function (a) {
    var b = new E()
    this.U(b)
    return a.send('event', b)
  }
  h.U = function (a) {
    null != this.P &&
      null != this.X &&
      !a.H.$(this.P.name) &&
      a.set(this.P, this.X)
    r(this.h) && this.h(a)
  }
  var Ya = new F(ba)
  var G = function () {
    this.ia = this.ia
    this.Ka = this.Ka
  }
  G.prototype.ia = !1
  G.prototype.ua = function () {
    this.ia || ((this.ia = !0), this.A())
  }
  G.prototype.A = function () {
    if (this.Ka) for (; this.Ka.length; ) this.Ka.shift()()
  }
  var H = function (a, b) {
    this.type = a
    this.currentTarget = this.target = b
    this.defaultPrevented = this.ea = !1
    this.Ob = !0
  }
  H.prototype.preventDefault = function () {
    this.defaultPrevented = !0
    this.Ob = !1
  }
  var Za = function (a) {
    Za[' '](a)
    return a
  }
  Za[' '] = ba
  var I
  a: {
    var $a = k.navigator
    if ($a) {
      var ab = $a.userAgent
      if (ab) {
        I = ab
        break a
      }
    }
    I = ''
  }
  var J = function (a) {
    return -1 != I.indexOf(a)
  }
  var bb = J('Opera') || J('OPR'),
    K = J('Trident') || J('MSIE'),
    cb = J('Edge'),
    db =
      J('Gecko') &&
      !(-1 != I.toLowerCase().indexOf('webkit') && !J('Edge')) &&
      !(J('Trident') || J('MSIE')) &&
      !J('Edge'),
    eb = -1 != I.toLowerCase().indexOf('webkit') && !J('Edge'),
    fb = function () {
      var a = k.document
      return a ? a.documentMode : void 0
    },
    gb
  a: {
    var hb = '',
      ib = (function () {
        var a = I
        if (db) return /rv\:([^\);]+)(\)|;)/.exec(a)
        if (cb) return /Edge\/([\d\.]+)/.exec(a)
        if (K) return /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a)
        if (eb) return /WebKit\/(\S+)/.exec(a)
        if (bb) return /(?:Version)[ \/]?(\S+)/.exec(a)
      })()
    ib && (hb = ib ? ib[1] : '')
    if (K) {
      var jb = fb()
      if (null != jb && jb > parseFloat(hb)) {
        gb = String(jb)
        break a
      }
    }
    gb = hb
  }
  var kb = gb,
    lb = {},
    L = function (a) {
      var b
      if (!(b = lb[a])) {
        b = 0
        for (
          var c = ia(String(kb)).split('.'),
            d = ia(String(a)).split('.'),
            e = Math.max(c.length, d.length),
            f = 0;
          0 == b && f < e;
          f++
        ) {
          var g = c[f] || '',
            l = d[f] || '',
            x = /(\d*)(\D*)/g,
            M = /(\d*)(\D*)/g
          do {
            var V = x.exec(g) || ['', '', ''],
              W = M.exec(l) || ['', '', '']
            if (0 == V[0].length && 0 == W[0].length) break
            b =
              ka(
                0 == V[1].length ? 0 : parseInt(V[1], 10),
                0 == W[1].length ? 0 : parseInt(W[1], 10)
              ) ||
              ka(0 == V[2].length, 0 == W[2].length) ||
              ka(V[2], W[2])
          } while (0 == b)
        }
        b = lb[a] = 0 <= b
      }
      return b
    },
    mb = k.document,
    nb =
      mb && K
        ? fb() || ('CSS1Compat' == mb.compatMode ? parseInt(kb, 10) : 5)
        : void 0
  var ob = !K || 9 <= Number(nb),
    pb = K && !L('9'),
    qb = !eb || L('528'),
    rb =
      (db && L('1.9b')) ||
      (K && L('8')) ||
      (bb && L('9.5')) ||
      (eb && L('528')),
    sb = (db && !L('8')) || (K && !L('9'))
  var tb = function (a, b) {
    H.call(this, a ? a.type : '')
    this.relatedTarget = this.currentTarget = this.target = null
    this.charCode = this.keyCode = this.button = this.screenY = this.screenX = this.clientY = this.clientX = this.offsetY = this.offsetX = 0
    this.metaKey = this.shiftKey = this.altKey = this.ctrlKey = !1
    this.yb = this.state = null
    if (a) {
      var c = (this.type = a.type),
        d = a.changedTouches ? a.changedTouches[0] : null
      this.target = a.target || a.srcElement
      this.currentTarget = b
      var e = a.relatedTarget
      if (e) {
        if (db) {
          var f
          a: {
            try {
              Za(e.nodeName)
              f = !0
              break a
            } catch (g) {}
            f = !1
          }
          f || (e = null)
        }
      } else
        'mouseover' == c
          ? (e = a.fromElement)
          : 'mouseout' == c && (e = a.toElement)
      this.relatedTarget = e
      null === d
        ? ((this.offsetX = eb || void 0 !== a.offsetX ? a.offsetX : a.layerX),
          (this.offsetY = eb || void 0 !== a.offsetY ? a.offsetY : a.layerY),
          (this.clientX = void 0 !== a.clientX ? a.clientX : a.pageX),
          (this.clientY = void 0 !== a.clientY ? a.clientY : a.pageY),
          (this.screenX = a.screenX || 0),
          (this.screenY = a.screenY || 0))
        : ((this.clientX = void 0 !== d.clientX ? d.clientX : d.pageX),
          (this.clientY = void 0 !== d.clientY ? d.clientY : d.pageY),
          (this.screenX = d.screenX || 0),
          (this.screenY = d.screenY || 0))
      this.button = a.button
      this.keyCode = a.keyCode || 0
      this.charCode = a.charCode || ('keypress' == c ? a.keyCode : 0)
      this.ctrlKey = a.ctrlKey
      this.altKey = a.altKey
      this.shiftKey = a.shiftKey
      this.metaKey = a.metaKey
      this.state = a.state
      this.yb = a
      a.defaultPrevented && this.preventDefault()
    }
  }
  w(tb, H)
  tb.prototype.preventDefault = function () {
    tb.W.preventDefault.call(this)
    var a = this.yb
    if (a.preventDefault) a.preventDefault()
    else if (((a.returnValue = !1), pb))
      try {
        if (a.ctrlKey || (112 <= a.keyCode && 123 >= a.keyCode)) a.keyCode = -1
      } catch (b) {}
  }
  var ub = 'closure_listenable_' + ((1e6 * Math.random()) | 0),
    vb = function (a) {
      return !(!a || !a[ub])
    },
    wb = 0
  var xb = function (a, b, c, d, e) {
      this.listener = a
      this.proxy = null
      this.src = b
      this.type = c
      this.sa = !!d
      this.Aa = e
      this.key = ++wb
      this.removed = this.ra = !1
    },
    yb = function (a) {
      a.removed = !0
      a.listener = null
      a.proxy = null
      a.src = null
      a.Aa = null
    }
  var N = function (a) {
    this.src = a
    this.m = {}
    this.na = 0
  }
  N.prototype.add = function (a, b, c, d, e) {
    var f = a.toString()
    a = this.m[f]
    a || ((a = this.m[f] = []), this.na++)
    var g = zb(a, b, d, e)
    ;-1 < g
      ? ((b = a[g]), c || (b.ra = !1))
      : ((b = new xb(b, this.src, f, !!d, e)), (b.ra = c), a.push(b))
    return b
  }
  N.prototype.remove = function (a, b, c, d) {
    a = a.toString()
    if (!(a in this.m)) return !1
    var e = this.m[a]
    b = zb(e, b, c, d)
    return -1 < b
      ? (yb(e[b]),
        Array.prototype.splice.call(e, b, 1),
        0 == e.length && (delete this.m[a], this.na--),
        !0)
      : !1
  }
  var Ab = function (a, b) {
    var c = b.type
    c in a.m &&
      ra(a.m[c], b) &&
      (yb(b), 0 == a.m[c].length && (delete a.m[c], a.na--))
  }
  N.prototype.removeAll = function (a) {
    a = a && a.toString()
    var b = 0,
      c
    for (c in this.m)
      if (!a || c == a) {
        for (var d = this.m[c], e = 0; e < d.length; e++) ++b, yb(d[e])
        delete this.m[c]
        this.na--
      }
    return b
  }
  N.prototype.ja = function (a, b, c, d) {
    a = this.m[a.toString()]
    var e = -1
    a && (e = zb(a, b, c, d))
    return -1 < e ? a[e] : null
  }
  var zb = function (a, b, c, d) {
    for (var e = 0; e < a.length; ++e) {
      var f = a[e]
      if (!f.removed && f.listener == b && f.sa == !!c && f.Aa == d) return e
    }
    return -1
  }
  var Bb = 'closure_lm_' + ((1e6 * Math.random()) | 0),
    Cb = {},
    Db = 0,
    Eb = function (a, b, c, d, e) {
      if (n(b)) {
        for (var f = 0; f < b.length; f++) Eb(a, b[f], c, d, e)
        return null
      }
      c = Fb(c)
      return vb(a) ? a.listen(b, c, d, e) : Gb(a, b, c, !1, d, e)
    },
    Gb = function (a, b, c, d, e, f) {
      if (!b) throw Error('Invalid event type')
      var g = !!e,
        l = Hb(a)
      l || (a[Bb] = l = new N(a))
      c = l.add(b, c, d, e, f)
      if (c.proxy) return c
      d = Ib()
      c.proxy = d
      d.src = a
      d.listener = c
      if (a.addEventListener) a.addEventListener(b.toString(), d, g)
      else if (a.attachEvent) a.attachEvent(Jb(b.toString()), d)
      else throw Error('addEventListener and attachEvent are unavailable.')
      Db++
      return c
    },
    Ib = function () {
      var a = Kb,
        b = ob
          ? function (c) {
              return a.call(b.src, b.listener, c)
            }
          : function (c) {
              c = a.call(b.src, b.listener, c)
              if (!c) return c
            }
      return b
    },
    Lb = function (a, b, c, d, e) {
      if (n(b)) {
        for (var f = 0; f < b.length; f++) Lb(a, b[f], c, d, e)
        return null
      }
      c = Fb(c)
      return vb(a) ? a.jb(b, c, d, e) : Gb(a, b, c, !0, d, e)
    },
    Mb = function (a, b, c, d, e) {
      if (n(b)) for (var f = 0; f < b.length; f++) Mb(a, b[f], c, d, e)
      else
        (c = Fb(c)),
          vb(a)
            ? a.pb(b, c, d, e)
            : a && (a = Hb(a)) && (b = a.ja(b, c, !!d, e)) && Nb(b)
    },
    Nb = function (a) {
      if (!ea(a) && a && !a.removed) {
        var b = a.src
        if (vb(b)) Ab(b.J, a)
        else {
          var c = a.type,
            d = a.proxy
          b.removeEventListener
            ? b.removeEventListener(c, d, a.sa)
            : b.detachEvent && b.detachEvent(Jb(c), d)
          Db--
          ;(c = Hb(b))
            ? (Ab(c, a), 0 == c.na && ((c.src = null), (b[Bb] = null)))
            : yb(a)
        }
      }
    },
    Jb = function (a) {
      return a in Cb ? Cb[a] : (Cb[a] = 'on' + a)
    },
    Qb = function (a, b, c, d) {
      var e = !0
      if ((a = Hb(a)))
        if ((b = a.m[b.toString()]))
          for (b = b.concat(), a = 0; a < b.length; a++) {
            var f = b[a]
            f &&
              f.sa == c &&
              !f.removed &&
              ((f = Ob(f, d)), (e = e && !1 !== f))
          }
      return e
    },
    Ob = function (a, b) {
      var c = a.listener,
        d = a.Aa || a.src
      a.ra && Nb(a)
      return c.call(d, b)
    },
    Kb = function (a, b) {
      if (a.removed) return !0
      if (!ob) {
        var c
        if (!(c = b))
          a: {
            c = ['window', 'event']
            for (var d = k, e; (e = c.shift()); )
              if (null != d[e]) d = d[e]
              else {
                c = null
                break a
              }
            c = d
          }
        e = c
        c = new tb(e, this)
        d = !0
        if (!(0 > e.keyCode || void 0 != e.returnValue)) {
          a: {
            var f = !1
            if (0 == e.keyCode)
              try {
                e.keyCode = -1
                break a
              } catch (x) {
                f = !0
              }
            if (f || void 0 == e.returnValue) e.returnValue = !0
          }
          e = []
          for (f = c.currentTarget; f; f = f.parentNode) e.push(f)
          for (var f = a.type, g = e.length - 1; !c.ea && 0 <= g; g--) {
            c.currentTarget = e[g]
            var l = Qb(e[g], f, !0, c),
              d = d && l
          }
          for (g = 0; !c.ea && g < e.length; g++)
            (c.currentTarget = e[g]), (l = Qb(e[g], f, !1, c)), (d = d && l)
        }
        return d
      }
      return Ob(a, new tb(b, this))
    },
    Hb = function (a) {
      a = a[Bb]
      return a instanceof N ? a : null
    },
    Rb = '__closure_events_fn_' + ((1e9 * Math.random()) >>> 0),
    Fb = function (a) {
      if (q(a)) return a
      a[Rb] ||
        (a[Rb] = function (b) {
          return a.handleEvent(b)
        })
      return a[Rb]
    }
  var O = function () {
    G.call(this)
    this.J = new N(this)
    this.Zb = this
    this.lb = null
  }
  w(O, G)
  O.prototype[ub] = !0
  h = O.prototype
  h.addEventListener = function (a, b, c, d) {
    Eb(this, a, b, c, d)
  }
  h.removeEventListener = function (a, b, c, d) {
    Mb(this, a, b, c, d)
  }
  h.dispatchEvent = function (a) {
    var b,
      c = this.lb
    if (c) {
      b = []
      for (var d = 1; c; c = c.lb) b.push(c), ++d
    }
    c = this.Zb
    d = a.type || a
    if (p(a)) a = new H(a, c)
    else if (a instanceof H) a.target = a.target || c
    else {
      var e = a
      a = new H(d, c)
      Ca(a, e)
    }
    var e = !0,
      f
    if (b)
      for (var g = b.length - 1; !a.ea && 0 <= g; g--)
        (f = a.currentTarget = b[g]), (e = Sb(f, d, !0, a) && e)
    a.ea ||
      ((f = a.currentTarget = c),
      (e = Sb(f, d, !0, a) && e),
      a.ea || (e = Sb(f, d, !1, a) && e))
    if (b)
      for (g = 0; !a.ea && g < b.length; g++)
        (f = a.currentTarget = b[g]), (e = Sb(f, d, !1, a) && e)
    return e
  }
  h.A = function () {
    O.W.A.call(this)
    this.J && this.J.removeAll(void 0)
    this.lb = null
  }
  h.listen = function (a, b, c, d) {
    return this.J.add(String(a), b, !1, c, d)
  }
  h.jb = function (a, b, c, d) {
    return this.J.add(String(a), b, !0, c, d)
  }
  h.pb = function (a, b, c, d) {
    return this.J.remove(String(a), b, c, d)
  }
  var Sb = function (a, b, c, d) {
    b = a.J.m[String(b)]
    if (!b) return !0
    b = b.concat()
    for (var e = !0, f = 0; f < b.length; ++f) {
      var g = b[f]
      if (g && !g.removed && g.sa == c) {
        var l = g.listener,
          x = g.Aa || g.src
        g.ra && Ab(a.J, g)
        e = !1 !== l.call(x, d) && e
      }
    }
    return e && 0 != d.Ob
  }
  O.prototype.ja = function (a, b, c, d) {
    return this.J.ja(String(a), b, c, d)
  }
  var Tb = function (a, b, c) {
    this.Ac = c
    this.kc = a
    this.Oc = b
    this.Ja = 0
    this.Ba = null
  }
  Tb.prototype.get = function () {
    var a
    0 < this.Ja
      ? (this.Ja--, (a = this.Ba), (this.Ba = a.next), (a.next = null))
      : (a = this.kc())
    return a
  }
  Tb.prototype.put = function (a) {
    this.Oc(a)
    this.Ja < this.Ac && (this.Ja++, (a.next = this.Ba), (this.Ba = a))
  }
  var Ub = function (a) {
      k.setTimeout(function () {
        throw a
      }, 0)
    },
    Vb,
    Wb = function () {
      var a = k.MessageChannel
      'undefined' === typeof a &&
        'undefined' !== typeof window &&
        window.postMessage &&
        window.addEventListener &&
        !J('Presto') &&
        (a = function () {
          var a = document.createElement('IFRAME')
          a.style.display = 'none'
          a.src = ''
          document.documentElement.appendChild(a)
          var b = a.contentWindow,
            a = b.document
          a.open()
          a.write('')
          a.close()
          var c = 'callImmediate' + Math.random(),
            d =
              'file:' == b.location.protocol
                ? '*'
                : b.location.protocol + '//' + b.location.host,
            a = t(function (a) {
              if (('*' == d || a.origin == d) && a.data == c)
                this.port1.onmessage()
            }, this)
          b.addEventListener('message', a, !1)
          this.port1 = {}
          this.port2 = {
            postMessage: function () {
              b.postMessage(c, d)
            },
          }
        })
      if ('undefined' !== typeof a && !J('Trident') && !J('MSIE')) {
        var b = new a(),
          c = {},
          d = c
        b.port1.onmessage = function () {
          if (m(c.next)) {
            c = c.next
            var a = c.ub
            c.ub = null
            a()
          }
        }
        return function (a) {
          d.next = { ub: a }
          d = d.next
          b.port2.postMessage(0)
        }
      }
      return 'undefined' !== typeof document &&
        'onreadystatechange' in document.createElement('SCRIPT')
        ? function (a) {
            var b = document.createElement('SCRIPT')
            b.onreadystatechange = function () {
              b.onreadystatechange = null
              b.parentNode.removeChild(b)
              b = null
              a()
              a = null
            }
            document.documentElement.appendChild(b)
          }
        : function (a) {
            k.setTimeout(a, 0)
          }
    }
  var Xb = function () {
      this.Ra = this.ga = null
    },
    Zb = new Tb(
      function () {
        return new Yb()
      },
      function (a) {
        a.reset()
      },
      100
    )
  Xb.prototype.add = function (a, b) {
    var c = Zb.get()
    c.set(a, b)
    this.Ra ? (this.Ra.next = c) : (this.ga = c)
    this.Ra = c
  }
  Xb.prototype.remove = function () {
    var a = null
    this.ga &&
      ((a = this.ga),
      (this.ga = this.ga.next),
      this.ga || (this.Ra = null),
      (a.next = null))
    return a
  }
  var Yb = function () {
    this.next = this.scope = this.bb = null
  }
  Yb.prototype.set = function (a, b) {
    this.bb = a
    this.scope = b
    this.next = null
  }
  Yb.prototype.reset = function () {
    this.next = this.scope = this.bb = null
  }
  var dc = function (a, b) {
      $b || ac()
      bc || ($b(), (bc = !0))
      cc.add(a, b)
    },
    $b,
    ac = function () {
      if (k.Promise && k.Promise.resolve) {
        var a = k.Promise.resolve(void 0)
        $b = function () {
          a.then(ec)
        }
      } else
        $b = function () {
          var a = ec
          !q(k.setImmediate) ||
          (k.Window &&
            k.Window.prototype &&
            !J('Edge') &&
            k.Window.prototype.setImmediate == k.setImmediate)
            ? (Vb || (Vb = Wb()), Vb(a))
            : k.setImmediate(a)
        }
    },
    bc = !1,
    cc = new Xb(),
    ec = function () {
      for (var a = null; (a = cc.remove()); ) {
        try {
          a.bb.call(a.scope)
        } catch (b) {
          Ub(b)
        }
        Zb.put(a)
      }
      bc = !1
    }
  var fc = function (a) {
      a.prototype.then = a.prototype.then
      a.prototype.$goog_Thenable = !0
    },
    gc = function (a) {
      if (!a) return !1
      try {
        return !!a.$goog_Thenable
      } catch (b) {
        return !1
      }
    }
  var P = function (a, b) {
      this.C = 0
      this.M = void 0
      this.Z = this.O = this.o = null
      this.za = this.ab = !1
      if (a != ba)
        try {
          var c = this
          a.call(
            b,
            function (a) {
              hc(c, 2, a)
            },
            function (a) {
              hc(c, 3, a)
            }
          )
        } catch (d) {
          hc(this, 3, d)
        }
    },
    ic = function () {
      this.next = this.context = this.ca = this.la = this.T = null
      this.pa = !1
    }
  ic.prototype.reset = function () {
    this.context = this.ca = this.la = this.T = null
    this.pa = !1
  }
  var jc = new Tb(
      function () {
        return new ic()
      },
      function (a) {
        a.reset()
      },
      100
    ),
    kc = function (a, b, c) {
      var d = jc.get()
      d.la = a
      d.ca = b
      d.context = c
      return d
    }
  P.prototype.then = function (a, b, c) {
    return lc(this, q(a) ? a : null, q(b) ? b : null, c)
  }
  fc(P)
  P.prototype.cancel = function (a) {
    0 == this.C &&
      dc(function () {
        var b = new mc(a)
        nc(this, b)
      }, this)
  }
  var nc = function (a, b) {
      if (0 == a.C)
        if (a.o) {
          var c = a.o
          if (c.O) {
            for (
              var d = 0, e = null, f = null, g = c.O;
              g && (g.pa || (d++, g.T == a && (e = g), !(e && 1 < d)));
              g = g.next
            )
              e || (f = g)
            e &&
              (0 == c.C && 1 == d
                ? nc(c, b)
                : (f
                    ? ((d = f),
                      d.next == c.Z && (c.Z = d),
                      (d.next = d.next.next))
                    : oc(c),
                  pc(c, e, 3, b)))
          }
          a.o = null
        } else hc(a, 3, b)
    },
    rc = function (a, b) {
      a.O || (2 != a.C && 3 != a.C) || qc(a)
      a.Z ? (a.Z.next = b) : (a.O = b)
      a.Z = b
    },
    lc = function (a, b, c, d) {
      var e = kc(null, null, null)
      e.T = new P(function (a, g) {
        e.la = b
          ? function (c) {
              try {
                var e = b.call(d, c)
                a(e)
              } catch (M) {
                g(M)
              }
            }
          : a
        e.ca = c
          ? function (b) {
              try {
                var e = c.call(d, b)
                !m(e) && b instanceof mc ? g(b) : a(e)
              } catch (M) {
                g(M)
              }
            }
          : g
      })
      e.T.o = a
      rc(a, e)
      return e.T
    }
  P.prototype.ed = function (a) {
    this.C = 0
    hc(this, 2, a)
  }
  P.prototype.fd = function (a) {
    this.C = 0
    hc(this, 3, a)
  }
  var hc = function (a, b, c) {
      if (0 == a.C) {
        a == c &&
          ((b = 3), (c = new TypeError('Promise cannot resolve to itself')))
        a.C = 1
        var d
        a: {
          var e = c,
            f = a.ed,
            g = a.fd
          if (e instanceof P) rc(e, kc(f || ba, g || null, a)), (d = !0)
          else if (gc(e)) e.then(f, g, a), (d = !0)
          else {
            if (r(e))
              try {
                var l = e.then
                if (q(l)) {
                  sc(e, l, f, g, a)
                  d = !0
                  break a
                }
              } catch (x) {
                g.call(a, x)
                d = !0
                break a
              }
            d = !1
          }
        }
        d ||
          ((a.M = c),
          (a.C = b),
          (a.o = null),
          qc(a),
          3 != b || c instanceof mc || tc(a, c))
      }
    },
    sc = function (a, b, c, d, e) {
      var f = !1,
        g = function (a) {
          f || ((f = !0), c.call(e, a))
        },
        l = function (a) {
          f || ((f = !0), d.call(e, a))
        }
      try {
        b.call(a, g, l)
      } catch (x) {
        l(x)
      }
    },
    qc = function (a) {
      a.ab || ((a.ab = !0), dc(a.nc, a))
    },
    oc = function (a) {
      var b = null
      a.O && ((b = a.O), (a.O = b.next), (b.next = null))
      a.O || (a.Z = null)
      return b
    }
  P.prototype.nc = function () {
    for (var a = null; (a = oc(this)); ) pc(this, a, this.C, this.M)
    this.ab = !1
  }
  var pc = function (a, b, c, d) {
      if (3 == c && b.ca && !b.pa) for (; a && a.za; a = a.o) a.za = !1
      if (b.T) (b.T.o = null), uc(b, c, d)
      else
        try {
          b.pa ? b.la.call(b.context) : uc(b, c, d)
        } catch (e) {
          vc.call(null, e)
        }
      jc.put(b)
    },
    uc = function (a, b, c) {
      2 == b ? a.la.call(a.context, c) : a.ca && a.ca.call(a.context, c)
    },
    tc = function (a, b) {
      a.za = !0
      dc(function () {
        a.za && vc.call(null, b)
      })
    },
    vc = Ub,
    mc = function (a) {
      y.call(this, a)
    }
  w(mc, y)
  mc.prototype.name =
    'cancel' /*
 Portions of this code are from MochiKit, received by
 The Closure Authors under the MIT license. All other code is Copyright
 2005-2009 The Closure Authors. All Rights Reserved.
*/
  var Q = function (a, b) {
    this.Ma = []
    this.Ib = a
    this.xb = b || null
    this.ka = this.K = !1
    this.M = void 0
    this.nb = this.dc = this.Ua = !1
    this.Pa = 0
    this.o = null
    this.Wa = 0
  }
  Q.prototype.cancel = function (a) {
    if (this.K) this.M instanceof Q && this.M.cancel()
    else {
      if (this.o) {
        var b = this.o
        delete this.o
        a ? b.cancel(a) : (b.Wa--, 0 >= b.Wa && b.cancel())
      }
      this.Ib ? this.Ib.call(this.xb, this) : (this.nb = !0)
      this.K || this.I(new wc())
    }
  }
  Q.prototype.wb = function (a, b) {
    this.Ua = !1
    xc(this, a, b)
  }
  var xc = function (a, b, c) {
      a.K = !0
      a.M = c
      a.ka = !b
      yc(a)
    },
    Ac = function (a) {
      if (a.K) {
        if (!a.nb) throw new zc()
        a.nb = !1
      }
    }
  Q.prototype.G = function (a) {
    Ac(this)
    xc(this, !0, a)
  }
  Q.prototype.I = function (a) {
    Ac(this)
    xc(this, !1, a)
  }
  Q.prototype.w = function (a, b) {
    return Bc(this, a, null, b)
  }
  var Bc = function (a, b, c, d) {
    a.Ma.push([b, c, d])
    a.K && yc(a)
    return a
  }
  Q.prototype.then = function (a, b, c) {
    var d,
      e,
      f = new P(function (a, b) {
        d = a
        e = b
      })
    Bc(this, d, function (a) {
      a instanceof wc ? f.cancel() : e(a)
    })
    return f.then(a, b, c)
  }
  fc(Q)
  var Cc = function (a) {
      var b = new Q()
      Bc(a, b.G, b.I, b)
      return b
    },
    Dc = function (a) {
      return na(a.Ma, function (a) {
        return q(a[1])
      })
    },
    yc = function (a) {
      if (a.Pa && a.K && Dc(a)) {
        var b = a.Pa,
          c = Ec[b]
        c && (k.clearTimeout(c.Ca), delete Ec[b])
        a.Pa = 0
      }
      a.o && (a.o.Wa--, delete a.o)
      for (var b = a.M, d = (c = !1); a.Ma.length && !a.Ua; ) {
        var e = a.Ma.shift(),
          f = e[0],
          g = e[1],
          e = e[2]
        if ((f = a.ka ? g : f))
          try {
            var l = f.call(e || a.xb, b)
            m(l) &&
              ((a.ka = a.ka && (l == b || l instanceof Error)), (a.M = b = l))
            if (
              gc(b) ||
              ('function' === typeof k.Promise && b instanceof k.Promise)
            )
              (d = !0), (a.Ua = !0)
          } catch (x) {
            ;(b = x), (a.ka = !0), Dc(a) || (c = !0)
          }
      }
      a.M = b
      d &&
        ((l = t(a.wb, a, !0)),
        (d = t(a.wb, a, !1)),
        b instanceof Q ? (Bc(b, l, d), (b.dc = !0)) : b.then(l, d))
      c && ((b = new Fc(b)), (Ec[b.Ca] = b), (a.Pa = b.Ca))
    },
    Gc = function (a) {
      var b = new Q()
      b.G(a)
      return b
    },
    Ic = function () {
      var a = Hc,
        b = new Q()
      b.I(a)
      return b
    },
    zc = function () {
      y.call(this)
    }
  w(zc, y)
  zc.prototype.message = 'Deferred has already fired'
  zc.prototype.name = 'AlreadyCalledError'
  var wc = function () {
    y.call(this)
  }
  w(wc, y)
  wc.prototype.message = 'Deferred was canceled'
  wc.prototype.name = 'CanceledError'
  var Fc = function (a) {
    this.Ca = k.setTimeout(t(this.ad, this), 0)
    this.va = a
  }
  Fc.prototype.ad = function () {
    delete Ec[this.Ca]
    throw this.va
  }
  var Ec = {}
  var Jc = function (a) {
    this.ya = []
    this.h = a
  }
  Jc.prototype.Y = function (a) {
    if (!q(a)) throw Error('Invalid filter. Must be a function.')
    this.ya.push(a)
  }
  Jc.prototype.send = function (a, b) {
    if (0 == this.ya.length) return this.h.send(a, b)
    var c = new R(a, b)
    return Kc(this, 0, c).w(function () {
      if (!c.Ya) return this.h.send(a, b)
    }, this)
  }
  var Kc = function (a, b, c) {
      return Gc()
        .w(function () {
          return this.ya[b](c)
        }, a)
        .w(function () {
          if (++b < this.ya.length && !c.Ya) return Kc(this, b, c)
        }, a)
    },
    R = function (a, b) {
      this.dd = a
      this.Jc = b
      this.Ya = !1
    }
  R.prototype.Ab = function () {
    return this.dd
  }
  R.prototype.ba = function () {
    return this.Jc
  }
  R.prototype.cancel = function () {
    this.Ya = !0
  }
  var Lc = function (a, b) {
    this.width = a
    this.height = b
  }
  Lc.prototype.clone = function () {
    return new Lc(this.width, this.height)
  }
  Lc.prototype.floor = function () {
    this.width = Math.floor(this.width)
    this.height = Math.floor(this.height)
    return this
  }
  ;(!db && !K) || (K && 9 <= Number(nb)) || (db && L('1.9.1'))
  K && L('9')
  var Mc = {
      id: 'anonymizeIp',
      name: 'aip',
      valueType: 'boolean',
      maxLength: void 0,
      defaultValue: void 0,
    },
    Nc = {
      id: 'apiVersion',
      name: 'v',
      valueType: 'text',
      maxLength: void 0,
      defaultValue: void 0,
    },
    Oc = {
      id: 'appName',
      name: 'an',
      valueType: 'text',
      maxLength: 100,
      defaultValue: void 0,
    },
    Pc = {
      id: 'appVersion',
      name: 'av',
      valueType: 'text',
      maxLength: 100,
      defaultValue: void 0,
    },
    Qc = {
      id: 'clientId',
      name: 'cid',
      valueType: 'text',
      maxLength: void 0,
      defaultValue: void 0,
    },
    Rc = {
      id: 'language',
      name: 'ul',
      valueType: 'text',
      maxLength: 20,
      defaultValue: void 0,
    },
    Sc = {
      id: 'libVersion',
      name: '_v',
      valueType: 'text',
      maxLength: void 0,
      defaultValue: void 0,
    },
    Tc = {
      id: 'sampleRateOverride',
      name: 'usro',
      valueType: 'integer',
      maxLength: void 0,
      defaultValue: void 0,
    },
    Uc = {
      id: 'screenColors',
      name: 'sd',
      valueType: 'text',
      maxLength: 20,
      defaultValue: void 0,
    },
    Vc = {
      id: 'screenResolution',
      name: 'sr',
      valueType: 'text',
      maxLength: 20,
      defaultValue: void 0,
    },
    Wc = {
      id: 'trackingId',
      name: 'tid',
      valueType: 'text',
      maxLength: void 0,
      defaultValue: void 0,
    },
    Xc = {
      id: 'viewportSize',
      name: 'vp',
      valueType: 'text',
      maxLength: 20,
      defaultValue: void 0,
    },
    Yc = {
      Xb: Mc,
      kd: Nc,
      nd: Oc,
      od: Pc,
      wd: Qc,
      Od: Rc,
      Pd: Sc,
      Vd: Tc,
      Wd: Uc,
      Xd: Vc,
      je: Wc,
      qe: Xc,
    },
    $c = function (a) {
      if (!p(a)) return a
      var b = Zc(a, Na)
      if (r(b)) return b
      b = Zc(a, Yc)
      if (r(b)) return b
      b = /^dimension(\d+)$/.exec(a)
      if (null !== b) return Oa(parseInt(b[1], 10))
      b = /^metric(\d+)$/.exec(a)
      if (null !== b) return Pa(parseInt(b[1], 10))
      throw Error(a + ' is not a valid parameter name.')
    },
    Zc = function (a, b) {
      var c = Aa(b, function (b) {
        return b.id == a && 'metric' != a && 'dimension' != a
      })
      return r(c) ? c : null
    }
  var S = function (a, b) {
    this.hc = b
    this.D = b.cb()
    this.Mb = new E()
    this.$b = this.ob = !1
  }
  h = S.prototype
  h.set = function (a, b) {
    if (null == b)
      throw Error('Value must be defined and not null. Parameter=' + a.id)
    var c = $c(a)
    this.Mb.set(c, b)
  }
  h.Y = function (a) {
    this.hc.Y(a)
  }
  h.send = function (a, b) {
    if (a instanceof F) return a.send(this)
    var c = this.Mb.clone()
    b instanceof E
      ? c.addAll(b)
      : r(b) &&
        wa(
          b,
          function (a, b) {
            null != a && c.set($c(b), a)
          },
          this
        )
    this.ob && ((this.ob = !1), c.set(Ha, 'start'))
    this.$b && c.set(Mc, !0)
    return this.D.send(a, c)
  }
  h.Pc = function (a) {
    var b = { description: a }
    this.set(Ia, a)
    return this.send('appview', b)
  }
  h.Qc = function (a, b, c, d) {
    return this.send('event', {
      eventCategory: a,
      eventAction: b,
      eventLabel: c,
      eventValue: d,
    })
  }
  h.Sc = function (a, b, c) {
    return this.send('social', {
      socialNetwork: a,
      socialAction: b,
      socialTarget: c,
    })
  }
  h.Rc = function (a, b) {
    return this.send('exception', { exDescription: a, exFatal: b })
  }
  h.Pb = function (a, b, c, d, e) {
    return this.send('timing', {
      timingCategory: a,
      timingVar: b,
      timingLabel: d,
      timingValue: c,
      sampleRateOverride: e,
    })
  }
  h.qc = function () {
    this.ob = !0
  }
  h.Zc = function (a, b, c, d) {
    return new ad(this, a, b, c, d)
  }
  var ad = function (a, b, c, d, e) {
    this.Vb = a
    this.fc = b
    this.gd = c
    this.yc = d
    this.La = e
    this.Yc = u()
  }
  ad.prototype.send = function () {
    var a = this.Vb.Pb(this.fc, this.gd, u() - this.Yc, this.yc, this.La)
    this.Vb = null
    return a
  }
  var bd = function (a, b, c, d, e) {
    this.zc = a
    this.ac = b
    this.bc = c
    this.j = d
    this.gc = e
  }
  bd.prototype.tc = function (a) {
    var b = new S(0, this.gc.create())
    b.set(Sc, this.zc)
    b.set(Nc, 1)
    b.set(Oc, this.ac)
    b.set(Pc, this.bc)
    b.set(Wc, a)
    ;(a = navigator.language || navigator.browserLanguage) && b.set(Rc, a)
    ;(a = screen.colorDepth + '-bit') && b.set(Uc, a)
    ;(a = [screen.width, screen.height].join('x')) && b.set(Vc, a)
    a = window.document
    a = 'CSS1Compat' == a.compatMode ? a.documentElement : a.body
    a = new Lc(a.clientWidth, a.clientHeight)
    ;(a = [a.width, a.height].join('x')) && b.set(Xc, a)
    return b
  }
  bd.prototype.rc = function () {
    return Cc(this.j.ma)
  }
  var cd = function (a, b, c, d, e, f) {
    Q.call(this, e, f)
    this.ib = a
    this.Za = []
    this.zb = !!b
    this.pc = !!c
    this.jc = !!d
    for (b = this.Hb = 0; b < a.length; b++)
      Bc(a[b], t(this.Bb, this, b, !0), t(this.Bb, this, b, !1))
    0 != a.length || this.zb || this.G(this.Za)
  }
  w(cd, Q)
  cd.prototype.Bb = function (a, b, c) {
    this.Hb++
    this.Za[a] = [b, c]
    this.K ||
      (this.zb && b
        ? this.G([a, c])
        : this.pc && !b
        ? this.I(c)
        : this.Hb == this.ib.length && this.G(this.Za))
    this.jc && !b && (c = null)
    return c
  }
  cd.prototype.I = function (a) {
    cd.W.I.call(this, a)
    for (a = 0; a < this.ib.length; a++) this.ib[a].cancel()
  }
  var dd = function (a) {
    return new cd(a, !1, !0).w(function (a) {
      for (var c = [], d = 0; d < a.length; d++) c[d] = a[d][1]
      return c
    })
  }
  var ed = function () {
    for (
      var a = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.split(''),
        b = 0,
        c = a.length;
      b < c;
      b++
    )
      switch (a[b]) {
        case 'x':
          a[b] = Math.floor(16 * Math.random()).toString(16)
          break
        case 'y':
          a[b] = (Math.floor(4 * Math.random()) + 8).toString(16)
      }
    return a.join('')
  }
  var T = function (a) {
      this.R = a
      this.La = 100
      this.vb = []
      this.da = this.oa = null
      this.ma = fd(this)
      this.ma.w(function () {
        this.Qb = Eb(this.R, 'a', t(this.uc, this))
      }, this)
    },
    fd = function (a) {
      return gd(a).w(function () {
        return this
      }, a)
    },
    gd = function (a) {
      return dd([hd(a), id(a)])
    }
  T.prototype.uc = function () {
    U(this)
    var a = jd(this),
      b = this.Fa()
    gd(this).w(function () {
      a != jd(this) && kd(this, 'analytics.user-id')
      b != this.Fa() && kd(this, 'analytics.tracking-permitted')
    }, this)
  }
  var ld = function (a, b) {
    U(a)
    a.vb.push(b)
  }
  T.prototype.Wc = function (a) {
    U(this)
    var b = this.da != a
    this.da = a
    this.R.set('analytics.tracking-permitted', a.toString())
    b && kd(this, 'analytics.tracking-permitted')
  }
  T.prototype.Fa = function () {
    U(this)
    var a
    if ((a = this.da)) (a = k._gaUserPrefs), (a = !(a && a.ioo && a.ioo()))
    return a
  }
  var hd = function (a) {
      return a.R.get('analytics.tracking-permitted').w(function (a) {
        this.da = !0
        if (m(a))
          switch (a) {
            case 'true':
              this.da = !0
              break
            case 'false':
              this.da = !1
          }
      }, a)
    },
    jd = function (a) {
      U(a)
      if (!p(a.oa)) throw Error('Invalid state. UserID is not a string.')
      return a.oa
    },
    id = function (a) {
      return a.R.get('analytics.user-id').w(function (a) {
        m(a) ? (this.oa = a) : md(this)
      }, a)
    },
    md = function (a) {
      a.oa = ed()
      return a.R.set('analytics.user-id', a.oa).w(function () {
        kd(this, 'analytics.user-id')
      }, a)
    }
  T.prototype.Vc = function (a) {
    U(this)
    this.La = a
  }
  var nd = function (a) {
    U(a)
    return a.La
  }
  T.prototype.Nc = function () {
    return md(this)
  }
  var kd = function (a, b) {
    ma(a.vb, function (a) {
      a(b)
    })
  }
  T.prototype.ua = function () {
    null != this.Qb && Nb(this.Qb)
  }
  var U = function (a) {
    if (!Cc(a.ma).K)
      throw Error('Settings object accessed prior to entering ready state.')
  }
  var od = function () {
    O.call(this)
    this.kb = 'google-analytics'
    this.R = chrome.storage.local
    chrome.storage.onChanged.addListener(t(this.Hc, this))
  }
  w(od, O)
  od.prototype.Hc = function (a, b) {
    'local' == b && pd(this, a) && this.dispatchEvent('a')
  }
  var pd = function (a, b) {
    return na(
      ya(b),
      function (a) {
        return 0 == a.lastIndexOf(this.kb, 0)
      },
      a
    )
  }
  od.prototype.get = function (a) {
    var b = new Q(),
      c = this.kb + '.' + a
    this.R.get(c, function (a) {
      chrome.runtime.lastError
        ? b.I(chrome.runtime.lastError)
        : ((a = a[c]), b.G(null != a ? a.toString() : void 0))
    })
    return b
  }
  od.prototype.set = function (a, b) {
    var c = new Q(),
      d = {}
    d[this.kb + '.' + a] = b
    this.R.set(d, function () {
      chrome.runtime.lastError ? c.I(chrome.runtime.lastError) : c.G()
    })
    return c
  }
  var X = function () {}
  X.sc = function () {
    return X.Eb ? X.Eb : (X.Eb = new X())
  }
  X.prototype.send = function () {
    return Gc()
  }
  var qd = function (a) {
    this.lc = a
  }
  qd.prototype.send = function (a, b) {
    this.lc.push({ wc: a, Ic: b })
    return Gc()
  }
  var rd = function (a, b, c) {
    this.j = a
    this.aa = []
    this.S = { enabled: new qd(this.aa), disabled: c }
    this.D = this.S.enabled
    Bc(Cc(this.j.ma), ha(this.Gc, b), this.Fc, this)
  }
  rd.prototype.Gc = function (a) {
    if (null === this.aa) throw Error('Channel setup already completed.')
    this.S.enabled = a()
    sd(this)
    ma(
      this.aa,
      function (a) {
        this.send(a.wc, a.Ic)
      },
      this
    )
    this.aa = null
    ld(this.j, t(this.Ec, this))
  }
  rd.prototype.Fc = function () {
    if (null === this.aa) throw Error('Channel setup already completed.')
    this.D = this.S.enabled = this.S.disabled
    this.aa = null
  }
  rd.prototype.send = function (a, b) {
    return this.D.send(a, b)
  }
  var sd = function (a) {
    a.D = a.j.Fa() ? a.S.enabled : a.S.disabled
  }
  rd.prototype.Ec = function (a) {
    switch (a) {
      case 'analytics.tracking-permitted':
        sd(this)
    }
  }
  var td = function (a, b) {
    this.Xa = []
    var c = t(function () {
      this.xa = new Jc(b.cb())
      ma(
        this.Xa,
        function (a) {
          this.xa.Y(a)
        },
        this
      )
      this.Xa = null
      return this.xa
    }, this)
    this.D = new rd(a, c, X.sc())
  }
  td.prototype.cb = function () {
    return this.D
  }
  td.prototype.Y = function (a) {
    this.xa ? this.xa.Y(a) : this.Xa.push(a)
  }
  var ud = function (a, b) {
    this.j = a
    this.Xc = b
  }
  ud.prototype.create = function () {
    return new td(this.j, this.Xc)
  }
  var vd = function (a, b) {
    O.call(this)
    this.Ea = a || 1
    this.fa = b || k
    this.Va = t(this.bd, this)
    this.hb = u()
  }
  w(vd, O)
  h = vd.prototype
  h.enabled = !1
  h.l = null
  h.bd = function () {
    if (this.enabled) {
      var a = u() - this.hb
      0 < a && a < 0.8 * this.Ea
        ? (this.l = this.fa.setTimeout(this.Va, this.Ea - a))
        : (this.l && (this.fa.clearTimeout(this.l), (this.l = null)),
          this.dispatchEvent('tick'),
          this.enabled &&
            ((this.l = this.fa.setTimeout(this.Va, this.Ea)), (this.hb = u())))
    }
  }
  h.start = function () {
    this.enabled = !0
    this.l || ((this.l = this.fa.setTimeout(this.Va, this.Ea)), (this.hb = u()))
  }
  h.stop = function () {
    this.enabled = !1
    this.l && (this.fa.clearTimeout(this.l), (this.l = null))
  }
  h.A = function () {
    vd.W.A.call(this)
    this.stop()
    delete this.fa
  }
  var wd = function (a, b, c) {
    if (q(a)) c && (a = t(a, c))
    else if (a && 'function' == typeof a.handleEvent) a = t(a.handleEvent, a)
    else throw Error('Invalid listener argument')
    return 2147483647 < Number(b) ? -1 : k.setTimeout(a, b || 0)
  }
  var Y = function (a) {
    G.call(this)
    this.eb = a
    this.b = {}
  }
  w(Y, G)
  var xd = []
  Y.prototype.listen = function (a, b, c, d) {
    n(b) || (b && (xd[0] = b.toString()), (b = xd))
    for (var e = 0; e < b.length; e++) {
      var f = Eb(a, b[e], c || this.handleEvent, d || !1, this.eb || this)
      if (!f) break
      this.b[f.key] = f
    }
    return this
  }
  Y.prototype.jb = function (a, b, c, d) {
    return yd(this, a, b, c, d)
  }
  var yd = function (a, b, c, d, e, f) {
    if (n(c)) for (var g = 0; g < c.length; g++) yd(a, b, c[g], d, e, f)
    else {
      b = Lb(b, c, d || a.handleEvent, e, f || a.eb || a)
      if (!b) return a
      a.b[b.key] = b
    }
    return a
  }
  Y.prototype.pb = function (a, b, c, d, e) {
    if (n(b)) for (var f = 0; f < b.length; f++) this.pb(a, b[f], c, d, e)
    else
      (c = c || this.handleEvent),
        (e = e || this.eb || this),
        (c = Fb(c)),
        (d = !!d),
        (b = vb(a)
          ? a.ja(b, c, d, e)
          : a
          ? (a = Hb(a))
            ? a.ja(b, c, d, e)
            : null
          : null),
        b && (Nb(b), delete this.b[b.key])
    return this
  }
  Y.prototype.removeAll = function () {
    wa(
      this.b,
      function (a, b) {
        this.b.hasOwnProperty(b) && Nb(a)
      },
      this
    )
    this.b = {}
  }
  Y.prototype.A = function () {
    Y.W.A.call(this)
    this.removeAll()
  }
  Y.prototype.handleEvent = function () {
    throw Error('EventHandler.handleEvent not implemented')
  }
  var zd = function () {
    O.call(this)
    this.wa = new Y(this)
    qb &&
      (rb
        ? this.wa.listen(
            sb ? document.body : window,
            ['online', 'offline'],
            this.Cb
          )
        : ((this.Lb = qb ? navigator.onLine : !0),
          (this.l = new vd(250)),
          this.wa.listen(this.l, 'tick', this.vc),
          this.l.start()))
  }
  w(zd, O)
  zd.prototype.vc = function () {
    var a = qb ? navigator.onLine : !0
    a != this.Lb && ((this.Lb = a), this.Cb())
  }
  zd.prototype.Cb = function () {
    this.dispatchEvent((qb ? navigator.onLine : 1) ? 'online' : 'offline')
  }
  zd.prototype.A = function () {
    zd.W.A.call(this)
    this.wa.ua()
    this.wa = null
    this.l && (this.l.ua(), (this.l = null))
  }
  var Ad = function (a, b) {
    this.j = a
    this.h = b
  }
  Ad.prototype.send = function (a, b) {
    b.set(Qc, jd(this.j))
    return this.h.send(a, b)
  }
  var Bd = function (a) {
    this.h = a
  }
  Bd.prototype.send = function (a, b) {
    Cd(b)
    Dd(b)
    return this.h.send(a, b)
  }
  var Cd = function (a) {
      Xa(a, function (b, c) {
        m(b.maxLength) &&
          'text' == b.valueType &&
          0 < b.maxLength &&
          c.length > b.maxLength &&
          a.set(b, c.substring(0, b.maxLength))
      })
    },
    Dd = function (a) {
      Xa(a, function (b, c) {
        m(b.defaultValue) && c == b.defaultValue && a.remove(b)
      })
    }
  var Hc = { status: 'device-offline', ta: void 0 },
    Ed = { status: 'rate-limited', ta: void 0 },
    Fd = { status: 'sampled-out', ta: void 0 },
    Gd = { status: 'sent', ta: void 0 }
  var Hd = function (a, b) {
    this.cd = a
    this.h = b
  }
  Hd.prototype.send = function (a, b) {
    var c
    c = this.cd
    var d = c.Sb(),
      e = Math.floor((d - c.Gb) * c.oc)
    0 < e && ((c.ha = Math.min(c.ha + e, c.Bc)), (c.Gb = d))
    1 > c.ha ? (c = !1) : (--c.ha, (c = !0))
    return c || 'item' == a || 'transaction' == a ? this.h.send(a, b) : Gc(Ed)
  }
  var Id = function () {
    this.ha = 60
    this.Bc = 500
    this.oc = 5e-4
    this.Sb = function () {
      return new Date().getTime()
    }
    this.Gb = this.Sb()
  }
  var Jd = function (a, b) {
    this.j = a
    this.h = b
  }
  Jd.prototype.send = function (a, b) {
    var c = b.get(Qc),
      c = parseInt(c.split('-')[1], 16),
      d
    'timing' != a
      ? (d = nd(this.j))
      : ((d = b.get(Tc)) && b.remove(Tc), (d = d || nd(this.j)))
    return c < 655.36 * d ? this.h.send(a, b) : Gc(Fd)
  }
  var Kd = /^(?:([^:/?#.]+):)?(?:\/\/(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\?([^#]*))?(?:#(.*))?$/,
    Ld = function (a, b) {
      if (a)
        for (var c = a.split('&'), d = 0; d < c.length; d++) {
          var e = c[d].indexOf('='),
            f = null,
            g = null
          0 <= e
            ? ((f = c[d].substring(0, e)), (g = c[d].substring(e + 1)))
            : (f = c[d])
          b(f, g ? decodeURIComponent(g.replace(/\+/g, ' ')) : '')
        }
    }
  var Md = function () {}
  Md.prototype.tb = null
  var Od = function (a) {
    var b
    ;(b = a.tb) ||
      ((b = {}), Nd(a) && ((b[0] = !0), (b[1] = !0)), (b = a.tb = b))
    return b
  }
  var Pd,
    Qd = function () {}
  w(Qd, Md)
  var Rd = function (a) {
      return (a = Nd(a)) ? new ActiveXObject(a) : new XMLHttpRequest()
    },
    Nd = function (a) {
      if (
        !a.Db &&
        'undefined' == typeof XMLHttpRequest &&
        'undefined' != typeof ActiveXObject
      ) {
        for (
          var b = [
              'MSXML2.XMLHTTP.6.0',
              'MSXML2.XMLHTTP.3.0',
              'MSXML2.XMLHTTP',
              'Microsoft.XMLHTTP',
            ],
            c = 0;
          c < b.length;
          c++
        ) {
          var d = b[c]
          try {
            return new ActiveXObject(d), (a.Db = d)
          } catch (e) {}
        }
        throw Error(
          'Could not create ActiveXObject. ActiveX might be disabled, or MSXML might not be installed'
        )
      }
      return a.Db
    }
  Pd = new Qd()
  var Z = function (a) {
    O.call(this)
    this.headers = new z()
    this.Ta = a || null
    this.N = !1
    this.Sa = this.a = null
    this.Ha = this.gb = ''
    this.V = this.fb = this.Da = this.$a = !1
    this.Oa = 0
    this.Na = null
    this.Nb = ''
    this.qb = this.Lc = this.jd = !1
  }
  w(Z, O)
  var Sd = /^https?$/i,
    Td = ['POST', 'PUT'],
    Ud = [],
    Vd = function (a, b, c) {
      var d = new Z()
      Ud.push(d)
      b && d.listen('complete', b)
      d.jb('ready', d.ic)
      d.send(a, 'POST', c, void 0)
    }
  Z.prototype.ic = function () {
    this.ua()
    ra(Ud, this)
  }
  Z.prototype.send = function (a, b, c, d) {
    if (this.a)
      throw Error(
        '[goog.net.XhrIo] Object is active with another request=' +
          this.gb +
          '; newUri=' +
          a
      )
    b = b ? b.toUpperCase() : 'GET'
    this.gb = a
    this.Ha = ''
    this.$a = !1
    this.N = !0
    this.a = this.Ta ? Rd(this.Ta) : Rd(Pd)
    this.Sa = this.Ta ? Od(this.Ta) : Od(Pd)
    this.a.onreadystatechange = t(this.Kb, this)
    this.Lc &&
      'onprogress' in this.a &&
      ((this.a.onprogress = t(function (a) {
        this.Jb(a, !0)
      }, this)),
      this.a.upload && (this.a.upload.onprogress = t(this.Jb, this)))
    try {
      ;(this.fb = !0), this.a.open(b, String(a), !0), (this.fb = !1)
    } catch (f) {
      this.va(5, f)
      return
    }
    a = c || ''
    var e = this.headers.clone()
    d &&
      Wa(d, function (a, b) {
        e.set(b, a)
      })
    d = qa(e.L())
    c = k.FormData && a instanceof k.FormData
    !(0 <= la(Td, b)) ||
      d ||
      c ||
      e.set('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8')
    e.forEach(function (a, b) {
      this.a.setRequestHeader(b, a)
    }, this)
    this.Nb && (this.a.responseType = this.Nb)
    za(this.a) && (this.a.withCredentials = this.jd)
    try {
      Wd(this),
        0 < this.Oa &&
          ((this.qb = Xd(this.a))
            ? ((this.a.timeout = this.Oa),
              (this.a.ontimeout = t(this.Tb, this)))
            : (this.Na = wd(this.Tb, this.Oa, this))),
        (this.Da = !0),
        this.a.send(a),
        (this.Da = !1)
    } catch (f) {
      this.va(5, f)
    }
  }
  var Xd = function (a) {
      return K && L(9) && ea(a.timeout) && m(a.ontimeout)
    },
    pa = function (a) {
      return 'content-type' == a.toLowerCase()
    }
  Z.prototype.Tb = function () {
    'undefined' != typeof aa &&
      this.a &&
      ((this.Ha = 'Timed out after ' + this.Oa + 'ms, aborting'),
      this.dispatchEvent('timeout'),
      this.abort(8))
  }
  Z.prototype.va = function (a, b) {
    this.N = !1
    this.a && ((this.V = !0), this.a.abort(), (this.V = !1))
    this.Ha = b
    Yd(this)
    Zd(this)
  }
  var Yd = function (a) {
    a.$a || ((a.$a = !0), a.dispatchEvent('complete'), a.dispatchEvent('error'))
  }
  Z.prototype.abort = function () {
    this.a &&
      this.N &&
      ((this.N = !1),
      (this.V = !0),
      this.a.abort(),
      (this.V = !1),
      this.dispatchEvent('complete'),
      this.dispatchEvent('abort'),
      Zd(this))
  }
  Z.prototype.A = function () {
    this.a &&
      (this.N && ((this.N = !1), (this.V = !0), this.a.abort(), (this.V = !1)),
      Zd(this, !0))
    Z.W.A.call(this)
  }
  Z.prototype.Kb = function () {
    this.ia || (this.fb || this.Da || this.V ? $d(this) : this.Dc())
  }
  Z.prototype.Dc = function () {
    $d(this)
  }
  var $d = function (a) {
    if (
      a.N &&
      'undefined' != typeof aa &&
      (!a.Sa[1] || 4 != ae(a) || 2 != be(a))
    )
      if (a.Da && 4 == ae(a)) wd(a.Kb, 0, a)
      else if ((a.dispatchEvent('readystatechange'), 4 == ae(a))) {
        a.N = !1
        try {
          var b = be(a),
            c
          a: switch (b) {
            case 200:
            case 201:
            case 202:
            case 204:
            case 206:
            case 304:
            case 1223:
              c = !0
              break a
            default:
              c = !1
          }
          var d
          if (!(d = c)) {
            var e
            if ((e = 0 === b)) {
              var f = String(a.gb).match(Kd)[1] || null
              if (!f && k.self && k.self.location)
                var g = k.self.location.protocol,
                  f = g.substr(0, g.length - 1)
              e = !Sd.test(f ? f.toLowerCase() : '')
            }
            d = e
          }
          if (d) a.dispatchEvent('complete'), a.dispatchEvent('success')
          else {
            var l
            try {
              l = 2 < ae(a) ? a.a.statusText : ''
            } catch (x) {
              l = ''
            }
            a.Ha = l + ' [' + be(a) + ']'
            Yd(a)
          }
        } finally {
          Zd(a)
        }
      }
  }
  Z.prototype.Jb = function (a, b) {
    this.dispatchEvent(ce(a, 'progress'))
    this.dispatchEvent(ce(a, b ? 'downloadprogress' : 'uploadprogress'))
  }
  var ce = function (a, b) {
      return {
        type: b,
        lengthComputable: a.lengthComputable,
        loaded: a.loaded,
        total: a.total,
      }
    },
    Zd = function (a, b) {
      if (a.a) {
        Wd(a)
        var c = a.a,
          d = a.Sa[0] ? ba : null
        a.a = null
        a.Sa = null
        b || a.dispatchEvent('ready')
        try {
          c.onreadystatechange = d
        } catch (e) {}
      }
    },
    Wd = function (a) {
      a.a && a.qb && (a.a.ontimeout = null)
      ea(a.Na) && (k.clearTimeout(a.Na), (a.Na = null))
    },
    ae = function (a) {
      return a.a ? a.a.readyState : 0
    },
    be = function (a) {
      try {
        return 2 < ae(a) ? a.a.status : -1
      } catch (b) {
        return -1
      }
    }
  var de = function (a, b, c) {
      this.g = this.c = null
      this.F = a || null
      this.xc = !!c
    },
    ee = function (a) {
      a.c ||
        ((a.c = new z()),
        (a.g = 0),
        a.F &&
          Ld(a.F, function (b, c) {
            a.add(decodeURIComponent(b.replace(/\+/g, ' ')), c)
          }))
    }
  h = de.prototype
  h.add = function (a, b) {
    ee(this)
    this.F = null
    a = fe(this, a)
    var c = this.c.get(a)
    c || this.c.set(a, (c = []))
    c.push(b)
    this.g += 1
    return this
  }
  h.remove = function (a) {
    ee(this)
    a = fe(this, a)
    return this.c.$(a)
      ? ((this.F = null), (this.g -= this.c.get(a).length), this.c.remove(a))
      : !1
  }
  h.$ = function (a) {
    ee(this)
    a = fe(this, a)
    return this.c.$(a)
  }
  h.L = function () {
    ee(this)
    for (var a = this.c.v(), b = this.c.L(), c = [], d = 0; d < b.length; d++)
      for (var e = a[d], f = 0; f < e.length; f++) c.push(b[d])
    return c
  }
  h.v = function (a) {
    ee(this)
    var b = []
    if (p(a)) this.$(a) && (b = sa(b, this.c.get(fe(this, a))))
    else {
      a = this.c.v()
      for (var c = 0; c < a.length; c++) b = sa(b, a[c])
    }
    return b
  }
  h.set = function (a, b) {
    ee(this)
    this.F = null
    a = fe(this, a)
    this.$(a) && (this.g -= this.c.get(a).length)
    this.c.set(a, [b])
    this.g += 1
    return this
  }
  h.get = function (a, b) {
    var c = a ? this.v(a) : []
    return 0 < c.length ? String(c[0]) : b
  }
  h.toString = function () {
    if (this.F) return this.F
    if (!this.c) return ''
    for (var a = [], b = this.c.L(), c = 0; c < b.length; c++)
      for (
        var d = b[c], e = encodeURIComponent(String(d)), d = this.v(d), f = 0;
        f < d.length;
        f++
      ) {
        var g = e
        '' !== d[f] && (g += '=' + encodeURIComponent(String(d[f])))
        a.push(g)
      }
    return (this.F = a.join('&'))
  }
  h.clone = function () {
    var a = new de()
    a.F = this.F
    this.c && ((a.c = this.c.clone()), (a.g = this.g))
    return a
  }
  var fe = function (a, b) {
    var c = String(b)
    a.xc && (c = c.toLowerCase())
    return c
  }
  var ge = function (a, b) {
    this.Uc = a
    this.Ia = b
  }
  ge.prototype.send = function (a, b) {
    if (qb && !navigator.onLine) return Ic()
    var c = new Q(),
      d = he(a, b)
    d.length > this.Ia
      ? c.I({
          status: 'payload-too-big',
          ta: Ua(
            'Encoded hit length == %s, but should be <= %s.',
            d.length,
            this.Ia
          ),
        })
      : Vd(
          this.Uc,
          function () {
            c.G(Gd)
          },
          d
        )
    return c
  }
  var he = function (a, b) {
    var c = new de()
    c.add(Ga.name, a)
    Xa(b, function (a, b) {
      c.add(a.name, b.toString())
    })
    return c.toString()
  }
  var ie = function (a, b, c) {
    this.j = a
    this.Tc = b
    this.Ia = c
  }
  ie.prototype.cb = function () {
    if (!this.D) {
      if (!Cc(this.j.ma).K)
        throw Error(
          'Cannot construct shared channel prior to settings being ready.'
        )
      new zd()
      var a = new Bd(new ge(this.Tc, this.Ia)),
        b = new Id()
      this.D = new Ad(this.j, new Jd(this.j, new Hd(b, a)))
    }
    return this.D
  }
  var je = new z(),
    ke = function () {
      Ea || (Ea = new T(new od()))
      return Ea
    }
  v('goog.async.Deferred', Q)
  v('goog.async.Deferred.prototype.addCallback', Q.prototype.w)
  v('goog.async.Deferred.prototype.callback', Q.prototype.G)
  v('goog.async.Deferred.prototype.then', Q.prototype.then)
  v('goog.events.EventTarget', O)
  v('goog.events.EventTarget.prototype.listen', O.prototype.listen)
  v('analytics.getService', function (a, b) {
    var c = je.get(a, null),
      d = b || chrome.runtime.getManifest().version
    if (null === c) {
      c = ke()
      if (!Fa) {
        var e = ke()
        Fa = new ud(
          e,
          new ie(e, 'https://www.google-analytics.com/collect', 8192)
        )
      }
      c = new bd('ca1.6.0', a, d, c, Fa)
      je.set(a, c)
    }
    return c
  })
  v('analytics.internal.GoogleAnalyticsService', bd)
  v(
    'analytics.internal.GoogleAnalyticsService.prototype.getTracker',
    bd.prototype.tc
  )
  v(
    'analytics.internal.GoogleAnalyticsService.prototype.getConfig',
    bd.prototype.rc
  )
  v('analytics.internal.ServiceSettings', T)
  v(
    'analytics.internal.ServiceSettings.prototype.setTrackingPermitted',
    T.prototype.Wc
  )
  v(
    'analytics.internal.ServiceSettings.prototype.isTrackingPermitted',
    T.prototype.Fa
  )
  v(
    'analytics.internal.ServiceSettings.prototype.setSampleRate',
    T.prototype.Vc
  )
  v('analytics.internal.ServiceSettings.prototype.resetUserId', T.prototype.Nc)
  v('analytics.internal.ServiceTracker', S)
  v('analytics.internal.ServiceTracker.prototype.send', S.prototype.send)
  v('analytics.internal.ServiceTracker.prototype.sendAppView', S.prototype.Pc)
  v('analytics.internal.ServiceTracker.prototype.sendEvent', S.prototype.Qc)
  v('analytics.internal.ServiceTracker.prototype.sendSocial', S.prototype.Sc)
  v('analytics.internal.ServiceTracker.prototype.sendException', S.prototype.Rc)
  v('analytics.internal.ServiceTracker.prototype.sendTiming', S.prototype.Pb)
  v('analytics.internal.ServiceTracker.prototype.startTiming', S.prototype.Zc)
  v('analytics.internal.ServiceTracker.Timing', ad)
  v(
    'analytics.internal.ServiceTracker.Timing.prototype.send',
    ad.prototype.send
  )
  v(
    'analytics.internal.ServiceTracker.prototype.forceSessionStart',
    S.prototype.qc
  )
  v('analytics.internal.ServiceTracker.prototype.addFilter', S.prototype.Y)
  v('analytics.internal.FilterChannel.Hit', R)
  v('analytics.internal.FilterChannel.Hit.prototype.getHitType', R.prototype.Ab)
  v(
    'analytics.internal.FilterChannel.Hit.prototype.getParameters',
    R.prototype.ba
  )
  v('analytics.internal.FilterChannel.Hit.prototype.cancel', R.prototype.cancel)
  v('analytics.ParameterMap', E)
  v('analytics.ParameterMap.Entry', E.Entry)
  v('analytics.ParameterMap.prototype.set', E.prototype.set)
  v('analytics.ParameterMap.prototype.get', E.prototype.get)
  v('analytics.ParameterMap.prototype.remove', E.prototype.remove)
  v('analytics.ParameterMap.prototype.toObject', E.prototype.Ub)
  v('analytics.HitTypes.APPVIEW', 'appview')
  v('analytics.HitTypes.EVENT', 'event')
  v('analytics.HitTypes.SOCIAL', 'social')
  v('analytics.HitTypes.TRANSACTION', 'transaction')
  v('analytics.HitTypes.ITEM', 'item')
  v('analytics.HitTypes.TIMING', 'timing')
  v('analytics.HitTypes.EXCEPTION', 'exception')
  v('analytics.createDimensionParam', Oa)
  v('analytics.createMetricParam', Pa)
  wa(Na, function (a) {
    var b = a.id.replace(/[A-Z]/, '_$&').toUpperCase()
    v('analytics.Parameters.' + b, a)
  })
  v('analytics.filters.EventLabelerBuilder', C)
  v(
    'analytics.filters.EventLabelerBuilder.prototype.appendToExistingLabel',
    C.prototype.cc
  )
  v(
    'analytics.filters.EventLabelerBuilder.prototype.stripValue',
    C.prototype.$c
  )
  v(
    'analytics.filters.EventLabelerBuilder.prototype.powersOfTwo',
    C.prototype.Kc
  )
  v(
    'analytics.filters.EventLabelerBuilder.prototype.rangeBounds',
    C.prototype.Mc
  )
  v('analytics.filters.EventLabelerBuilder.prototype.build', C.prototype.qa)
  v('analytics.filters.FilterBuilder', B)
  v('analytics.filters.FilterBuilder.builder', Sa)
  v('analytics.filters.FilterBuilder.prototype.when', B.prototype.when)
  v('analytics.filters.FilterBuilder.prototype.whenHitType', B.prototype.Wb)
  v('analytics.filters.FilterBuilder.prototype.whenValue', B.prototype.hd)
  v('analytics.filters.FilterBuilder.prototype.applyFilter', B.prototype.sb)
  v('analytics.filters.FilterBuilder.prototype.build', B.prototype.qa)
  v('analytics.EventBuilder', F)
  v('analytics.EventBuilder.builder', function () {
    return Ya
  })
  v('analytics.EventBuilder.prototype.category', F.prototype.ec)
  v('analytics.EventBuilder.prototype.action', F.prototype.action)
  v('analytics.EventBuilder.prototype.label', F.prototype.label)
  v('analytics.EventBuilder.prototype.value', F.prototype.value)
  v('analytics.EventBuilder.prototype.dimension', F.prototype.mc)
  v('analytics.EventBuilder.prototype.metric', F.prototype.Cc)
  v('analytics.EventBuilder.prototype.send', F.prototype.send)
}.call(this))
