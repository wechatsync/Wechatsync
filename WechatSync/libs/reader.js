/*
 * Copyright (c) 2010 Apple Inc. All rights reserved.
 */
function characterNeedsScoreMultiplier(e) {
  if (!e || e.length === 0) return !1
  var t = e.charCodeAt(0)
  return t > 11904 && t < 12031
    ? !0
    : t > 12352 && t < 12543
    ? !0
    : t > 12736 && t < 19903
    ? !0
    : t > 19968 && t < 40959
    ? !0
    : t > 44032 && t < 55215
    ? !0
    : t > 63744 && t < 64255
    ? !0
    : t > 65072 && t < 65103
    ? !0
    : t > 131072 && t < 173791
    ? !0
    : t > 194560 && t < 195103
    ? !0
    : !1
}
function domDistance(e, t, n) {
  var r = [],
    i = e
  while (i) r.unshift(i), (i = i.parentNode)
  var s = []
  i = t
  while (i) s.unshift(i), (i = i.parentNode)
  var o = Math.min(r.length, s.length),
    u = Math.abs(r.length - s.length)
  for (var a = o; a >= 0; --a) {
    if (r[a] === s[a]) break
    u += 2
    if (n && u >= n) return n
  }
  return u
}
function fontSizeFromComputedStyle(e, t) {
  var n = parseInt(e.fontSize)
  return isNaN(n) && (n = t ? t : BaseFontSize), n
}
function contentTextStyleForNode(e, t) {
  function n(e) {
    if (isNodeWhitespace(e)) return null
    var t = getComputedStyle(e.parentNode)
    return t.float !== 'none' ? null : t
  }
  var r =
      'descendant::text()[not(parent::h1) and not(parent::h2) and not(parent::h3) and not(parent::h4) and not(parent::h5) and not(parent::h6)]',
    i = e.evaluate(r, t, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null),
    s = i.snapshotLength
  for (var o = 0; o < s; ++o) {
    var u = i.snapshotItem(o),
      a = !1
    for (var f = u.parentElement; f !== t; f = f.parentElement)
      if (NegativeRegEx.test(f.className)) {
        a = !0
        break
      }
    if (a) continue
    var l = n(u)
    if (l) return l
  }
  return null
}
function isNodeWhitespace(e) {
  return !e || e.nodeType !== Node.TEXT_NODE ? !1 : !/\S/.test(e.data)
}
function removeWhitespace(e) {
  return e.replace(/\s+/g, '')
}
function isElementNode(e) {
  return e && e.nodeType === Node.ELEMENT_NODE ? !0 : !1
}
function computedStyleIndicatesElementIsInvisibleDueToClipping(e) {
  if (e.position !== 'absolute') return !1
  var t = e.clip.match(
    /^rect\((\d+px|auto), (\d+px|auto), (\d+px|auto), (\d+px|auto)\)$/
  )
  if (!t || t.length !== 5) return !1
  var n = t.map(function (e) {
      return parseInt(e)
    }),
    r = n[1]
  isNaN(r) && (r = 0)
  var i = n[2],
    s = n[3],
    o = n[4]
  return isNaN(o) && (o = 0), r >= s || i >= o
}
function isElementVisible(e) {
  var t = getComputedStyle(e)
  if (t.visibility !== 'visible' || t.display === 'none') return !1
  if (cachedElementBoundingRect(e).height) return !0
  var n = document.createRange()
  return n.selectNode(e), !!n.getBoundingClientRect().height
}
function isElementPositionedOffScreen(e) {
  var t = cachedElementBoundingRect(e)
  return !t.height || !t.width ? !1 : t.bottom <= 0 || t.right <= 0 ? !0 : !1
}
function elementDepth(e) {
  var t = 0
  for (; e; e = e.parentElement) t++
  return t
}
function depthOfElementWithinElement(e, t) {
  var n = 0
  for (; e !== t; e = e.parentElement) n++
  return n
}
function nearestAncestorElementWithTagName(e, t) {
  while ((e = e.parentElement)) if (e.tagName === t) return e
  return null
}
function cachedElementBoundingRect(e) {
  if (e._cachedElementBoundingRect) return e._cachedElementBoundingRect
  var t = e.getBoundingClientRect()
  return (
    ReaderArticleFinderJS._elementsWithCachedBoundingRects.push(e),
    !ReaderArticleFinderJS._cachedScrollX &&
    !ReaderArticleFinderJS._cachedScrollY
      ? ((e._cachedElementBoundingRect = t), e._cachedElementBoundingRect)
      : ((e._cachedElementBoundingRect = {
          top: t.top + ReaderArticleFinderJS._cachedScrollY,
          right: t.right + ReaderArticleFinderJS._cachedScrollX,
          bottom: t.bottom + ReaderArticleFinderJS._cachedScrollY,
          left: t.left + ReaderArticleFinderJS._cachedScrollX,
          width: t.width,
          height: t.height,
        }),
        e._cachedElementBoundingRect)
  )
}
function clearCachedElementBoundingRects() {
  var e = ReaderArticleFinderJS._elementsWithCachedBoundingRects,
    t = e.length
  for (var n = 0; n < t; ++n) e[n]._cachedElementBoundingRect = null
  ReaderArticleFinderJS._elementsWithCachedBoundingRects = []
}
function innerTextOrTextContent(e) {
  var t = e.innerText
  return /\S/.test(t) || (t = e.textContent), t
}
function levenshteinDistance(e, t) {
  var n = e.length,
    r = t.length,
    i = new Array(n + 1)
  for (var s = 0; s < n + 1; ++s) (i[s] = new Array(r + 1)), (i[s][0] = s)
  for (var o = 0; o < r + 1; ++o) i[0][o] = o
  for (var o = 1; o < r + 1; ++o)
    for (var s = 1; s < n + 1; ++s)
      if (e[s - 1] === t[o - 1]) i[s][o] = i[s - 1][o - 1]
      else {
        var u = i[s - 1][o] + 1,
          a = i[s][o - 1] + 1,
          f = i[s - 1][o - 1] + 1
        i[s][o] = Math.min(u, a, f)
      }
  return i[n][r]
}
function stringSimilarity(e, t) {
  var n = Math.max(e.length, t.length)
  return n ? (n - levenshteinDistance(e, t)) / n : 0
}
function stringsAreNearlyIdentical(e, t) {
  return e === t
    ? !0
    : stringSimilarity(e, t) > StringSimilarityToDeclareStringsNearlyIdentical
}
function elementIsCommentBlock(e) {
  if (/(^|\s)comment/.test(e.className)) return !0
  var t = e.getAttribute('id')
  return t && t.indexOf('comment') === 0 ? !0 : !1
}
function elementLooksLikeEmbeddedTweet(e) {
  const t = /http.+twitter.com.*status.*[0-9]+/i
  if (e.tagName !== 'IFRAME') return !1
  if (!e.contentDocument) return !1
  var n = e.contentDocument.documentElement,
    r = 0,
    i = n.querySelector('blockquote')
  return (
    i && t.test(i.getAttribute('cite')) && ++r,
    e.classList.contains('twitter-tweet') && ++r,
    n.querySelector("[data-iframe-title='Embedded Tweet']") && ++r,
    n.querySelector('[data-tweet-id]') && ++r,
    r > 2
  )
}
function elementLooksLikePartOfACarousel(e) {
  const t = /carousel-|carousel_|-carousel|_carousel/,
    n = 3
  var r = e
  for (var i = 0; i < n; ++i) {
    if (!r) return !1
    if (t.test(r.className) || t.test(r.getAttribute('data-analytics')))
      return !0
    r = r.parentElement
  }
}
function shouldPruneIframe(e, t) {
  return HostnamesKnownToContainEmbeddableMediaRegex.test(
    anchorForURL(e.src, t).hostname
  )
    ? !1
    : elementLooksLikeEmbeddedTweet(e.originalElement)
    ? !1
    : !0
}
function languageScoreMultiplierForTextNodes(e) {
  if (!e || !e.length) return 1
  var t = Math.min(
      e.length,
      DefaultNumberOfTextNodesToCheckForLanguageMultiplier
    ),
    n = 0,
    r = 0
  for (var i = 0; i < t; i++) {
    var s = e[i].nodeValue.trim(),
      o = Math.min(
        s.length,
        NumberOfCharactersPerTextNodeToEvaluateForLanguageMultiplier
      )
    for (var u = 0; u < o; u++) characterNeedsScoreMultiplier(s[u]) && n++
    r += o
  }
  return n >= r * MinimumRatioOfCharactersForLanguageMultiplier
    ? ScoreMultiplierForChineseJapaneseKorean
    : 1
}
function scoreMultiplierForElementTagNameAndAttributes(e) {
  var t = 1
  for (var n = e; n; n = n.parentElement) {
    var r = n.getAttribute('id')
    r &&
      (ArticleRegEx.test(r) && (t += ArticleMatchBonus),
      CommentRegEx.test(r) && (t -= CommentMatchPenalty))
    var i = n.className
    i &&
      (ArticleRegEx.test(i) && (t += ArticleMatchBonus),
      CommentRegEx.test(i) && (t -= CommentMatchPenalty)),
      n.tagName === 'ARTICLE' && (t += ArticleMatchBonus)
  }
  return t < 0 ? 0 : t
}
function elementAtPoint(e, t) {
  if (
    typeof ReaderArticleFinderJSController != 'undefined' &&
    ReaderArticleFinderJSController.nodeAtPoint
  ) {
    var n = ReaderArticleFinderJSController.nodeAtPoint(e, t)
    return n && n.nodeType !== Node.ELEMENT_NODE && (n = n.parentElement), n
  }
  return document.elementFromPoint(e, t)
}
function userVisibleURLString(e) {
  return typeof ReaderArticleFinderJSController != 'undefined' &&
    ReaderArticleFinderJSController.userVisibleURLString
    ? ReaderArticleFinderJSController.userVisibleURLString(e)
    : e
}
function anchorForURL(e, t) {
  var n = t.createElement('a')
  return (n.href = e), n
}
function anchorLinksToAttachment(e) {
  return /\battachment\b/i.test(e.getAttribute('rel'))
}
function anchorLinksToTagOrCategoryPage(e) {
  return /\bcategory|tag\b/i.test(e.getAttribute('rel'))
}
function elementsHaveSameTagAndClassNames(e, t) {
  return e.tagName === t.tagName && e.className === t.className
}
function selectorForElement(e) {
  var t = e.tagName,
    n = e.classList,
    r = n.length
  for (var i = 0; i < r; i++) t += '.' + n[i]
  return t
}
function elementFingerprintForDepth(e, t) {
  function s(e, t) {
    if (!e) return ''
    var o = []
    o.push(selectorForElement(e))
    var u = e.children,
      a = u.length
    if (a && t > 0) {
      o.push(n)
      for (var f = 0; f < a; ++f)
        o.push(s(u[f], t - 1)), f !== a - 1 && o.push(i)
      o.push(r)
    }
    return o.join('')
  }
  const n = ' / ',
    r = ' \\',
    i = ' | '
  return s(e, t)
}
function childrenOfParentElement(e) {
  var t = e.parentElement
  return t ? t.children : []
}
function arrayOfKeysAndValuesOfObjectSortedByValueDescending(e) {
  var t = []
  for (var n in e)
    e.hasOwnProperty(n) &&
      t.push({
        key: n,
        value: e[n],
      })
  return (
    t.sort(function (e, t) {
      return t.value - e.value
    }),
    t
  )
}
function walkElementSubtree(e, t, n) {
  if (t < 0) return
  var r = e.children,
    i = r.length,
    s = t - 1
  for (var o = 0; o < i; ++o) walkElementSubtree(r[o], s, n)
  n(e, t)
}
function childrenWithParallelStructure(e) {
  var t = e.children
  if (!t) return []
  var n = t.length
  if (!n) return []
  var r = {}
  for (var i = 0; i < n; ++i) {
    var s = t[i]
    if (CandidateTagNamesToIgnore[s.tagName] || !s.className) continue
    var o = s.classList,
      u = o.length
    for (var a = 0; a < u; ++a) {
      var f = o[a],
        l = r[f]
      l ? l.push(s) : (r[f] = [s])
    }
  }
  var c = Math.floor(n / 2)
  for (var f in r) {
    var l = r[f]
    if (l.length > c) return l
  }
  return []
}
const ReaderMinimumScore = 1600,
  ReaderMinimumAdvantage = 15,
  ArticleMinimumScoreDensity = 4.25,
  BlacklistedHostsAllowedPathRegexMap = {
    'www.apple.com': /^\/([a-z]{2,4}\/){0,2}pr\/|^\/hotnews\//,
    'extensions.apple.com': null,
  },
  ListOfHostnameAndTrustedArticleNodeSelectorPairs = [
    [/.*\.apple.com$/, 'article'],
  ],
  CandidateMinimumWidth = 280,
  CandidateMinimumHeight = 295,
  CandidateMinimumArea = 17e4,
  CandidateMaximumTop = 1300,
  CandidateMinimumWidthPortionForIndicatorElements = 0.5,
  CandidateMinumumListItemLineCount = 4,
  CandidateTagNamesToIgnore = {
    A: 1,
    EMBED: 1,
    FORM: 1,
    HTML: 1,
    IFRAME: 1,
    OBJECT: 1,
    OL: 1,
    OPTION: 1,
    SCRIPT: 1,
    STYLE: 1,
    svg: 1,
    UL: 1,
  },
  PrependedArticleCandidateMinimumHeight = 50,
  AppendedArticleCandidateMinimumHeight = 200,
  AppendedArticleCandidateMaximumVerticalDistanceFromArticle = 150,
  StylisticClassNames = {
    justfy: 1,
    justify: 1,
    left: 1,
    right: 1,
    small: 1,
  },
  CommentRegEx = /comment|meta|footer|footnote/,
  CommentMatchPenalty = 0.75,
  ArticleRegEx = /(?:(?:^|\s)(?:(post|hentry|entry)[-_]?(?:content|text|body)?|article[-_]?(?:content|text|body|page)?)(?:\s|$))/i,
  ArticleMatchBonus = 0.5,
  DensityExcludedElementSelector = '#disqus_thread, #comments, .userComments',
  AttributesToRemoveRegEx = /^on|^id$|^class$|^style$/,
  PositiveRegEx = /article|body|content|entry|hentry|page|pagination|post|text/i,
  NegativeRegEx = /advertisement|breadcrumb|combx|comment|contact|disqus|footer|link|meta|mod-conversations|promo|related|scroll|share|shoutbox|sidebar|social|sponsor|subscribe|tags|toolbox|widget|_ad$/i,
  VeryPositiveClassNameRegEx = /instapaper_body/,
  VeryNegativeClassNameRegEx = /instapaper_ignore/,
  SharingRegex = /email|print|rss|digg|slashdot|delicious|reddit|share/i,
  HostnamesKnownToContainEmbeddableMediaRegex = /youtube|vimeo|dailymotion/,
  MinimumAverageDistanceBetweenHRElements = 400,
  MinimumAverageDistanceBetweenHeaderElements = 400,
  PortionOfCandidateHeightToIgnoreForHeaderCheck = 0.1,
  DefaultNumberOfTextNodesToCheckForLanguageMultiplier = 3,
  NumberOfCharactersPerTextNodeToEvaluateForLanguageMultiplier = 12,
  MinimumRatioOfCharactersForLanguageMultiplier = 0.5,
  ScoreMultiplierForChineseJapaneseKorean = 3,
  MinimumContentMediaHeight = 150,
  MinimumContentMediaWidthToArticleWidthRatio = 0.25,
  MaximumContentMediaAreaToArticleAreaRatio = 0.2,
  LinkContinueMatchRegEx = /continue/gi,
  LinkNextMatchRegEx = /next/gi,
  LinkPageMatchRegEx = /page/gi,
  LinkListItemBonus = 5,
  LinkPageMatchBonus = 10,
  LinkNextMatchBonus = 15,
  LinkContinueMatchBonus = 15,
  LinkNextOrdinalValueBase = 3,
  LinkMismatchValueBase = 2,
  LinkMatchWeight = 200,
  LinkMaxVerticalDistanceFromArticle = 200,
  LinkVerticalDistanceFromArticleWeight = 150,
  LinkCandidateXPathQuery =
    "descendant-or-self::*[(not(@id) or (@id!='disqus_thread' and @id!='comments')) and (not(@class) or @class!='userComments')]/a",
  LinkDateRegex = /\D(?:\d\d(?:\d\d)?[\-\/](?:10|11|12|0?[1-9])[\-\/](?:30|31|[12][0-9]|0?[1-9])|\d\d(?:\d\d)?\/(?:10|11|12|0[1-9])|(?:10|11|12|0?[1-9])\-(?:30|31|[12][0-9]|0?[1-9])\-\d\d(?:\d\d)?|(?:30|31|[12][0-9]|0?[1-9])\-(?:10|11|12|0?[1-9])\-\d\d(?:\d\d)?)\D/,
  LinkURLSearchParameterKeyMatchRegex = /(page|^p$|^pg$)/i,
  LinkURLPageSlashNumberMatchRegex = /\/.*page.*\/\d+/i,
  LinkURLSlashDigitEndMatchRegex = /\/\d+\/?$/,
  LinkURLArchiveSlashDigitEndMatchRegex = /archives?\/\d+\/?$/,
  LinkURLBadSearchParameterKeyMatchRegex = /author|comment|feed|id|nonce|related/i,
  LinkURLSemanticMatchBonus = 100,
  LinkMinimumURLSimilarityRatio = 0.75,
  HeaderMinimumDistanceFromArticleTop = 200,
  HeaderLevenshteinDistanceToLengthRatio = 0.75,
  MinimumRatioOfListItemsBeingRelatedToSharingToPruneEntireList = 0.5,
  FloatMinimumHeight = 130,
  ImageSizeTiny = 32,
  ToleranceForLeadingImageWidthToArticleWidthForFullWidthPresentation = 50,
  MaximumFloatWidth = 325,
  AnchorImageMinimumWidth = 100,
  AnchorImageMinimumHeight = 100,
  MinimumHeightForImagesAboveTheArticleTitle = 50,
  MainImageMinimumWidthAndHeight = 83,
  BaseFontSize = 16,
  BaseLineHeightRatio = 1.125,
  MaximumExactIntegralValue = 9007199254740992,
  TitleCandidateDepthScoreMultiplier = 0.1,
  DocumentPositionDisconnected = 1,
  DocumentPositionPreceding = 2,
  DocumentPositionFollowing = 4,
  DocumentPositionContains = 8,
  DocumentPositionContainedBy = 16,
  TextNodeLengthPower = 1.25,
  KnownImageLazyLoadingAttributes = {
    'data-lazy-src': 1,
    'data-original': 1,
    'data-src': 1,
    'original-src': 1,
    'rel:bf_image_src': 1,
  },
  StringSimilarityToDeclareStringsNearlyIdentical = 0.97
