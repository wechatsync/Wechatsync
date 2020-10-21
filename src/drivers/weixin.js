var weixinMetaCache = null

export default class WeixinDriver {
  constructor() {
    this.meta = weixinMetaCache
    this.name = 'weixin'
  }

  async getMetaData() {
    var res = await $.ajax({ url: 'https://mp.weixin.qq.com/' })
    var innerDoc = $(res)
    var doc = $('<div>').append(innerDoc.clone())
    // console.log('WeixinDriver', res);
    var code = doc.find('script').eq(0).text()
    code = code.substring(code.indexOf('window.wx.commonData'))
    var wx = new Function(
      'window.wx = {}; window.handlerNickname = function(){};' +
        code +
        '; return window.wx;'
    )()
    console.log(code, wx)
    var commonData = Object.assign({}, wx.commonData)
    delete window.wx
    if (!commonData.data.t) {
      throw new Error('未登录')
    }
    var metadata = {
      uid: commonData.data.user_name,
      title: commonData.data.nick_name,
      token: commonData.data.t,
      commonData: commonData,
      avatar: doc.find('.weui-desktop-account__thumb').eq(0).attr('src'),
      type: 'weixin',
      supportTypes: ['html'],
      home: 'https://mp.weixin.qq.com',
      icon: 'https://mp.weixin.qq.com/favicon.ico',
    }
    weixinMetaCache = metadata
    console.log('weixinMetaCache', weixinMetaCache)
    return metadata
  }

  async addPost(post) {
    return {
      status: 'success',
      post_id: 0,
    }
  }

  async getArticle(data) {
    var token = weixinMetaCache.token || '442135330'
    const tempRespone = await $.get(
      `https://mp.weixin.qq.com/cgi-bin/appmsg?action=get_temp_url&appmsgid=${data.msgId}&itemidx=1&token=${token}&lang=zh_CN&f=json&ajax=1`
    )
    const { temp_url } = tempRespone
    const htmlData = await $.get(temp_url)
    const doc = $(htmlData)
    console.log('htmlData', htmlData)
    var post = {}

    const allMetas = doc
      .filter(function(index, el) {
        return $(el).attr('property') && $(el).attr('content')
      })
      .map(function() {
        return {
          name: $(this).attr('property'),
          content: $(this).attr('content'),
        }
      })
      .toArray()

    const metaObj = {}
    allMetas.forEach(obj => {
      metaObj[obj.name] = obj.content
    })

    post.title = metaObj['og:title']
    post.content = doc.find('#js_content').html()
    post.thumb = metaObj['og:image']
    post.desc = metaObj['og:description'] 
    post.link = metaObj['og:url'];
    console.log('post', post, doc)
    return post
  }