;(CandidateElement = function (e, t) {
  ;(this.element = e),
    (this.contentDocument = t),
    (this.textNodes = this.usableTextNodesInElement(this.element)),
    (this.rawScore = this.calculateRawScore()),
    (this.tagNameAndAttributesScoreMultiplier = this.calculateElementTagNameAndAttributesScoreMultiplier()),
    (this.languageScoreMultiplier = 0),
    (this.depthInDocument = 0)
}),
  (CandidateElement.extraArticleCandidateIfElementIsViable = function (
    t,
    n,
    r,
    i
  ) {
    const s = 'a, b, strong, i, em, u, span'
    var o = cachedElementBoundingRect(t),
      u = cachedElementBoundingRect(n.element)
    if (
      (i && o.height < PrependedArticleCandidateMinimumHeight) ||
      (!i && o.height < AppendedArticleCandidateMinimumHeight)
    )
      if (
        t.childElementCount &&
        t.querySelectorAll('*').length !== t.querySelectorAll(s).length
      )
        return null
    if (i) {
      if (o.bottom > u.top) return null
    } else if (o.top < u.bottom) return null
    if (!i) {
      var a = o.top - u.bottom
      if (a > AppendedArticleCandidateMaximumVerticalDistanceFromArticle)
        return null
    }
    if (o.left > u.right || o.right < u.left) return null
    if (elementLooksLikePartOfACarousel(t)) return null
    var f = new CandidateElement(t, r)
    return (f.isPrepended = i), f
  }),
  (CandidateElement.candidateIfElementIsViable = function (t, n, r) {
    var i = cachedElementBoundingRect(t)
    return i.width < CandidateMinimumWidth || i.height < CandidateMinimumHeight
      ? null
      : i.width * i.height < CandidateMinimumArea
      ? null
      : !r && i.top > CandidateMaximumTop
      ? null
      : CandidateElement.candidateElementAdjustedHeight(t) <
        CandidateMinimumHeight
      ? null
      : new CandidateElement(t, n)
  }),
  (CandidateElement.candidateElementAdjustedHeight = function (t) {
    var n = cachedElementBoundingRect(t),
      r = n.height,
      i = t.getElementsByTagName('form'),
      s = i.length
    for (var o = 0; o < s; ++o) {
      var u = i[o],
        a = cachedElementBoundingRect(u)
      a.width > n.width * CandidateMinimumWidthPortionForIndicatorElements &&
        (r -= a.height)
    }
    var f = t.querySelectorAll('ol, ul'),
      l = f.length,
      c = null
    for (var o = 0; o < l; ++o) {
      var h = f[o]
      if (c && c.compareDocumentPosition(h) & DocumentPositionContainedBy)
        continue
      var p = h.getElementsByTagName('li'),
        d = p.length,
        v = cachedElementBoundingRect(h)
      if (!d) {
        r -= v.height
        continue
      }
      var m = v.height / d,
        g = getComputedStyle(p[0]),
        y = parseInt(g.lineHeight)
      if (isNaN(y)) {
        var b = fontSizeFromComputedStyle(g)
        y = b * BaseLineHeightRatio
      }
      v.width > n.width * CandidateMinimumWidthPortionForIndicatorElements &&
        m / y < CandidateMinumumListItemLineCount &&
        ((r -= v.height), (c = h))
    }
    return r
  }),
  (CandidateElement.prototype = {
    calculateRawScore: function () {
      var t = 0,
        n = this.textNodes,
        r = n.length
      for (var i = 0; i < r; ++i) t += this.rawScoreForTextNode(n[i])
      return t
    },
    calculateElementTagNameAndAttributesScoreMultiplier: function () {
      return scoreMultiplierForElementTagNameAndAttributes(this.element)
    },
    calculateLanguageScoreMultiplier: function () {
      if (this.languageScoreMultiplier !== 0) return
      this.languageScoreMultiplier = languageScoreMultiplierForTextNodes(
        this.textNodes
      )
    },
    depth: function () {
      return (
        this.depthInDocument ||
          (this.depthInDocument = elementDepth(this.element)),
        this.depthInDocument
      )
    },
    finalScore: function () {
      return (
        this.calculateLanguageScoreMultiplier(),
        this.basicScore() * this.languageScoreMultiplier
      )
    },
    basicScore: function () {
      return this.rawScore * this.tagNameAndAttributesScoreMultiplier
    },
    scoreDensity: function () {
      var t = 0,
        n = this.element.querySelector(DensityExcludedElementSelector)
      n && (t = n.clientWidth * n.clientHeight)
      var r = this.element.children || [],
        i = r.length
      for (var s = 0; s < i; ++s) {
        var o = r[s]
        elementIsCommentBlock(o) && (t += o.clientWidth * o.clientHeight)
      }
      var u =
          cachedElementBoundingRect(this.element).width *
          cachedElementBoundingRect(this.element).height,
        a = u * MaximumContentMediaAreaToArticleAreaRatio,
        f =
          cachedElementBoundingRect(this.element).width *
          MinimumContentMediaWidthToArticleWidthRatio,
        l = this.element.querySelectorAll('img, object, video'),
        c = l.length
      for (var s = 0; s < c; ++s) {
        var h = cachedElementBoundingRect(l[s])
        if (h.width >= f && h.height > MinimumContentMediaHeight) {
          var p = h.width * h.height
          p < a && (t += p)
        }
      }
      var d = this.basicScore(),
        v = u - t,
        m = this.textNodes.length,
        g = 0,
        y = 0
      for (var s = 0; s < m; ++s) {
        var b = this.textNodes[s].parentNode
        b && ((y += fontSizeFromComputedStyle(getComputedStyle(b))), g++)
      }
      var w = BaseFontSize
      return (
        g && (w = y /= g),
        this.calculateLanguageScoreMultiplier(),
        (d / v) * 1e3 * (w / BaseFontSize) * this.languageScoreMultiplier
      )
    },
    usableTextNodesInElement: function (t) {
      var n = []
      if (!t) return n
      const r = {
        A: 1,
        DD: 1,
        DT: 1,
        NOSCRIPT: 1,
        OL: 1,
        OPTION: 1,
        PRE: 1,
        SCRIPT: 1,
        STYLE: 1,
        TD: 1,
        UL: 1,
        IFRAME: 1,
      }
      var i = this.contentDocument,
        s = function (e) {
          const t =
            'text()|*/text()|*/a/text()|*/li/text()|*/span/text()|*/em/text()|*/i/text()|*/strong/text()|*/b/text()|*/font/text()|blockquote/*/text()|div[count(./p)=count(./*)]/p/text()'
          var s = i.evaluate(
              t,
              e,
              null,
              XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
              null
            ),
            o = s.snapshotLength
          for (var u = 0; u < o; ++u) {
            var a = s.snapshotItem(u)
            if (
              r[a.parentNode.tagName] ||
              a._countedTextNode ||
              isNodeWhitespace(a)
            )
              continue
            ;(a._countedTextNode = !0), n.push(a)
          }
        }
      s(t)
      var o = childrenWithParallelStructure(t),
        u = o.length
      for (var a = 0; a < u; ++a) {
        var f = o[a]
        s(f)
      }
      var l = n.length
      for (var a = 0; a < l; ++a) delete n[a]._countedTextNode
      return n
    },
    addTextNodesFromCandidateElement: function (t) {
      var n = this.textNodes.length
      for (var r = 0; r < n; ++r) this.textNodes[r].alreadyCounted = !0
      var i = t.textNodes,
        s = i.length
      for (var r = 0; r < s; ++r)
        i[r].alreadyCounted || this.textNodes.push(i[r])
      var n = this.textNodes.length
      for (var r = 0; r < n; ++r) this.textNodes[r].alreadyCounted = null
      this.rawScore = this.calculateRawScore()
    },
    rawScoreForTextNode: function (t) {
      const n = 20
      if (!t) return 0
      var r = t.length
      if (r < n) return 0
      var i = t.parentNode
      if (!isElementVisible(i)) return 0
      var s = 1
      while (i && i !== this.element) (s -= 0.1), (i = i.parentNode)
      return Math.pow(r * s, TextNodeLengthPower)
    },
    shouldDisqualifyDueToScoreDensity: function () {
      return this.scoreDensity() < ArticleMinimumScoreDensity ? !0 : !1
    },
    shouldDisqualifyDueToHorizontalRuleDensity: function () {
      var t = this.element.getElementsByTagName('hr'),
        n = t.length,
        r = 0,
        i = cachedElementBoundingRect(this.element),
        s = i.width * 0.7
      for (var o = 0; o < n; ++o) t[o].clientWidth > s && r++
      if (r) {
        var u = i.height / r
        if (u < MinimumAverageDistanceBetweenHRElements) return !0
      }
      return !1
    },
    shouldDisqualifyDueToHeaderDensity: function () {
      var t = '(h1|h2|h3|h4|h5|h6|*/h1|*/h2|*/h3|*/h4|*/h5|*/h6)[a[@href]]',
        n = this.contentDocument.evaluate(
          t,
          this.element,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        ),
        r = n.snapshotLength
      if (r > 2) {
        var i = 0,
          s = cachedElementBoundingRect(this.element),
          o = s.height * PortionOfCandidateHeightToIgnoreForHeaderCheck
        for (var u = 0; u < r; ++u) {
          var a = n.snapshotItem(u),
            f = cachedElementBoundingRect(a)
          f.top - s.top > o && s.bottom - f.bottom > o && i++
        }
        var l = s.height / i
        if (l < MinimumAverageDistanceBetweenHeaderElements) return !0
      }
      return !1
    },
    shouldDisqualifyDueToSimilarElements: function (t) {
      function i(e) {
        return !!{
          H1: 1,
          H2: 1,
          H3: 1,
          H4: 1,
          H5: 1,
          H6: 1,
        }[e.tagName]
      }
      function s(e, t) {
        if (!e || !t) return !1
        const n = 1
        return e.className
          ? e.className === t.className
          : elementFingerprintForDepth(e, n) ===
              elementFingerprintForDepth(t, n)
      }
      const n = /clearfix/i,
        r = 'h1, h2, h3, h4, h5, h6'
      var o = this.element
      if (o.tagName === 'LI' || o.tagName === 'DD') {
        var u = o.parentNode,
          a = u.children.length
        for (var f = 0; f < a; ++f) {
          var l = u.children[f]
          if (l.tagName === o.tagName && l.className === o.className && l !== o)
            return !0
        }
      }
      var c = o.getAttribute('class')
      c ||
        ((o = o.parentElement),
        o &&
          ((c = o.getAttribute('class')),
          c || ((o = o.parentElement), o && (c = o.getAttribute('class')))))
      if (c) {
        t || (t = [])
        var h = t.length
        for (var f = 0; f < h; ++f) t[f].element.candidateElement = t[f]
        var p
        try {
          var d = c.split(' '),
            v = ''
          for (var f = 0; f < d.length; ++f) {
            if (n.test(d[f])) continue
            d[f].length && (v += '.' + d[f])
          }
          p = this.contentDocument.querySelectorAll(v)
        } catch (m) {
          p = []
        }
        var g = !1,
          y = elementDepth(o),
          b = p.length
        for (var f = 0; f < b; ++f) {
          var l = p[f]
          if (l === o) continue
          if (l.parentElement === o || o.parentElement === l) continue
          if (!isElementVisible(l)) continue
          var w = l.candidateElement
          if (!w) {
            w = new CandidateElement(l, this.contentDocument)
            if (!w) continue
          }
          if (w.basicScore() * ReaderMinimumAdvantage > this.basicScore()) {
            if (
              !g &&
              cachedElementBoundingRect(l).bottom <
                cachedElementBoundingRect(this.element).top
            ) {
              g = !0
              continue
            }
            if (
              s(o.previousElementSibling, l.previousElementSibling) ||
              s(o.nextElementSibling, l.nextElementSibling)
            ) {
              var E = o.querySelector(r),
                S = l.querySelector(r)
              if (E && S && elementsHaveSameTagAndClassNames(E, S)) return !0
              ;(E = o.previousElementSibling), (S = l.previousElementSibling)
              if (
                E &&
                S &&
                i(E) &&
                i(S) &&
                elementsHaveSameTagAndClassNames(E, S)
              )
                return !0
            }
            if (elementDepth(l) === y)
              while (l.parentElement && o.parentElement) {
                if (l.parentElement === o.parentElement) break
                ;(l = l.parentElement), (o = o.parentElement)
              }
            while (o.childElementCount <= 1) {
              if (!o.childElementCount || !l.childElementCount) return !1
              if (l.childElementCount > 1) return !1
              if (o.firstElementChild.tagName !== l.firstElementChild.tagName)
                return !1
              ;(o = o.firstElementChild), (l = l.firstElementChild)
            }
            if (l.childElementCount <= 1) return !1
            var S = l.firstElementChild,
              x = l.lastElementChild,
              E = o.firstElementChild,
              T = o.lastElementChild
            if (S.tagName !== E.tagName) return !1
            if (x.tagName !== T.tagName) return !1
            var N = S.className,
              C = x.className,
              k = E.className,
              L = x.className,
              A = L === k ? 2 : 1
            if (N.length || k.length) {
              if (!N.length || !k.length) return !1
              if (
                N === k &&
                o.querySelectorAll('.' + k.replace(/\s+/, '.')).length <= A
              )
                return !0
            }
            if (C.length || L.length) {
              if (!C.length || !L.length) return !1
              if (
                C === L &&
                o.querySelectorAll('.' + L.replace(/\s+/, '.')).length <= A
              )
                return !0
            }
            var O = E.clientHeight,
              M = T.clientHeight
            return !O || !S.clientHeight
              ? !1
              : !M || !x.clientHeight
              ? !1
              : O === S.clientHeight || M === x.clientHeight
              ? !0
              : !1
          }
        }
        for (var f = 0; f < h; ++f) t[f].element.candidateElement = null
      }
      return !1
    },
    shouldDisqualifyForDeepLinking: function () {
      function n(e) {
        var t = e.pathname.substring(1).split('/')
        return t[t.length - 1] || t.pop(), t
      }
      const t = 5
      var r = this.element,
        i = this.contentDocument.location,
        s = n(i),
        o = s.length,
        u = [],
        a = r.getElementsByTagName('a'),
        f = a.length
      for (var l = 0; l < f; l++) {
        var c = a[l]
        if (i.host !== c.host) continue
        if (n(c).length <= o) continue
        if ((c.host + c.pathname).indexOf(i.host + i.pathname) !== 0) continue
        if (anchorLinksToAttachment(c)) continue
        u.push(c)
        if (u.length < t) continue
        var h = r.offsetTop + r.offsetHeight / t
        return u[0].offsetTop < h
      }
      return !1
    },
  }),
  (String.prototype.lastInteger = function () {
    const t = /[0-9]+/g
    var n = this.match(t)
    return n ? parseInt(n[n.length - 1]) : NaN
  }),
  (String.prototype.escapeCharacters = function (e) {
    var t = !1,
      n = e.length
    for (var r = 0; r < n; ++r)
      if (this.indexOf(e.charAt(r)) !== -1) {
        t = !0
        break
      }
    if (!t) return this
    var i = '',
      s = this.length
    for (var r = 0; r < s; ++r)
      e.indexOf(this.charAt(r)) !== -1 && (i += '\\'), (i += this.charAt(r))
    return i
  }),
  (String.prototype.escapeForRegExp = function () {
    return this.escapeCharacters('^[]{}()\\.$*+?|')
  }),
  (ReaderArticleFinder = function (e) {
    ;(this.contentDocument = e),
      (this.didSearchForArticleNode = !1),
      (this.article = null),
      (this.didSearchForExtraArticleNode = !1),
      (this.extraArticle = null),
      (this.leadingImage = null),
      (this._cachedScrollY = 0),
      (this._cachedScrollX = 0),
      (this._elementsWithCachedBoundingRects = []),
      (this._cachedContentTextStyle = null),
      (this.pageNumber = 1),
      (this.prefixWithDateForNextPageURL = null),
      (this._elementsEvaluatedForTextContent = []),
      (this.previouslyDiscoveredPageURLStrings = [])
  }),
  (ReaderArticleFinder.prototype = {
    isReaderModeAvailable: function () {
      return this.canRunReaderDetection()
        ? this.findArticleBySearchingWhitelist()
          ? !0
          : (this.cacheWindowScrollPosition(),
            (this.article = this.findArticleByVisualExamination()),
            this.article && this.articleIsLTR(),
            !!this.article)
        : null
    },
    prepareToTransitionToReader: function () {
      this.adoptableArticle(!0), this.nextPageURL(), this.articleIsLTR()
    },
    nextPageURL: function () {
      if (!this._nextPageURL) {
        var t = this.nextPageURLString()
        typeof ReaderArticleFinderJSController != 'undefined' &&
          t &&
          (t = ReaderArticleFinderJSController.substituteURLForNextPageURL(t)),
          (this._nextPageURL = t)
      }
      return this._nextPageURL
    },
    containerElementsForMultiPageContent: function () {
      const e = /(.*page.*)(\d{1,2})(.*)/i,
        t = 3
      var n = [],
        r = this.articleNode(),
        i,
        s = 0
      for (;;) {
        i = e.exec(r.getAttribute('id'))
        if (i) break
        r = r.parentElement
        if (!r || s++ === t) return []
      }
      var o = childrenOfParentElement(r),
        u = o.length
      for (var a = 0; a < u; ++a) {
        var f = o[a]
        if (f === r) continue
        var l = e.exec(f.getAttribute('id'))
        if (!l || l[1] !== i[1] || l[3] !== i[3]) continue
        if (isElementVisible(f) && !isElementPositionedOffScreen(f)) continue
        n.push(f)
      }
      return n
    },
    adoptableMultiPageContentElements: function () {
      return this.containerElementsForMultiPageContent().map(function (e) {
        return this.cleanArticleNode(e, e.cloneNode(!0), !1)
      }, this)
    },
    classNameIsSignificantInRouteComputation: function (t) {
      return t ? !(t.toLowerCase() in StylisticClassNames) : !1
    },
    shouldIgnoreInRouteComputation: function (t) {
      return t.tagName === 'SCRIPT' ||
        t.tagName === 'LINK' ||
        t.tagName === 'STYLE'
        ? !0
        : t.tagName !== 'TR'
        ? !1
        : t.offsetHeight
        ? !1
        : !0
    },
    routeToArticleNode: function () {
      var t = [],
        n = this.articleNode()
      while (n) {
        var r = {}
        r.tagName = n.tagName
        var i = n.getAttribute('id')
        i && (r.id = i),
          this.classNameIsSignificantInRouteComputation(n.className) &&
            (r.className = n.className),
          (r.index = 1)
        for (var s = n.previousElementSibling; s; s = s.previousElementSibling)
          this.shouldIgnoreInRouteComputation(s) || r.index++
        t.unshift(r), (n = n.parentElement)
      }
      return t
    },
    adjustArticleNode: function () {
      if (!this.article) return
      var t
      for (t = this.article.element; t; t = t.parentElement)
        if (VeryPositiveClassNameRegEx.test(t.className)) {
          this.article.element = t
          return
        }
      t = this.article.element
      if (
        t.tagName === 'SECTION' &&
        t.parentElement &&
        t.parentElement.getAttribute('itemprop') === 'articleBody'
      ) {
        this.article.element = t.parentElement
        return
      }
      t = this.article.element
      if (t.getAttribute('id') || !t.className) return
      var n = t.tagName,
        r = t.className,
        i = t.parentElement,
        s = i.children
      for (var o = 0, u = s.length; o < u; ++o) {
        var a = s[o]
        if (a === t) continue
        if (a.tagName !== n || a.className !== r) continue
        var f = CandidateElement.candidateIfElementIsViable(
          a,
          this.contentDocument,
          !0
        )
        if (!f || f.finalScore() < ReaderMinimumScore) continue
        this.article.element = i
        return
      }
    },
    findArticleBySearchingWhitelist: function () {
      var t = ListOfHostnameAndTrustedArticleNodeSelectorPairs.length
      for (var n = 0; n < t; ++n) {
        var r = ListOfHostnameAndTrustedArticleNodeSelectorPairs[n],
          i = r[0]
        if (!i.test(this.contentDocument.location.hostname)) continue
        var s = r[1],
          o = this.contentDocument.querySelectorAll(s)
        if (o.length === 1)
          return new CandidateElement(o[0], this.contentDocument)
      }
      return null
    },
    articleNode: function (t) {
      return (
        this.didSearchForArticleNode ||
          ((this.article = this.findArticleBySearchingWhitelist()),
          this.article ||
            (this.article = this.findArticleBySearchingAllElements()),
          this.article ||
            (this.article = this.findArticleByVisualExamination()),
          !this.article &&
            t &&
            (this.article = this.findArticleBySearchingAllElements(!0)),
          this.adjustArticleNode(),
          (this.didSearchForArticleNode = !0),
          this.article && this.articleIsLTR()),
        this.article ? this.article.element : null
      )
    },
    extraArticleNode: function () {
      return (
        this.didSearchForArticleNode || this.articleNode(),
        this.didSearchForExtraArticleNode ||
          ((this.extraArticle = this.findExtraArticle()),
          (this.didSearchForExtraArticleNode = !0)),
        this.extraArticle ? this.extraArticle.element : null
      )
    },
    cacheWindowScrollPosition: function () {
      ;(this._cachedScrollY = window.scrollY),
        (this._cachedScrollX = window.scrollX)
    },
    contentTextStyle: function () {
      return this._cachedContentTextStyle
        ? this._cachedContentTextStyle
        : ((this._cachedContentTextStyle = contentTextStyleForNode(
            this.contentDocument,
            this.articleNode()
          )),
          this._cachedContentTextStyle ||
            (this._cachedContentTextStyle = getComputedStyle(
              this.articleNode()
            )),
          this._cachedContentTextStyle)
    },
    commaCountIsLessThan: function (t, n) {
      var r = 0,
        i = t.textContent,
        s = -1
      while (r < n && (s = i.indexOf(',', s + 1)) >= 0) r++
      return r < n
    },
    calculateLinkDensity: function (t) {
      var n = removeWhitespace(t.textContent).length
      if (!n) return 0
      var r = t.getElementsByTagName('a'),
        i = 0,
        s = r.length
      for (var o = 0; o < s; ++o) i += removeWhitespace(r[o].textContent).length
      return i / n
    },
    shouldPruneElement: function (t, n) {
      const r = 0.33,
        i = 0.5,
        s = 0.2,
        o = 25,
        u = 4e4
      var a = t.tagName
      if (!t.parentElement) return !1
      if (a === 'IFRAME') return shouldPruneIframe(t, this.contentDocument)
      if (a !== 'OBJECT' && a !== 'EMBED' && a !== 'CANVAS') {
        var f = !1,
          l = t.childNodes.length
        for (var c = 0; c < l; ++c) {
          var h = t.childNodes[c],
            p = h.nodeType
          if (
            p === Node.ELEMENT_NODE ||
            (p === Node.TEXT_NODE && !isNodeWhitespace(h))
          ) {
            f = !0
            break
          }
        }
        if (!f) {
          if (a === 'P') {
            var d = t.previousSibling,
              v = t.nextSibling
            if (
              d &&
              d.nodeType === Node.TEXT_NODE &&
              !isNodeWhitespace(d) &&
              v &&
              v.nodeType === Node.TEXT_NODE &&
              !isNodeWhitespace(v)
            )
              return !1
          }
          return !0
        }
        if (a === 'P') return !1
      }
      if (a === 'CANVAS') return t.parentNode.tagName === 'CUFON'
      var m = 0
      if (n) {
        if (VeryNegativeClassNameRegEx.test(n.className)) return !0
        var g = n.className,
          y = n.getAttribute('id')
        PositiveRegEx.test(g) && m++,
          PositiveRegEx.test(y) && m++,
          NegativeRegEx.test(g) && m--,
          NegativeRegEx.test(y) && m--
      }
      if (m < 0) return !0
      if (t.querySelector('.tweet-wrapper')) return !1
      if (a === 'UL' || a === 'OL') {
        if (n.querySelector('iframe') && n.querySelector('script')) return !0
        var b = n.children,
          w = b.length
        if (!w) return !0
        var E = 0,
          S = 0
        for (var c = 0; c < w; ++c)
          SharingRegex.test(b[c].className) && E++,
            NegativeRegEx.test(b[c].className) && S++
        return E / w >=
          MinimumRatioOfListItemsBeingRelatedToSharingToPruneEntireList
          ? !0
          : S / w >=
            MinimumRatioOfListItemsBeingRelatedToSharingToPruneEntireList
          ? !0
          : !1
      }
      if (a === 'OBJECT') {
        var x = t.querySelector('embed[src]'),
          T = x ? anchorForURL(x.src, this.contentDocument) : null
        if (T && HostnamesKnownToContainEmbeddableMediaRegex.test(T.hostname))
          return !1
        var N = t.getAttribute('data')
        return (
          (T = N ? anchorForURL(N, this.contentDocument) : null),
          T && HostnamesKnownToContainEmbeddableMediaRegex.test(T.hostname)
            ? !1
            : !0
        )
      }
      if (t.childElementCount === 1) {
        var C = t.firstElementChild
        if (C.tagName === 'A') return !1
        if (
          C.tagName === 'SPAN' &&
          C.className === 'converted-anchor' &&
          nearestAncestorElementWithTagName(C, 'TABLE')
        )
          return !1
      }
      var k = t.getElementsByTagName('img'),
        L = k.length
      if (L) {
        var A = 0
        for (var c = 0; c < L; ++c) {
          var O = k[c].originalElement
          if (!isElementVisible(O)) continue
          var M = cachedElementBoundingRect(O)
          A += (M.width / L) * (M.height / L)
        }
        if (A > u) return !1
      }
      if (!this.commaCountIsLessThan(t, 10)) return !1
      var _ = t.getElementsByTagName('p').length,
        D = t.getElementsByTagName('br').length,
        P = _ + Math.floor(D / 2)
      if (L > P) return !0
      if (t.getElementsByTagName('li').length > P) return !0
      if (t.getElementsByTagName('input').length / P > r) return !0
      if (t.textContent.length < o && L !== 1) return !0
      if (t.querySelector('embed')) return !0
      var H = this.calculateLinkDensity(t)
      if (m >= 1 && H > i) return !0
      if (m < 1 && H > s) return !0
      if (a === 'TABLE') {
        var B = removeWhitespace(t.innerText).length,
          j = removeWhitespace(n.innerText).length
        if (B <= j * 0.5) return !0
      }
      return !1
    },
    wordCountIsLessThan: function (t, n) {
      var r = 0,
        i = t.textContent,
        s = -1
      while ((s = i.indexOf(' ', s + 1)) >= 0 && r < n) r++
      return r < n
    },
    leadingImageIsAppropriateWidth: function (t) {
      return !this.article || !t
        ? !1
        : t.getBoundingClientRect().width >=
            this.article.element.getBoundingClientRect().width -
              ToleranceForLeadingImageWidthToArticleWidthForFullWidthPresentation
    },
    newDivFromNode: function (t) {
      var n = this.contentDocument.createElement('div')
      return t && (n.innerHTML = t.innerHTML), n
    },
    adoptableLeadingImage: function () {
      const t = 5,
        n = /credit/,
        r = /caption/,
        i = /src|alt/
      if (
        !this.article ||
        !this.leadingImage ||
        !this.leadingImageIsAppropriateWidth(this.leadingImage)
      )
        return null
      var s = this.leadingImage.parentNode,
        o = null,
        u = null,
        a = s.children.length
      if (s.tagName === 'DIV' && a > 1 && a < t) {
        var f = s.cloneNode(!0).querySelectorAll('p, div'),
          l = f.length
        for (var c = 0; c < l; ++c) {
          var h = f[c]
          n.test(h.className)
            ? (o = h.cloneNode(!0))
            : r.test(h.className) && (u = h.cloneNode(!0))
        }
      }
      var p = this.leadingImage.cloneNode(!1),
        d = p.attributes
      for (var c = 0; c < d.length; ++c) {
        var v = d[c].nodeName
        i.test(v) || (p.removeAttribute(v), c--)
      }
      var m = this.contentDocument.createElement('div')
      ;(m.className = 'leading-image'), m.appendChild(p)
      if (o) {
        var g = this.newDivFromNode(o)
        ;(g.className = 'credit'), m.appendChild(g)
      }
      if (u) {
        var y = this.newDivFromNode(u)
        ;(y.className = 'caption'), m.appendChild(y)
      }
      return m
    },
    adoptableArticle: function (t) {
      if (this._adoptableArticle) return this._adoptableArticle.cloneNode(!0)
      clearCachedElementBoundingRects(), this.cacheWindowScrollPosition()
      var n = this.articleNode(t)
      this._adoptableArticle = n ? n.cloneNode(!0) : null
      if (!this._adoptableArticle) return this._adoptableArticle
      ;(this._articleBoundingRect = cachedElementBoundingRect(
        this.article.element
      )),
        (this._adoptableArticle = this.cleanArticleNode(
          n,
          this._adoptableArticle,
          !1
        ))
      if (this._adoptableArticle.tagName === 'P') {
        var r = document.createElement('div')
        r.appendChild(this._adoptableArticle), (this._adoptableArticle = r)
      }
      var i = this.extraArticleNode()
      if (i) {
        var s = this.cleanArticleNode(i, i.cloneNode(!0), !0)
        s &&
          (this.extraArticle.isPrepended
            ? this._adoptableArticle.insertBefore(
                s,
                this._adoptableArticle.firstChild
              )
            : this._adoptableArticle.appendChild(s))
        var o = cachedElementBoundingRect(this.article.element),
          u = cachedElementBoundingRect(this.extraArticle.element),
          a = {
            top: Math.min(o.top, u.top),
            right: Math.max(o.right, u.right),
            bottom: Math.max(o.bottom, u.bottom),
            left: Math.min(o.left, u.left),
          }
        ;(a.width = a.right - a.left),
          (a.height = a.bottom - a.top),
          (this._articleBoundingRect = a)
      }
      this._articleTextContent = this._adoptableArticle.innerText
      var f = this.adoptableLeadingImage()
      return (
        f &&
          this._adoptableArticle.insertBefore(
            f,
            this._adoptableArticle.firstChild
          ),
        this._adoptableArticle
      )
    },
    elementPinToEdge: function (t) {
      const n = {
          AREA: 1,
          BR: 1,
          CANVAS: 1,
          EMBED: 1,
          FRAME: 1,
          HR: 1,
          IMG: 1,
          INPUT: 1,
        },
        r = 120
      if (window.scrollY < r) return null
      var i = cachedElementBoundingRect(t),
        s = t.ownerDocument.elementFromPoint((i.left + i.right) / 2, 0)
      s && s.tagName in n && (s = s.parentElement)
      var o = s
      while (o && o !== t) o = o.parentNode
      return o ? s : null
    },
    dominantContentSelectorAndDepth: function (e) {
      const t = 2
      var n = {},
        r = {}
      walkElementSubtree(e, t, function (e, t) {
        if (!isElementVisible(e)) return
        var i = selectorForElement(e) + ' | ' + t
        r[i] ? (r[i] += 1) : ((r[i] = 1), (n[i] = e))
      })
      var i,
        s = arrayOfKeysAndValuesOfObjectSortedByValueDescending(r)
      switch (s.length) {
        case 0:
          break
        case 1:
          i = s[0].key
          break
        default:
          var o = s[0]
          o.value > s[1].value && (i = o.key)
      }
      if (!i) return null
      var u = n[i]
      return {
        selector: selectorForElement(u),
        depth: depthOfElementWithinElement(u, e),
      }
    },
    functionToPreventPruningElementDueToInvisibility: function () {
      const e = [
        [
          /nytimes.com/,
          function (e, t) {
            var n = e
            if (!t) return !1
            while (n && n !== t) {
              if (n.classList.contains('hidden')) return !0
              n = n.parentElement
            }
            return !1
          },
        ],
      ]
      var t = e.length
      for (var n = 0; n < t; ++n) {
        var r = e[n],
          i = r[0]
        if (i.test(this.contentDocument.location.hostname)) return r[1]
      }
      return function () {
        return !1
      }
    },
    cleanArticleNode: function (t, n, r) {
      function S(e) {
        ;(f += e), l && (l += e), c && (c += e), h && (h += e), p && (p += e)
      }
      function x() {
        l === 1 && (l = 0),
          c === 1 && (c = 0),
          h === 1 && (h = 0),
          p === 1 && (p = 0)
      }
      function T() {
        const e = 0.8
        var n = cachedElementBoundingRect(t)
        if (n.width === 0 || n.height === 0) return !0
        var r = childrenWithParallelStructure(t),
          i = r.length,
          s
        if (i) {
          s = []
          for (var o = 0; o < i; ++o) {
            var u = r[o]
            if (getComputedStyle(u).float === 'none') {
              var a = u.children,
                f = a.length
              for (var l = 0; l < f; ++l) s.push(a[l])
            } else s.push(u)
          }
        } else s = t.children
        var c = s.length,
          h = 0
        for (var o = 0; o < c; ++o) {
          var p = s[o]
          getComputedStyle(p).float !== 'none' && (h += p.innerText.length)
        }
        var d = t.innerText.length,
          v = h / d
        return v > e
      }
      function N(e) {
        const n = 50
        if (cachedElementBoundingRect(e).height > n) return !1
        const r = {
          UL: 1,
          LI: 1,
          NAV: 1,
        }
        return r[e.tagName]
          ? !0
          : e.parentElement === t && !e.nextElementSibling
          ? !0
          : !1
      }
      const i = {
          FORM: 1,
          SCRIPT: 1,
          STYLE: 1,
          LINK: 1,
        },
        s = {
          DIV: 1,
          TABLE: 1,
          OBJECT: 1,
          UL: 1,
          CANVAS: 1,
          P: 1,
          IFRAME: 1,
          ASIDE: 1,
          SECTION: 1,
          FOOTER: 1,
          NAV: 1,
          OL: 1,
        },
        o = {
          I: 1,
          EM: 1,
        },
        u = {
          B: 1,
          STRONG: 1,
          H1: 1,
          H2: 1,
          H3: 1,
          H4: 1,
          H5: 1,
          H6: 1,
        }
      var a = [],
        f = 0,
        l = 0,
        c = 0,
        h = 0,
        p = 0,
        d = t,
        v = d.ownerDocument.defaultView,
        m = n,
        g = this.articleTitle(),
        y = this._articleTitleElement,
        b = this.elementPinToEdge(t),
        w = null,
        E = isElementVisible(t),
        C = this.dominantContentSelectorAndDepth(t),
        k = T(),
        L = new Set()
      this.previouslyDiscoveredPageURLStrings.forEach(function (e) {
        L.add(e)
      })
      var A = this.nextPageURL()
      A && L.add(A)
      var O = null
      this._articleTitleElement &&
        (O = cachedElementBoundingRect(this._articleTitleElement))
      var M = this.functionToPreventPruningElementDueToInvisibility()
      while (d) {
        var _ = null,
          D = m.tagName
        ;(m.originalElement = d),
          d === b && (w = m),
          D in i && (_ = m),
          !_ && d === y && (_ = m)
        if (!_ && (D === 'H1' || D === 'H2')) {
          var P = d.offsetTop - t.offsetTop
          if (P < HeaderMinimumDistanceFromArticleTop) {
            var H = innerTextOrTextContent(d),
              B = H.length * HeaderLevenshteinDistanceToLengthRatio
            levenshteinDistance(g, H) <= B && (_ = m)
          }
        }
        _ ||
          (this.isMediaWikiPage() && /editsection/.test(d.className) && (_ = m))
        var j
        _ || (j = getComputedStyle(d))
        if (!_ && D === 'DIV' && m.parentNode) {
          var F = d.querySelectorAll(
              'a, blockquote, dl, div, img, ol, p, pre, table, ul'
            ),
            I = l || j['float'] !== 'none'
          if (!I && !F.length) {
            var q = m.parentNode,
              R = this.contentDocument.createElement('p')
            while (m.firstChild) {
              var U = m.firstChild
              R.appendChild(U)
            }
            q.replaceChild(R, m),
              w === m && (w = R),
              (m = R),
              (m.originalElement = d),
              (D = m.tagName)
          }
        }
        !_ && m.parentNode && D in s && a.push(m)
        if (!_) {
          if (E) {
            var z =
              j.display === 'none' ||
              j.visibility !== 'visible' ||
              computedStyleIndicatesElementIsInvisibleDueToClipping(j)
            if (z) {
              var W = C
                ? f === C.depth && selectorForElement(d) === C.selector
                : !1
              !W && !M(d, t) && (_ = m)
            }
          }
          isElementPositionedOffScreen(d)
            ? (_ = m)
            : d !== t &&
              !l &&
              j['float'] !== 'none' &&
              !k &&
              (cachedElementBoundingRect(d).height >= FloatMinimumHeight ||
                d.childElementCount > 1) &&
              (l = 1)
        }
        if (!_) {
          var X = m.attributes
          for (var V = 0; V < X.length; ++V) {
            var $ = X[V].nodeName
            AttributesToRemoveRegEx.test($) && (m.removeAttribute($), V--)
          }
          j.clear === 'both' && m.classList.add('clear')
          if (
            (D === 'UL' || D === 'OL') &&
            j['list-style-type'] === 'none' &&
            j['background-image'] === 'none'
          ) {
            var J = d.children,
              K = J.length,
              Q = !0
            for (var V = 0; V < K; ++V) {
              var G = getComputedStyle(J[V])
              if (
                G['list-style-type'] !== 'none' ||
                parseInt(G['-webkit-padding-start']) !== 0
              ) {
                Q = !1
                break
              }
            }
            Q && m.classList.add('list-style-type-none')
          }
          !h &&
            j.fontStyle !== 'normal' &&
            (D in o || (m.style.fontStyle = j.fontStyle), (h = 1)),
            !p &&
              j.fontWeight !== 'normal' &&
              (D in u || (m.style.fontWeight = j.fontWeight), (p = 1))
          if (l) {
            l === 1 &&
              (cachedElementBoundingRect(d).width <= MaximumFloatWidth
                ? m.setAttribute('class', 'auxiliary float ' + j['float'])
                : m.classList.add('auxiliary'))
            var Y = d.style.getPropertyValue('width')
            if (Y) m.style.width = Y
            else {
              if (v && v.getMatchedCSSRules) {
                var Z = v.getMatchedCSSRules(d, '', !0)
                if (Z) {
                  var et = Z.length
                  for (var V = et - 1; V >= 0; --V) {
                    Y = Z[V].style.getPropertyValue('width')
                    if (Y) {
                      m.style.width = Y
                      break
                    }
                  }
                }
              }
            }
            l === 1 &&
              !Y &&
              (m.style.width = cachedElementBoundingRect(d).width + 'px')
            var tt = m.parentNode === n ? 36 : 12,
              nt = m.style.width
            nt &&
              parseInt(nt) >= screen.width - tt &&
              m.setAttribute('class', 'large-element')
          }
          if (D === 'TABLE') c || (c = 1)
          else if (D === 'VIDEO') {
            var rt = cachedElementBoundingRect(d)
            const it = 36
            rt.width > screen.width - it &&
              m.setAttribute('class', 'large-element')
          } else if (D === 'IMG') {
            var st = !1,
              ot = X.length
            for (var V = 0; V < ot; ++V) {
              var $ = X[V].nodeName
              if (KnownImageLazyLoadingAttributes[$.toLowerCase()]) {
                m.setAttribute('src', m.getAttribute($)), (st = !0)
                break
              }
            }
            m.removeAttribute('border'),
              m.removeAttribute('hspace'),
              m.removeAttribute('vspace')
            var ut = m.getAttribute('align')
            m.removeAttribute('align')
            if (ut === 'left' || ut === 'right')
              m.classList.add('float'), m.classList.add(ut)
            if (!l && !st) {
              var at = cachedElementBoundingRect(d),
                ft = at.width,
                lt = at.height
              ft === 1 && lt === 1
                ? (_ = m)
                : O &&
                  lt < MinimumHeightForImagesAboveTheArticleTitle &&
                  at.bottom < O.top
                ? (_ = m)
                : ft < ImageSizeTiny &&
                  lt < ImageSizeTiny &&
                  m.setAttribute('class', 'reader-image-tiny')
            }
          } else if (D === 'FONT')
            m.removeAttribute('size'),
              m.removeAttribute('face'),
              m.removeAttribute('color')
          else if (D === 'A' && m.parentNode) {
            var ct = m.getAttribute('href')
            if (
              ct &&
              ct.length &&
              (ct[0] === '#' || ct.substring(0, 11) === 'javascript:')
            ) {
              if (
                !c &&
                !m.childElementCount &&
                m.parentElement.childElementCount === 1 &&
                m.parentElement.tagName !== 'LI'
              ) {
                var ht = this.contentDocument.evaluate(
                  'text()',
                  m.parentElement,
                  null,
                  XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                  null
                )
                ht.snapshotLength || (_ = m)
              }
              if (!_) {
                var R = this.contentDocument.createElement('span')
                if (
                  m.childElementCount === 1 &&
                  m.firstElementChild.tagName === 'IMG'
                ) {
                  var pt = m.firstElementChild
                  pt.width > AnchorImageMinimumWidth &&
                    pt.height > AnchorImageMinimumHeight &&
                    R.setAttribute('class', 'converted-image-anchor')
                }
                R.className || R.setAttribute('class', 'converted-anchor')
                while (m.firstChild) R.appendChild(m.firstChild)
                m.parentNode.replaceChild(R, m), (m = R), w === m && (w = R)
              }
            }
          }
        }
        !_ && elementIsCommentBlock(d) && (_ = m)
        if (!_ && D === 'A' && L.has(d.href)) {
          var dt = d,
            vt = m,
            mt,
            gt
          while ((dt = dt.parentElement) && (vt = vt.parentElement)) {
            const yt = 10
            if (
              cachedElementBoundingRect(dt).top -
                cachedElementBoundingRect(d).top >
              yt
            )
              break
            if (dt === t) break
            N(dt) && ((mt = dt), (gt = vt))
          }
          mt &&
            ((_ = gt),
            (d = mt),
            (m = gt),
            (m.originalElement = d),
            (D = m.tagName)),
            (dt = null),
            (vt = null),
            (mt = null),
            (gt = null)
        }
        var bt = _ ? null : d.firstElementChild
        if (bt) (d = bt), (m = m.firstElementChild), S(1)
        else {
          var wt
          while (d !== t && !(wt = d.nextElementSibling))
            (d = d.parentElement), (m = m.parentElement), S(-1)
          if (d === t) {
            if (_)
              if (_.parentElement) _.remove()
              else if (r) return null
            break
          }
          ;(d = wt), (m = m.nextElementSibling), x()
        }
        if (_)
          if (_.parentElement) _.remove()
          else if (r) return null
      }
      var Et = n.querySelectorAll('iframe'),
        St = Et.length
      for (var V = 0; V < St; ++V) {
        var xt = Et[V]
        if (elementLooksLikeEmbeddedTweet(xt.originalElement)) {
          var Tt = this.adoptableSimpleTweetFromTwitterIframe(xt)
          Tt && xt.parentElement.replaceChild(Tt, xt)
        }
      }
      for (var V = a.length - 1; V >= 0; --V) {
        var Nt = a[V]
        Nt.parentNode &&
          this.shouldPruneElement(Nt, Nt.originalElement) &&
          (w === Nt && ((w = Nt.nextElementSibling) || (w = Nt.parentElement)),
          Nt.remove())
      }
      var Ct = n.querySelectorAll('.float')
      for (var V = 0; V < Ct.length; ++V) {
        var kt = !1,
          Lt = Ct[V]
        if (!kt) {
          var At = Lt.querySelectorAll('a, span.converted-image-anchor'),
            Ot = Lt.querySelectorAll('span.converted-anchor')
          kt = Lt.parentNode && Ot.length > At.length
        }
        if (!kt) {
          var Mt = Lt.querySelectorAll('embed, object').length,
            _t = Lt.originalElement.querySelectorAll('embed, object').length
          !Mt && _t && (kt = !0)
        }
        if (!kt) {
          var Dt = Lt.originalElement.getElementsByTagName('img'),
            Pt = Dt.length,
            Ht = 0
          for (var Bt = 0; Bt < Pt; ++Bt) {
            E && isElementVisible(Dt[Bt]) && Ht++
            if (Ht > 1) break
          }
          if (Ht === 1) {
            var jt = Lt.getElementsByTagName('img').length
            jt || (kt = !0)
          }
        }
        kt &&
          (w === Lt && ((w = Lt.nextElementSibling) || (w = Lt.parentElement)),
          Lt.remove())
      }
      if (r && !removeWhitespace(n.innerText).length) return null
      if (w) {
        var Ft = document.createElement('div'),
          It = w.originalElement.getBoundingClientRect(),
          qt = It.height > 0 ? (It.top * 100) / It.height : 0
        ;(Ft.style.position = 'relative'),
          (Ft.style.top = Math.round(-qt) + '%'),
          Ft.setAttribute('id', 'safari-reader-element-marker'),
          w.insertBefore(Ft, w.firstChild)
      }
      return n
    },
    adoptableSimpleTweetFromTwitterIframe: function (t) {
      var n = t.originalElement.contentDocument.documentElement,
        r = n.querySelector('[data-tweet-id].expanded')
      if (!r) return null
      var i = this.contentDocument.createElement('div')
      i.classList.add('tweet-wrapper')
      var s = this.contentDocument.createElement('blockquote')
      s.classList.add('simple-tweet'), i.appendChild(s)
      var o = r.getAttribute('data-tweet-id')
      i.setAttribute('data-reader-tweet-id', o)
      var u = r.querySelector('.dateline'),
        a = r.querySelector('[data-scribe="element:screen_name"]'),
        f = r.querySelector('[data-scribe="element:name"]'),
        l = r.querySelector('.e-entry-title')
      if (!u || !a || !f || !l) return i
      var c = '&mdash; ' + f.innerText + ' (' + a.innerText + ')',
        h = this.contentDocument.createElement('p')
      ;(h.innerHTML = l.innerHTML),
        s.appendChild(h),
        s.insertAdjacentHTML('beforeend', c)
      var p = this.contentDocument.createElement('span')
      ;(p.innerHTML = u.innerHTML), s.appendChild(p)
      var d = s.querySelectorAll('img.twitter-emoji'),
        v = d.length
      for (var m = 0; m < v; ++m) {
        var g = d[m],
          y = g.getAttribute('alt')
        if (y && y.length > 0) {
          var b = this.contentDocument.createElement('span')
          ;(b.innerText = y), g.parentNode.replaceChild(b, g)
        }
      }
      return i
    },
    leadingImageNode: function () {
      const t = 250,
        n = 0.5,
        r = 3
      if (!this.article || !this.article.element) return null
      var i = this.article.element
      for (var s = 0; s < r; ++s) {
        if (!i.parentNode) break
        i = i.parentNode
        var o = i.getElementsByTagName('img')[0]
        if (o) {
          var u = cachedElementBoundingRect(o)
          if (u.height >= t && u.width >= this._articleWidth * n) {
            var a = this.article.element.compareDocumentPosition(o)
            if (
              !(a & DocumentPositionPreceding) ||
              a & DocumentPositionContainedBy
            )
              continue
            a = this.extraArticle
              ? this.extraArticle.element.compareDocumentPosition(o)
              : null
            if (
              a &&
              (!(a & DocumentPositionPreceding) ||
                a & DocumentPositionContainedBy)
            )
              continue
            return o
          }
        }
      }
      return null
    },
    mainImageNode: function () {
      var t = this.leadingImageNode()
      if (t) return t
      if (this.article && this.article.element) {
        var n = this.article.element.querySelectorAll('img'),
          r = n.length
        for (var i = 0; i < r; ++i) {
          var s = n[i],
            o = s._cachedElementBoundingRect
          o || (o = s.getBoundingClientRect())
          if (
            o.width >= MainImageMinimumWidthAndHeight &&
            o.height >= MainImageMinimumWidthAndHeight
          )
            return s
        }
      }
      return null
    },
    articleTitle: function () {
      function m(e, t) {
        var n = e ? t.indexOf(e) : -1
        return n !== -1 && (n === 0 || n + e.length === t.length)
      }
      function g(e, t) {
        return e.host === t.host && e.pathname === t.pathname
      }
      if (!this.articleNode()) return
      if (this._articleTitle) return this._articleTitle
      const t = 500,
        n = 20,
        r = 8,
        i = 1.1,
        s = 1.25,
        o = /header|title|headline|instapaper_title/i,
        u = 1.5,
        a = 1.8,
        f = 1.5,
        l = 0.6,
        c = 3,
        h = 1.5,
        p = 9,
        d = 1.5,
        v = /byline|author/i
      var y = function (e) {
          var t = this.contentDocument.querySelector(e),
            n = t && t.attributes.length === 2 ? t.content : null
          if (n) {
            var r = this.articleTitleAndSiteNameFromTitleString(n)
            r && (n = r.articleTitle)
          }
          return n
        }.bind(this),
        b = this.contentDocument.title,
        w = y("head meta[property='og:title']"),
        E = y("head meta[name='twitter:title']"),
        S = cachedElementBoundingRect(this.articleNode())
      this.extraArticleNode() &&
        this.extraArticle.isPrepended &&
        (S = cachedElementBoundingRect(this.extraArticleNode()))
      var x = S.left + S.width / 2,
        T = S.top,
        N = T
      ;(this._articleWidth = S.width),
        (this.leadingImage = this.leadingImageNode())
      if (this.leadingImage) {
        var C = cachedElementBoundingRect(this.leadingImage)
        N = (C.top + T) / 2
      }
      var k =
          'h1, h2, h3, h4, h5, .headline, .article_title, #hn-headline, .inside-head, .instapaper_title',
        L = this.article.element.tagName
      if (L === 'DL' || L === 'DD') k += ', dt'
      var A = this.contentDocument.querySelectorAll(k)
      A = Array.prototype.slice.call(A, 0)
      var O = this.contentDocument.location,
        M = this.article.element.getElementsByTagName('a')
      for (var _ = 0; _ < M.length; _++) {
        var D = M[_]
        if (D.offsetTop > this.articleNode().offsetTop + n) break
        if (g(D, O)) {
          A.push(D)
          break
        }
      }
      var P,
        H = A.map(innerTextOrTextContent),
        B = A.length,
        j = 0,
        F = [],
        I = [],
        q = []
      for (var _ = 0; _ < B; ++_) {
        var R = A[_],
          U = H[_],
          z = stringSimilarity(b, U)
        if (w) {
          var W = stringSimilarity(w, U)
          ;(z += W),
            W > StringSimilarityToDeclareStringsNearlyIdentical && I.push(R)
        }
        if (E) {
          var X = stringSimilarity(E, U)
          ;(z += X),
            X > StringSimilarityToDeclareStringsNearlyIdentical && q.push(R)
        }
        z === j ? F.push(R) : z > j && ((j = z), (F = [R]))
      }
      I.length === 1
        ? ((P = I[0]), (P.headerText = innerTextOrTextContent(P)))
        : q.length === 1 &&
          ((P = q[0]), (P.headerText = innerTextOrTextContent(P)))
      if (!P)
        for (var _ = 0; _ < B; ++_) {
          var R = A[_]
          if (!isElementVisible(R)) continue
          var V = cachedElementBoundingRect(R),
            $ = V.left + V.width / 2,
            J = V.top + V.height / 2,
            K = $ - x,
            Q = J - N,
            G = I.indexOf(R) !== -1,
            Y = q.indexOf(R) !== -1,
            Z = R.classList.contains('instapaper_title'),
            et = R.getAttribute('itemprop') === 'headline',
            tt = G || Y || Z || et,
            nt = Math.sqrt(K * K + Q * Q),
            rt = tt ? t : Math.max(t - nt, 0),
            U = H[_],
            it = R.getAttribute('property')
          if (it) {
            var st = /dc.title/i.exec(it)
            if (st && st[0]) {
              var ot = this.contentDocument.querySelectorAll(
                '*[property~="' + st[0] + '"]'
              )
              if (ot.length === 1) {
                ;(P = R), (P.headerText = U)
                break
              }
            }
          }
          if (v.test(R.className)) continue
          if (!tt) {
            if (nt > t) continue
            if ($ < S.left || $ > S.right) continue
          }
          if (b && stringsAreNearlyIdentical(U, b)) rt *= c
          else if (m(U, b)) rt *= h
          else if (U.length < r) continue
          var ut = !1,
            at = nearestAncestorElementWithTagName(R, 'A')
          at || (at = R.querySelector('a'))
          if (at) {
            var ft = at.host === O.host,
              lt = at.pathname === O.pathname
            if (ft && lt) rt *= f
            else {
              if (ft && nearestAncestorElementWithTagName(R, 'LI')) continue
              ;(rt *= l), (ut = !0)
            }
          }
          var ct = fontSizeFromComputedStyle(getComputedStyle(R))
          ut || (rt *= ct / BaseFontSize),
            (rt *= 1 + TitleCandidateDepthScoreMultiplier * elementDepth(R))
          var ht = parseInt(this.contentTextStyle().fontSize)
          parseInt(ct) > ht * i && (rt *= s)
          if (o.test(R.className) || o.test(R.getAttribute('id'))) rt *= u
          var pt = R.parentElement
          pt &&
            (o.test(pt.className) || o.test(pt.getAttribute('id'))) &&
            (rt *= u),
            F.indexOf(R) !== -1 && (rt *= a)
          if (!P || rt > P.headerScore)
            (P = R), (P.headerScore = rt), (P.headerText = U)
        }
      P &&
        domDistance(P, this.articleNode(), p + 1) > p &&
        parseInt(getComputedStyle(P).fontSize) < d * ht &&
        (P = null)
      if (P) {
        this._articleTitleElement = P
        var dt = P.headerText.trim()
        w && m(w, dt)
          ? (this._articleTitle = w)
          : b && m(b, dt)
          ? (this._articleTitle = b)
          : (this._articleTitle = dt)
      }
      return (
        this._articleTitle ||
          (w && m(w, b) ? (this._articleTitle = w) : (this._articleTitle = b)),
        this._articleTitle
      )
    },
    articleIsLTR: function () {
      if (!this._articleIsLTR) {
        var t = getComputedStyle(this.article.element)
        this._articleIsLTR = t ? t.direction === 'ltr' : !0
      }
      return this._articleIsLTR
    },
    findSuggestedCandidate: function () {
      var t = this.suggestedRouteToArticle
      if (!t || !t.length) return null
      var n, r
      for (r = t.length - 1; r >= 0; --r)
        if (t[r].id) {
          n = this.contentDocument.getElementById(t[r].id)
          if (n) break
        }
      r++, n || (n = this.contentDocument)
      while (r < t.length) {
        var i = t[r],
          s =
            n.nodeType === Node.DOCUMENT_NODE
              ? n.documentElement
              : n.firstElementChild
        for (var o = 1; s && o < i.index; s = s.nextElementSibling)
          this.shouldIgnoreInRouteComputation(s) || o++
        if (!s) return null
        if (s.tagName !== i.tagName) return null
        if (i.className && s.className !== i.className) return null
        ;(n = s), r++
      }
      return isElementVisible(n)
        ? new CandidateElement(n, this.contentDocument)
        : null
    },
    canRunReaderDetection: function () {
      var e = this.contentDocument.location.hostname,
        t = this.contentDocument.location.pathname
      for (var n in BlacklistedHostsAllowedPathRegexMap) {
        var r = new RegExp(n.escapeForRegExp())
        if (!r.test(e)) continue
        var i = BlacklistedHostsAllowedPathRegexMap[n]
        return i instanceof RegExp ? i.test(t) : !1
      }
      return !0
    },
    findArticleBySearchingAllElements: function (t) {
      var n = this.findSuggestedCandidate(),
        r = this.findCandidateElements()
      if (!r || !r.length) return n
      if (n && n.basicScore() >= ReaderMinimumScore) return n
      var i = this.highestScoringCandidateFromCandidates(r)
      for (var s = i.element; s !== this.contentDocument; s = s.parentNode)
        if (s.tagName === 'BLOCKQUOTE') {
          var o = s.parentNode,
            u = r.length
          for (var a = 0; a < u; ++a) {
            var f = r[a]
            if (f.element === o) {
              i = f
              break
            }
          }
          break
        }
      if (n && i.finalScore() < ReaderMinimumScore) return n
      if (!t) {
        if (i.shouldDisqualifyDueToScoreDensity()) return null
        if (i.shouldDisqualifyDueToHorizontalRuleDensity()) return null
        if (i.shouldDisqualifyDueToHeaderDensity()) return null
        if (i.shouldDisqualifyDueToSimilarElements(r)) return null
      }
      return i
    },
    findExtraArticle: function () {
      if (!this.article) return null
      for (
        var t = 0, n = this.article.element;
        t < 3 && n;
        ++t, n = n.parentNode
      ) {
        var r = this.findExtraArticleCandidateElements(n)
        if (!r || !r.length) continue
        var i = this.sortCandidateElementsInDescendingScoreOrder(r),
          s
        for (var o = 0; o < i.length; o++) {
          s = i[o]
          if (!s || !s.basicScore()) break
          if (s.shouldDisqualifyDueToScoreDensity()) continue
          if (s.shouldDisqualifyDueToHorizontalRuleDensity()) continue
          if (s.shouldDisqualifyDueToHeaderDensity()) continue
          if (
            cachedElementBoundingRect(s.element).height <
              PrependedArticleCandidateMinimumHeight &&
            cachedElementBoundingRect(this.article.element).width !==
              cachedElementBoundingRect(s.element).width
          )
            continue
          var u = contentTextStyleForNode(this.contentDocument, s.element)
          if (!u) continue
          if (
            u.fontFamily !== this.contentTextStyle().fontFamily ||
            u.fontSize !== this.contentTextStyle().fontSize
          )
            continue
          if (s) return s
        }
      }
      return null
    },
    highestScoringCandidateFromCandidates: function (t) {
      var n = 0,
        r = null,
        i = t.length
      for (var s = 0; s < i; ++s) {
        var o = t[s],
          u = o.basicScore()
        u >= n && ((n = u), (r = o))
      }
      return r
    },
    sortCandidateElementsInDescendingScoreOrder: function (t) {
      function n(e, t) {
        return e.basicScore() !== t.basicScore()
          ? t.basicScore() - e.basicScore()
          : t.depth() - e.depth()
      }
      return t.sort(n)
    },
    findCandidateElements: function () {
      const t = 1e3
      var n = Date.now() + t,
        r = this.contentDocument.getElementsByTagName('*'),
        i = r.length,
        s = []
      for (var o = 0; o < i; ++o) {
        var u = r[o]
        if (CandidateTagNamesToIgnore[u.tagName]) continue
        var a = CandidateElement.candidateIfElementIsViable(
          u,
          this.contentDocument
        )
        a && s.push(a)
        if (Date.now() > n) {
          s = []
          break
        }
      }
      var f = s.length
      for (var o = 0; o < f; ++o) s[o].element.candidateElement = s[o]
      for (var o = 0; o < f; ++o) {
        var l = s[o]
        if (l.element.tagName !== 'BLOCKQUOTE') continue
        var c = l.element.parentElement.candidateElement
        if (!c) continue
        c.addTextNodesFromCandidateElement(l)
      }
      for (var o = 0; o < f; ++o) s[o].element.candidateElement = null
      return s
    },
    findExtraArticleCandidateElements: function (t) {
      if (!this.article) return []
      t || (t = this.article.element)
      var n = 'preceding-sibling::*/descendant-or-self::*',
        r = this.contentDocument.evaluate(
          n,
          t,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        ),
        i = r.snapshotLength,
        s = []
      for (var o = 0; o < i; ++o) {
        var u = r.snapshotItem(o)
        if (CandidateTagNamesToIgnore[u.tagName]) continue
        var a = CandidateElement.extraArticleCandidateIfElementIsViable(
          u,
          this.article,
          this.contentDocument,
          !0
        )
        a && s.push(a)
      }
      ;(n = 'following-sibling::*/descendant-or-self::*'),
        (r = this.contentDocument.evaluate(
          n,
          t,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        )),
        (i = r.snapshotLength)
      for (var o = 0; o < i; ++o) {
        var u = r.snapshotItem(o)
        if (CandidateTagNamesToIgnore[u.tagName]) continue
        var a = CandidateElement.extraArticleCandidateIfElementIsViable(
          u,
          this.article,
          this.contentDocument,
          !1
        )
        a && s.push(a)
      }
      return s
    },
    isGeneratedBy: function (t) {
      var n = this.contentDocument.head
        ? this.contentDocument.head.querySelector('meta[name=generator]')
        : null
      if (!n) return !1
      var r = n.content
      return r ? t.test(r) : !1
    },
    isMediaWikiPage: function () {
      return this.isGeneratedBy(/^MediaWiki /)
    },
    isWordPressSite: function () {
      return this.isGeneratedBy(/^WordPress/)
    },
    nextPageURLString: function () {
      if (!this.article) return null
      if (this.isMediaWikiPage()) return null
      var t,
        n = 0,
        r = this.article.element
      r.parentNode &&
        getComputedStyle(r).display === 'inline' &&
        (r = r.parentNode)
      var i = r,
        s =
          cachedElementBoundingRect(r).bottom +
          LinkMaxVerticalDistanceFromArticle
      while (isElementNode(i) && cachedElementBoundingRect(i).bottom <= s)
        i = i.parentNode
      i !== r && (i === this.contentDocument || isElementNode(i)) && (r = i)
      var o = this.contentDocument.evaluate(
          LinkCandidateXPathQuery,
          r,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        ),
        u = o.snapshotLength
      if (this.pageNumber <= 2 && !this.prefixWithDateForNextPageURL) {
        var a = this.contentDocument.location.pathname,
          f = a.match(LinkDateRegex)
        f &&
          ((f = f[0]),
          (this.prefixWithDateForNextPageURL = a.substring(
            0,
            a.indexOf(f) + f.length
          )))
      }
      for (var l = 0; l < u; ++l) {
        var c = o.snapshotItem(l),
          h = this.scoreNextPageLinkCandidate(c)
        h > n && ((t = c), (n = h))
      }
      return t ? t.href : null
    },
    scoreNextPageLinkCandidate: function (t) {
      function n(e, t, n, r) {
        t.substring(0, e.length) === e &&
          ((t = t.substring(e.length)), (e = ''))
        var i = t.lastInteger()
        if (isNaN(i)) return !1
        var s = e ? e.lastInteger() : NaN
        if (isNaN(s) || s >= MaximumExactIntegralValue) s = r
        return i === s ? n.lastInteger() === s + 1 : i === s + 1
      }
      function r(e) {
        var t = {},
          n = e.substring(1).split('&'),
          r = n.length
        for (var i = 0; i < r; ++i) {
          var s = n[i],
            o = s.indexOf('=')
          o === -1 ? (t[s] = null) : (t[s.substring(0, o)] = s.substring(o + 1))
        }
        return t
      }
      var i = this.contentDocument.location
      if (t.host !== i.host) return 0
      if (t.pathname === i.pathname && t.search === i.search) return 0
      if (t.toString().indexOf('#') !== -1) return 0
      if (anchorLinksToAttachment(t) || anchorLinksToTagOrCategoryPage(t))
        return 0
      if (!isElementVisible(t)) return 0
      var s = cachedElementBoundingRect(t),
        o = this._articleBoundingRect,
        u = Math.max(
          0,
          Math.max(o.top - (s.top + s.height), s.top - (o.top + o.height))
        )
      if (s.top < o.top) return 0
      if (u > LinkMaxVerticalDistanceFromArticle) return 0
      var a = Math.max(
        0,
        Math.max(o.left - (s.left + s.width), s.left - (o.left + o.width))
      )
      if (a > 0) return 0
      var f = i.pathname,
        l = t.pathname
      if (this.prefixWithDateForNextPageURL) {
        if (t.pathname.indexOf(this.prefixWithDateForNextPageURL) === -1)
          return 0
        ;(f = f.substring(this.prefixWithDateForNextPageURL.length)),
          (l = l.substring(this.prefixWithDateForNextPageURL.length))
      }
      var c = l.substring(1).split('/')
      c[c.length - 1] || c.pop()
      var h = c.length,
        p = f.substring(1).split('/'),
        d = !1
      p[p.length - 1] || ((d = !0), p.pop())
      var v = p.length
      if (h < v) return 0
      var m = 0,
        g = 0,
        y = t.textContent
      for (var b = 0; b < h; ++b) {
        var w = c[b],
          E = b < v ? p[b] : ''
        if (E !== w) {
          if (b < v - 2) return 0
          if (w.length >= E.length) {
            var S = 0
            while (w[w.length - 1 - S] === E[E.length - 1 - S]) S++
            S &&
              ((w = w.substring(0, w.length - S)),
              (E = E.substring(0, E.length - S)))
            var x = w.indexOf(E)
            x !== -1 && (w = w.substring(x))
          }
          n(E, w, y, this.pageNumber)
            ? (g = Math.pow(LinkNextOrdinalValueBase, b - h + 1))
            : m++
        }
        if (m > 1) return 0
      }
      var T = !1
      if (t.search) {
        ;(linkParameters = r(t.search)), (referenceParameters = r(i.search))
        for (var N in linkParameters) {
          var C = linkParameters[N],
            k = N in referenceParameters ? referenceParameters[N] : null
          if (k !== C) {
            k === null && (k = ''), C === null && (C = '')
            if (C.length < k.length) m++
            else if (n(k, C, y, this.pageNumber)) {
              if (LinkURLSearchParameterKeyMatchRegex.test(N)) {
                if (f.toLowerCase() !== l.toLowerCase()) return 0
                if (this.isWordPressSite() && d) return 0
                T = !0
              }
              if (LinkURLBadSearchParameterKeyMatchRegex.test(N)) {
                m++
                continue
              }
              g = Math.max(g, 1 / LinkNextOrdinalValueBase)
            } else m++
          }
        }
      }
      if (!g) return 0
      if (
        LinkURLPageSlashNumberMatchRegex.test(t.href) ||
        LinkURLSlashDigitEndMatchRegex.test(t.href)
      )
        T = !0
      if (
        !T &&
        h === v &&
        stringSimilarity(f, l) < LinkMinimumURLSimilarityRatio
      )
        return 0
      if (LinkURLArchiveSlashDigitEndMatchRegex.test(t)) return 0
      var L =
        LinkMatchWeight * (Math.pow(LinkMismatchValueBase, -m) + g) +
        (LinkVerticalDistanceFromArticleWeight * u) /
          LinkMaxVerticalDistanceFromArticle
      T && (L += LinkURLSemanticMatchBonus),
        t.parentNode.tagName === 'LI' && (L += LinkListItemBonus)
      var y = t.innerText
      return (
        LinkNextMatchRegEx.test(y) && (L += LinkNextMatchBonus),
        LinkPageMatchRegEx.test(y) && (L += LinkPageMatchBonus),
        LinkContinueMatchRegEx.test(y) && (L += LinkContinueMatchBonus),
        L
      )
    },
    elementContainsEnoughTextOfSameStyle: function (t) {
      function o(e, t) {
        function u(e) {
          var t = e.children[0]
          if (t) {
            var n = t.children,
              r = n.length
            for (var i = 0; i < r; ++i)
              if (getComputedStyle(n[i]).float !== 'none') return !1
          }
          return !0
        }
        function a(e, i) {
          if (e.nodeType === Node.TEXT_NODE) {
            ;/\S/.test(e.nodeValue) && r.push(e)
            return
          }
          if (e.nodeType !== Node.ELEMENT_NODE) return
          if (!isElementVisible(e)) return
          if (t && ++n > t) return
          if (e._evaluatedForTextContent) return
          var f = e.tagName
          if (f === 'IFRAME' || f === 'FORM') return
          o[f] ? i-- : (f === 'UL' || f === 'OL') && u(e) && i--
          var l = i + 1
          if (l < s) {
            var c = e.childNodes,
              h = c.length
            for (var p = 0; p < h; ++p) a(c[p], l)
          }
        }
        var n = 0,
          r = [],
          o = {
            P: 1,
            STRONG: 1,
            B: 1,
            EM: 1,
            I: 1,
            SPAN: 1,
          }
        return i && ((o.CENTER = 1), (o.FONT = 1)), a(e, 0), r
      }
      const n = 110,
        r = 1800
      var i = t.tagName === 'BODY',
        s = i ? 2 : 3,
        u = o(t, n),
        a =
          r /
          scoreMultiplierForElementTagNameAndAttributes(t) /
          languageScoreMultiplierForTextNodes(u),
        f = {},
        l = u.length
      for (var c = 0; c < l; ++c) {
        var h = u[c],
          p = h.length,
          d = h.parentElement,
          v = window.getComputedStyle(d),
          m = v.fontFamily + '|' + v.fontSize,
          g = Math.pow(p, TextNodeLengthPower)
        if (f[m]) {
          if ((f[m] += g) > a) break
        } else f[m] = g
      }
      for (var m in f) if (f[m] > a) return !0
      return !1
    },
    pointsToUseForHitTesting: function () {
      const t = window.innerWidth,
        n = t / 4,
        r = t / 2,
        i = 128,
        s = 320
      return [
        [r, 800],
        [r, 600],
        [n, 800],
        [r, 400],
        [r - i, 1100],
        [s, 700],
        [3 * n, 800],
        [t - s, 700],
        [r - i, 1300],
      ]
    },
    clearVisualExaminationState: function () {
      var t = this._elementsEvaluatedForTextContent.length
      for (var n = 0; n < t; ++n)
        delete this._elementsEvaluatedForTextContent[n]._evaluatedForTextContent
      this._elementsEvaluatedForTextContent = []
    },
    findArticleByVisualExamination: function () {
      this.clearVisualExaminationState()
      var t = this.pointsToUseForHitTesting(),
        n = t.length
      for (var r = 0; r < n; r++) {
        var i = t[r][0],
          s = t[r][1],
          o = elementAtPoint(i, s)
        for (var u = o; u; u = u.parentElement) {
          if (u._evaluatedForTextContent) break
          if (VeryPositiveClassNameRegEx.test(u.className))
            return new CandidateElement(u, this.contentDocument)
          if (CandidateTagNamesToIgnore[u.tagName]) continue
          var a = u.offsetWidth,
            f = u.offsetHeight
          if (!a && !f) {
            var l = cachedElementBoundingRect(u)
            ;(a = l.width), (f = l.height)
          }
          if (
            a < CandidateMinimumWidth ||
            f < CandidateMinimumHeight ||
            a * f < CandidateMinimumArea
          )
            continue
          var c = this.elementContainsEnoughTextOfSameStyle(u)
          ;(u._evaluatedForTextContent = !0),
            this._elementsEvaluatedForTextContent.push(u)
          if (!c) continue
          if (
            CandidateElement.candidateElementAdjustedHeight(u) <
            CandidateMinimumHeight
          )
            continue
          var h = new CandidateElement(u, this.contentDocument)
          if (h.shouldDisqualifyDueToSimilarElements()) return null
          if (h.shouldDisqualifyDueToHorizontalRuleDensity()) return null
          if (h.shouldDisqualifyDueToHeaderDensity()) return null
          if (h.shouldDisqualifyForDeepLinking()) continue
          return h
        }
      }
      return null
    },
    articleTextContent: function () {
      return this._articleTextContent
    },
    pageDescription: function () {
      var t = this.contentDocument.querySelectorAll('head meta[name]'),
        n = t.length
      for (var r = 0; r < n; ++r) {
        var i = t[r]
        if (i.getAttribute('name').toLowerCase() === 'description') {
          var s = i.getAttribute('content')
          if (s) return s.trim()
        }
      }
      return null
    },
    articleTitleAndSiteNameFromTitleString: function (e) {
      const t = [' - ', ' \u2013 ', ' \u2014 ', ': ', ' | ', ' \u00bb '],
        n = t.length,
        r = 0.6
      var i = this.contentDocument.location.host,
        s = i.replace(/^(www|m)\./, ''),
        o = s.replace(/\.(com|info|net|org|edu)$/, '').toLowerCase(),
        u,
        a
      for (var f = 0; f < n; ++f) {
        var l = e.split(t[f])
        if (l.length !== 2) continue
        var c = l[0].trim(),
          h = l[1].trim(),
          p = c.toLowerCase(),
          d = h.toLowerCase(),
          v = Math.max(stringSimilarity(p, s), stringSimilarity(p, o)),
          m = Math.max(stringSimilarity(d, s), stringSimilarity(d, o)),
          g = Math.max(v, m)
        if (!a || g > a)
          (a = g),
            v > m
              ? (u = {
                  siteName: c,
                  articleTitle: h,
                })
              : (u = {
                  siteName: h,
                  articleTitle: c,
                })
      }
      return u && a >= r ? u : null
    },
    readingListItemInformation: function () {
      const t = 220,
        n = 220
      var r,
        i = this.pageDescription(),
        s = !1
      this.adoptableArticle()
        ? ((r = this.articleTitle()),
          (i = i || this.articleTextContent()),
          (s = !0))
        : ((r = this.contentDocument.title),
          this.contentDocument.body &&
            (i = i || this.contentDocument.body.innerText))
      var o = '',
        u = this.mainImageNode()
      return (
        u && (o = u.src),
        r || (r = userVisibleURLString(this.contentDocument.location.href)),
        (r = r.trim().substring(0, t)),
        i || (i = ''),
        (i = i.trim().substring(0, n).replace(/[\s]+/g, ' ')),
        {
          title: r,
          previewText: i,
          mainImageURL: o,
          isReaderAvailable: s,
        }
      )
    },
  })

var ReaderArticleFinderJS = new ReaderArticleFinder(document)