  async editPost(post_id, post) {
    console.log('editPost', post.post_thumbnail)
    var res = await $.ajax({
      url:
        'https://mp.weixin.qq.com/cgi-bin/operate_appmsg?t=ajax-response&sub=create&type=10&token=' +
        weixinMetaCache.token +
        '&lang=zh_CN',
      type: 'POST',
      dataType: 'JSON',
      data: {
        token: weixinMetaCache.token,
        lang: 'zh_CN',
        f: 'json',
        ajax: '1',
        random: Math.random(),
        AppMsgId: '',
        count: '1',
        data_seq: '0',
        operate_from: 'Chrome',
        isnew: '0',
        ad_video_transition0: '',
        can_reward0: '0',
        related_video0: '',
        is_video_recommend0: '-1',
        title0: post.post_title,
        author0: '',
        writerid0: '0',
        fileid0: '',
        digest0: post.post_title,
        auto_gen_digest0: '1',
        content0: post.post_content,
        sourceurl0: '',
        need_open_comment0: '1',
        only_fans_can_comment0: '0',
        cdn_url0: '',
        cdn_235_1_url0: '',
        cdn_1_1_url0: '',
        cdn_url_back0: '',
        crop_list0: '',
        music_id0: '',
        video_id0: '',
        voteid0: '',
        voteismlt0: '',
        supervoteid0: '',
        cardid0: '',
        cardquantity0: '',
        cardlimit0: '',
        vid_type0: '',
        show_cover_pic0: '0',
        shortvideofileid0: '',
        copyright_type0: '0',
        releasefirst0: '',
        platform0: '',
        reprint_permit_type0: '',
        allow_reprint0: '',
        allow_reprint_modify0: '',
        original_article_type0: '',
        ori_white_list0: '',
        free_content0: '',
        fee0: '0',
        ad_id0: '',
        guide_words0: '',
        is_share_copyright0: '0',
        share_copyright_url0: '',
        source_article_type0: '',
        reprint_recommend_title0: '',
        reprint_recommend_content0: '',
        share_page_type0: '0',
        share_imageinfo0: '{"list":[]}',
        share_video_id0: '',
        dot0: '{}',
        share_voice_id0: '',
        insert_ad_mode0: '',
        categories_list0: '[]',
        sections0:
          '[{"section_index":1000000,"text_content":"​kkk","section_type":9,"ad_available":false}]',
        compose_info0:
          '{"list":[{"blockIdx":1,"content":"<p>​kkk<br></p>","width":574,"height":27,"topMargin":0,"blockType":9,"background":"rgba(0, 0, 0, 0)","text":"kkk","textColor":"rgb(51, 51, 51)","textFontSize":"17px","textBackGround":"rgba(0, 0, 0, 0)"}]}',
      },
    })

    if (!res.appMsgId) {
      var err = formatError(res)
      console.log('error', err)
      throw new Error(
        '同步失败 错误内容：' + (err && err.errmsg ? err.errmsg : res.ret)
      )
    }
    return {
      status: 'success',
      post_id: res.appMsgId,
      draftLink:
        'https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit&action=edit&type=10&appmsgid=' +
        res.appMsgId +
        '&token=' +
        weixinMetaCache.token +
        '&lang=zh_CN',
    }
    // https://zhuanlan.zhihu.com/api/articles/68769713/draft
  }

  async uploadFile(file) {
    var formdata = new FormData()
    var blob = new Blob([file.bits], {
        type: file.type
    });

    formdata.append('type', blob.type)
    formdata.append('id', new Date().getTime())
    formdata.append('name', new Date().getTime() + '.jpg')
    formdata.append('lastModifiedDate', new Date().toString())
    formdata.append('size', blob.size)
    formdata.append('file', blob, new Date().getTime() + '.jpg')
    
    var ticket_id = this.meta.commonData.data.user_name,
      ticket = this.meta.commonData.data.ticket,
      svr_time =  this.meta.commonData.data.time,
      token = this.meta.commonData.data.t,
      seq = new Date().getTime();

    var res = await axios({
      url: `https://mp.weixin.qq.com/cgi-bin/filetransfer?action=upload_material&f=json&scene=8&writetype=doublewrite&groupid=1&ticket_id=${ticket_id}&ticket=${ticket}&svr_time=${svr_time}&token=${token}&lang=zh_CN&seq=${seq}&t=` + Math.random(),
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    var url = res.data.cdn_url
    if(res.data.base_resp.err_msg != 'ok') {
      console.log(res.data);
      throw new Error('upload failed')
    }
    //  return url;
    return [
      {
        id: res.data.content,
        object_key: res.data.content,
        url: url,
      },
    ]
  }

  async uploadFileBySource(file) {
    var src = file.src
    var res = await $.ajax({
      url:
        'https://mp.weixin.qq.com/cgi-bin/uploadimg2cdn?lang=zh_CN&token=' +
        weixinMetaCache.token +
        '&t=' +
        Math.random(),
      type: 'POST',
      dataType: 'JSON',
      data: {
        imgurl: src,
        t: 'ajax-editor-upload-img',
        token: weixinMetaCache.token,
        lang: 'zh_CN',
        f: 'json',
        ajax: '1',
      },
    })

    if (res.errcode != 0) {
      throw new Error('图片上传失败' + src)
    }
    console.log(res)
    return [
      {
        id: 'aaa',
        object_key: 'aaa',
        url: res.url,
      },
    ]
  }

  async preEditPost(post) {
    var div = $('<div>')
    $('body').append(div)

    if (post.inline_content) {
      post.content = post.inline_content
    }

    div.html(post.content)

    var doc = div
    var tags = doc.find('p')
    for (let mindex = 0; mindex < tags.length; mindex++) {
      const tag = tags.eq(mindex)
      try {
        var nextHasImage = tag.next().children('img').length
        var span = $('<span></span>')
        span.html(tag.html())
        tag.html('')
        tag.append(span)
        // if (!tag.children("br").length) tag.css("margin-bottom", "20px");
        // tag.after("<p><br></p>");
        // span.css("color", "rgb(68, 68, 68)");
        // span.css("font-size", "16px");
      } catch (e) {}
    }

    var tags = doc.find('img')
    for (let mindex = 0; mindex < tags.length; mindex++) {
      const tag = tags.eq(mindex)
      const wraperTag = tag.parent()
      try {
        tag.removeAttr('_src')
        tag.attr('style', '')
        wraperTag.replaceWith('<p>' + wraperTag.html() + '</p>')
      } catch (e) {}
    }

    var pres = doc.find('a')
    for (let mindex = 0; mindex < pres.length; mindex++) {
      const pre = pres.eq(mindex)
      try {
        pre.after(pre.html()).remove()
      } catch (e) {}
    }

    var processEmptyLine = function (idx, el) {
      var $obj = $(this)
      var originalText = $obj.text()
      var img = $obj.find('img')
      var brs = $obj.find('br')
      if (originalText == '') {
        ;(function () {
          if (img.length) return
          if (!brs.length) return
          $obj.remove()
        })()
      }
    }

    var processListItem = function (idx, el) {
      var $obj = $(this)
      $obj.html($('<p></p>').append($obj.html()))
    }

    doc.find('li').each(processListItem)
    // remove empty break line
    doc.find('p').each(processEmptyLine)

    var processBr = function (idx, el) {
      var $obj = $(this)
      if (!$obj.next().length) {
        $obj.remove()
      }
    }

    doc.find('br').each(processBr)
    post.content = $('<div>')
      .append(
        "<section style='margin-left: 6px;margin-right: 6px;line-height: 1.75em;'>" +
          doc.clone().html() +
          '</section>'
      )
      .html()

    console.log('post.content', post.content)
    var inlineCssHTML = juice.inlineContent(
      post.content,
      `
    /**
    * common style
    */

   html, address,
   blockquote,
   body, dd, div,
   dl, dt, fieldset, form,
   frame, frameset,
   h1, h2, h3, h4,
   h5, h6, noframes,
   ol, p, ul, center,
   dir, hr, menu, pre   { display: block; unicode-bidi: embed }
   li              { display: list-item }
   head            { display: none }
   table           { display: table }
   tr              { display: table-row }
   thead           { display: table-header-group }
   tbody           { display: table-row-group }
   tfoot           { display: table-footer-group }
   col             { display: table-column }
   colgroup        { display: table-column-group }
   td, th          { display: table-cell }
   caption         { display: table-caption }
   th              { font-weight: bolder; text-align: center }
   caption         { text-align: center }
   body            { margin: 8px }
   h1              { font-size: 2em; margin: .67em 0 }
   h2              { font-size: 1.5em; margin: .75em 0 }
   h3              { font-size: 1.17em; margin: .83em 0 }
   h4, p,
   blockquote, ul,
   fieldset, form,
   ol, dl, dir,
   menu            { margin: 1.12em 0 }
   h5              { font-size: .83em; margin: 1.5em 0 }
   h6              { font-size: .75em; margin: 1.67em 0 }
   h1, h2, h3, h4,
   h5, h6, b,
   strong          { font-weight: bolder }
   blockquote      { margin-left: 40px; margin-right: 40px }
   i, cite, em,
   var, address    { font-style: italic }
   pre, tt, code,
   kbd, samp       { font-family: monospace }
   pre             { white-space: pre }
   button, textarea,
   input, select   { display: inline-block }
   big             { font-size: 1.17em }
   small, sub, sup { font-size: .83em }
   sub             { vertical-align: sub }
   sup             { vertical-align: super }
   table           { border-spacing: 2px; }
   thead, tbody,
   tfoot           { vertical-align: middle }
   td, th, tr      { vertical-align: inherit }
   s, strike, del  { text-decoration: line-through }
   hr              { border: 1px inset }
   ol, ul, dir,
   menu, dd        { margin-left: 40px }
   ol              { list-style-type: decimal }
   ol ul, ul ol,
   ul ul, ol ol    { margin-top: 0; margin-bottom: 0 }
   u, ins          { text-decoration: underline }
   br:before       { content: "\A"; white-space: pre-line }
   center          { text-align: center }
   :link, :visited { text-decoration: underline }
   :focus          { outline: thin dotted invert }
   
   /* Begin bidirectionality settings (do not change) */
   BDO[DIR="ltr"]  { direction: ltr; unicode-bidi: bidi-override }
   BDO[DIR="rtl"]  { direction: rtl; unicode-bidi: bidi-override }
   
   *[DIR="ltr"]    { direction: ltr; unicode-bidi: embed }
   *[DIR="rtl"]    { direction: rtl; unicode-bidi: embed }
   
   @media print {
     h1            { page-break-before: always }
     h1, h2, h3,
     h4, h5, h6    { page-break-after: avoid }
     ul, ol, dl    { page-break-before: avoid }
   }
   h1,
   h2,
   h3,
   h4,
   h5,
   h6 {
     font-weight: bold;
   }
   
   h1 {
     font-size: 1.25em;
     line-height: 1.4em;
   }
   
   h2 {
     font-size: 1.125em;
   }
   
   h3 {
     font-size: 1.05em;
   }
   
   h4,
   h5,
   h6 {
     font-size: 1em;
     margin: 1em 0;
   }

    p {
      color: rgb(51, 51, 51);
      font-size: 15px;
    }

    li p {
      margin: 0;
    }
   `
    )
    console.log('inlineCssHTML new', inlineCssHTML)
    post.content = inlineCssHTML
  }
}

function formatError(e) {
  var r,
    a = {
      errmsg: '',
      index: !1,
    }
  switch (
    ('undefined' != typeof e.ret
      ? (r = 1 * e.ret)
      : e.base_resp &&
        'undefined' != typeof e.base_resp.ret &&
        (r = 1 * e.base_resp.ret),
    1 * r)
  ) {
    case -8:
    case -6:
      ;(e.ret = '-6'), (a.errmsg = '请输入验证码')
      break

    case 62752:
      a.errmsg = '可能含有具备安全风险的链接，请检查'
      break

    case 64505:
      a.errmsg = '发送预览失败，请稍后再试'
      break

    case 64504:
      a.errmsg = '保存图文消息发送错误，请稍后再试'
      break

    case 64518:
      a.errmsg = '正文只能包含一个投票'
      break

    case 10704:
    case 10705:
      a.errmsg = '该素材已被删除'
      break

    case 10701:
      a.errmsg = '用户已被加入黑名单，无法向其发送消息'
      break

    case 10703:
      a.errmsg = '对方关闭了接收消息'
      break

    case 10700:
    case 64503:
      a.errmsg =
        '1.接收预览消息的微信尚未关注公众号，请先扫码关注<br /> 2.如果已经关注公众号，请查看微信的隐私设置（在手机微信的“我->设置->隐私->添加我的方式”中），并开启“可通过以下方式找到我”的“手机号”、“微信号”、“QQ号”，否则可能接收不到预览消息'
      break

    case 64502:
      a.errmsg = '你输入的微信号不存在，请重新输入'
      break

    case 64501:
      a.errmsg = '你输入的帐号不存在，请重新输入'
      break

    case 412:
      a.errmsg = '图文中含非法外链'
      break

    case 64515:
      a.errmsg = '当前素材非最新内容，请重新打开并编辑'
      break

    case 320001:
      a.errmsg = '该素材已被删除，无法保存'
      break

    case 64702:
      a.errmsg = '标题超出64字长度限制'
      break

    case 64703:
      a.errmsg = '摘要超出120字长度限制'
      break

    case 64704:
      a.errmsg = '推荐语超出300字长度限制'
      break

    case 64708:
      a.errmsg = '推荐语超出140字长度限制'
      break

    case 64515:
      a.errmsg = '当前素材非最新内容'
      break

    case 200041:
      a.errmsg = '此素材有文章存在违规，无法编辑'
      break

    case 64506:
      a.errmsg = '保存失败,链接不合法'
      break

    case 64507:
      a.errmsg =
        '内容不能包含外部链接，请输入http://或https://开头的公众号相关链接'
      break

    case 64510:
      a.errmsg = '内容不能包含音频，请调整'
      break

    case 64511:
      a.errmsg = '内容不能包多个音频，请调整'
      break

    case 64512:
      a.errmsg = '文章中音频错误,请使用音频添加按钮重新添加。'
      break

    case 64508:
      a.errmsg = '查看原文链接可能具备安全风险，请检查'
      break

    case 64550:
      a.errmsg = '请勿插入不合法的图文消息链接'
      break

    case 64558:
      a.errmsg = '请勿插入图文消息临时链接，链接会在短期失效'
      break

    case 64559:
      a.errmsg = '请勿插入未群发的图文消息链接'
      break

    case -99:
      a.errmsg = '内容超出字数，请调整'
      break

    case 64705:
      a.errmsg = '内容超出字数，请调整'
      break

    case -1:
      a.errmsg = '系统错误，请注意备份内容后重试'
      break

    case -2:
    case 200002:
      a.errmsg = '参数错误，请注意备份内容后重试'
      break

    case 64509:
      a.errmsg = '正文中不能包含超过3个视频，请重新编辑正文后再保存。'
      break

    case -5:
      a.errmsg = '服务错误，请注意备份内容后重试。'
      break

    case 64513:
      a.errmsg = '请从正文中选择封面，再尝试保存。'
      break

    case -206:
      a.errmsg = '目前，服务负荷过大，请稍后重试。'
      break

    case 10801:
      ;(a.errmsg =
        '标题不能有违反公众平台协议、相关法律法规和政策的内容，请重新编辑。'),
        (a.index = 1 * e.msg)
      break

    case 10802:
      ;(a.errmsg =
        '作者不能有违反公众平台协议、相关法律法规和政策的内容，请重新编辑。'),
        (a.index = 1 * e.msg)
      break

    case 10803:
      ;(a.errmsg = '敏感链接，请重新添加。'), (a.index = 1 * e.msg)
      break

    case 10804:
      ;(a.errmsg =
        '摘要不能有违反公众平台协议、相关法律法规和政策的内容，请重新编辑。'),
        (a.index = 1 * e.msg)
      break

    case 10806:
      ;(a.errmsg =
        '正文不能有违反公众平台协议、相关法律法规和政策的内容，请重新编辑。'),
        (a.index = 1 * e.msg)
      break

    case 10808:
      ;(a.errmsg =
        '推荐语不能有违反公众平台协议、相关法律法规和政策的内容，请重新编辑。'),
        (a.index = 1 * e.msg)
      break

    case 10807:
      a.errmsg = '内容不能违反公众平台协议、相关法律法规和政策，请重新编辑。'
      break

    case 200003:
      a.errmsg = '登录态超时，请重新登录。'
      break

    case 64513:
      a.errmsg = '封面必须存在正文中，请检查封面'
      break

    case 64551:
      a.errmsg = '请检查图文消息中的微视链接后重试。'
      break

    case 64552:
      a.errmsg = '请检查阅读原文中的链接后重试。'
      break

    case 64553:
      a.errmsg = '请不要在图文消息中插入超过5张卡券。请删减卡券后重试。'
      break

    case 64554:
      a.errmsg = '在当前情况下不允许在图文消息中插入卡券，请删除卡券后重试。'
      break

    case 64555:
      a.errmsg = '请检查图文消息卡片跳转的链接后重试。'
      break

    case 64556:
      a.errmsg = '卡券不属于该公众号，请删除后重试'
      break

    case 64557:
      a.errmsg = '卡券无效，请删除后重试。'
      break

    case 13002:
      ;(a.errmsg = '该广告卡片已过期，删除后才可保存成功'),
        (a.index = 1 * e.msg)
      break

    case 13003:
      ;(a.errmsg = '已有文章插入过该广告卡片，一个广告卡片仅可插入一篇文章'),
        (a.index = 1 * e.msg)
      break

    case 13004:
      ;(a.errmsg = '该广告卡片与图文消息位置不一致'), (a.index = 1 * e.msg)
      break

    case 15801:
    case 15802:
    case 15803:
    case 15804:
    case 15805:
    case 15806:
      a.errmsg =
        e.remind_wording ||
        '你所编辑的内容可能含有违反微信公众平台平台协议、相关法律法规和政策的内容'
      break

    case 1530503:
      a.errmsg = '请勿添加其他公众号的主页链接'
      break

    case 1530504:
      a.errmsg = '请勿添加其他公众号的主页链接'
      break

    case 1530510:
      a.errmsg = '链接已失效，请在手机端重新复制链接'
      break

    case 153007:
    case 153008:
    case 153009:
    case 153010:
      a.errmsg =
        '很抱歉，原创声明不成功|你的文章内容未达到声明原创的要求，满足以下任一条件可发起声明：<br />1、文章文字字数大于300字，且自己创作的内容大于引用内容<br />2、文章文字字数小于300字，无视频，且图片（包括封面图）均为你已成功声明原创的图片<br />说明：上述要求中，文章文字字数不包含标点符号和空格，请知悉。'
      break

    case 153200:
      a.errmsg = '无权限声明原创，取消声明后重试'
      break

    case 1530511:
      a.errmsg = '链接已失效，请在手机端重新复制链接'
      break

    case 220001:
      a.errmsg = '"素材管理"中的存储数量已达到上限，请删除后再操作。'
      break

    case 220002:
      a.errmsg = '你的图片库已达到存储上限，请进行清理。'
      break

    case 153012:
      a.errmsg = '请设置转载类型'
      break

    case 200042:
      a.errmsg = '图文中包含的小程序素材不能多于50个、小程序帐号不能多于10个'
      break

    case 200043:
      a.errmsg = '图文中包含没有关联的小程序，请删除后再保存'
      break

    case 64601:
      a.errmsg = '一篇文章只能插入一个广告卡片'
      break

    case 64602:
      a.errmsg = '尚未开通文中广告位，但文章中有广告'
      break

    case 64603:
      a.errmsg = '文中广告前不足300字'
      break

    case 64604:
      a.errmsg = '文中广告后不足300字'
      break

    case 64605:
      a.errmsg = '文中不能同时插入文中广告和互选广告'
      break

    case 65101:
      a.errmsg = '图文模版数量已达到上限，请删除后再操作'
      break

    case 64560:
      a.errmsg = '请勿插入历史图文消息页链接'
      break

    case 64561:
      a.errmsg = '请勿插入mp.weixin.qq.com域名下的非图文消息链接'
      break

    case 64562:
      a.errmsg = '请勿插入非mp.weixin.qq.com域名的链接'
      break

    case 153013:
      a.errmsg = '文章内含有投票，不能设置为开放转载'
      break

    case 153014:
      a.errmsg = '文章内含有卡券，不能设置为开放转载'
      break

    case 153015:
      a.errmsg = '文章内含有小程序链接，不能设置为开放转载'
      break

    case 153016:
      a.errmsg = '文章内含有小程序链接，不能设置为开放转载'
      break

    case 153017:
      a.errmsg = '文章内含有小程序卡片，不能设置为开放转载'
      break

    case 153018:
      a.errmsg = '文章内含有商品，不能设置为开放转载'
      break

    case 153019:
      a.errmsg = '文章内含有广告卡片，不能设置为开放转载'
      break

    case 153020:
      a.errmsg = '文章内含有广告卡片，不能设置为开放转载'
      break

    case 153021:
      a.errmsg = '文章内含有广告卡片，不能设置为开放转载'
      break

    case 153101:
      a.errmsg = '含有原文已删除的转载文章，请删除后重试'
      break

    case 64707:
      a.errmsg = '赞赏账户授权失效或者状态异常'
      break

    case 420001:
      a.errmsg = '封面图不支持GIF，请更换'
      break

    case 353004:
      a.errmsg = '不支持添加商品，请删除后重试'
      break

    case 442001:
      a.errmsg = '帐号新建/编辑素材能力已被封禁，暂不可使用。'
      break

    default:
      a.errmsg = '系统繁忙，请稍后重试'
  }
  return a
}
