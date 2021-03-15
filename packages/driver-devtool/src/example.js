export default {

    files: [
        {
            fileName: 'article.json',
            isLeader: true,
            content: `{\n  \"title\": \"基于Airtable的产品需求收集和分析\",\n  \"content\": \"\\n                    \\n\\n                    \\n                    \\n                    \\n                    <section   style=\\\"line-height: 1.6;word-break: break-word;overflow-wrap: break-word;text-align: left;font-family: Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, &quot;PingFang SC&quot;, Cambria, Cochin, Georgia, Times, &quot;Times New Roman&quot;, serif;padding-right: 10px;padding-left: 10px;font-size: 0.958em;color: rgb(53, 53, 53);word-spacing: 0.8px;letter-spacing: 0.8px;border-radius: 0.958em;\\\"><blockquote  style=\\\"border-width: initial;border-style: none;border-color: initial;font-size: 0.9em;overflow: auto;margin-bottom: 20px;margin-top: 20px;padding-top: 15px;padding-right: 10px;padding-bottom: 15px;line-height: 1.75;border-radius: 13px;color: rgb(53, 53, 53);background: rgb(245, 245, 245);\\\"><span style=\\\"display: block;font-size: 2em;color: #0087fc;font-family: Arial, serif;line-height: 1em;font-weight: 700;\\\">“</span><p style=\\\"padding-top: 8px;padding-bottom: 8px;line-height: 26px;font-size: 0.958em;margin-right: 10px;margin-left: 10px;\\\">年初盘点了下去年都做了些啥，发现文章同步助手仅靠自然流量用户增长了也有10倍之多了（投入的精力并不多的情况下）之前也有想好好完善下，增加更多的同步渠道。</p><span style=\\\"float: right;display: block;font-size: 2em;color: #0087fc;font-family: Arial, serif;line-height: 1em;font-weight: 700;\\\">”</span></blockquote><h2  style=\\\"font-weight: bold;color: black;font-size: 22px;margin-top: 20px;margin-right: 10px;\\\"><span style=\\\"display: none;\\\"></span><span style=\\\"font-size: 18px;color: rgb(34, 34, 34);display: inline-block;padding-left: 10px;border-left: 5px solid rgb(0, 135, 252);\\\">收集需求的需求</span></h2><p  style=\\\"padding-top: 8px;padding-bottom: 8px;line-height: 1.75;margin: 0.8em 0em;font-size: 0.958em;color: #666;\\\">对自媒体人士而言，除主流媒体之外，有很多细分的媒体也是很需要的，比如说【马蜂窝、穷游】这样的媒体对于一位旅游行业从业人员来讲，吸引力和需要程度远在主流媒体之上。</p><figure  style=\\\"margin-top: 10px;margin-bottom: 10px;display: flex;flex-direction: column;justify-content: center;align-items: center;border-radius: 0.958em;overflow: hidden;\\\"><img data-ratio=\\\"0.3703308431163287\\\" data-src=\\\"https://mmbiz.qpic.cn/mmbiz_png/VUsUpGDa4qcjdkWaVgxn094JdVexMj2PhcD0CVN8qy8Ca1g65WJBPYqurlibnNCVfYqEf3mkKAV1Qx6fbcFGU3g/640?wx_fmt=png\\\" data-type=\\\"png\\\" data-w=\\\"937\\\" style=\\\"border-radius: 6px; display: block; margin: 10px auto; object-fit: contain; box-shadow: rgba(170, 170, 170, 0.48) 0px 0px 6px 0px; max-width: 95% !important; width: 677px !important; height: auto !important; visibility: visible !important;\\\" _width=\\\"677px\\\" class=\\\"\\\" src=\\\"https://mmbiz.qpic.cn/mmbiz_png/VUsUpGDa4qcjdkWaVgxn094JdVexMj2PhcD0CVN8qy8Ca1g65WJBPYqurlibnNCVfYqEf3mkKAV1Qx6fbcFGU3g/640?wx_fmt=png&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1&amp;wx_co=1\\\" crossorigin=\\\"anonymous\\\" alt=\\\"图片\\\" data-fail=\\\"0\\\"></figure><p  style=\\\"padding-top: 8px;padding-bottom: 8px;line-height: 1.75;margin: 0.8em 0em;font-size: 0.958em;color: #666;\\\">考虑到这些情况的存在，很有必要分行业来增加这些细分的渠道的支持，这样对用户整体而言、可用性价值就更大了。</p><p  style=\\\"padding-top: 8px;padding-bottom: 8px;line-height: 1.75;margin: 0.8em 0em;font-size: 0.958em;color: #666;\\\">于是乎：在知道要大量增加渠道的情况下，如何保证增加的渠道是用户所需要的呢？这个时候需求收集就很有用了。</p><h2  style=\\\"font-weight: bold;color: black;font-size: 22px;margin-top: 20px;margin-right: 10px;\\\"><span style=\\\"display: none;\\\"></span><span style=\\\"font-size: 18px;color: rgb(34, 34, 34);display: inline-block;padding-left: 10px;border-left: 5px solid rgb(0, 135, 252);\\\">人肉收集？</span></h2><p  style=\\\"padding-top: 8px;padding-bottom: 8px;line-height: 1.75;margin: 0.8em 0em;font-size: 0.958em;color: #666;\\\">起初我想在用户微信群，让大家【给自己的群名称】备注上自己的所在的【行业】，再人肉挨个统计行业，再按行业自行去支持这些行业的头部媒体。</p><p  style=\\\"padding-top: 8px;padding-bottom: 8px;line-height: 1.75;margin: 0.8em 0em;font-size: 0.958em;color: #666;\\\">但在具体实施的过程中我觉得人肉统计这件事可能太费劲了、其次用户也不一定有意愿去给自己备注行业（即便是你告诉了他你的动机是为了了解行业支持更多符合大家需要的渠道）。</p><h2  style=\\\"font-weight: bold;color: black;font-size: 22px;margin-top: 20px;margin-right: 10px;\\\"><span style=\\\"display: none;\\\"></span><span style=\\\"font-size: 18px;color: rgb(34, 34, 34);display: inline-block;padding-left: 10px;border-left: 5px solid rgb(0, 135, 252);\\\">新型文档应用</span></h2><figure  style=\\\"margin-top: 10px;margin-bottom: 10px;display: flex;flex-direction: column;justify-content: center;align-items: center;border-radius: 0.958em;overflow: hidden;\\\"><img data-ratio=\\\"0.4755492558469171\\\" data-src=\\\"https://mmbiz.qpic.cn/mmbiz_png/VUsUpGDa4qcjdkWaVgxn094JdVexMj2PTBqia1cBXF081Gf3ia74oyYibF4zW0DbPZVWXsP5BOKS8WwfTpxiam3tHQ/640?wx_fmt=png\\\" data-type=\\\"png\\\" data-w=\\\"1411\\\" style=\\\"border-radius: 6px; display: block; margin: 10px auto; object-fit: contain; box-shadow: rgba(170, 170, 170, 0.48) 0px 0px 6px 0px; max-width: 95% !important; width: 657px !important; height: 313.485px !important;\\\" _width=\\\"677px\\\" class=\\\"img_loading\\\" src=\\\"data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==\\\" crossorigin=\\\"anonymous\\\" alt=\\\"图片\\\"></figure><p  style=\\\"padding-top: 8px;padding-bottom: 8px;line-height: 1.75;margin: 0.8em 0em;font-size: 0.958em;color: #666;\\\">种种原因这让我想到了Coda，或许可以此定义一个文档、做一个小型的需求收集应用，定义基础表格字段，Button绑定自定义表单录入收据。加上投票计数。</p><p  style=\\\"padding-top: 8px;padding-bottom: 8px;line-height: 1.75;margin: 0.8em 0em;font-size: 0.958em;color: #666;\\\">这样用户可以自行录入一个渠道，其他用户可以给某渠道进行投票计数（计数能了解用户到底更需要哪个渠道、便于确定优先级），后面只需要把这个文档扔到群里就可以了！</p><figure  style=\\\"margin-top: 10px;margin-bottom: 10px;display: flex;flex-direction: column;justify-content: center;align-items: center;border-radius: 0.958em;overflow: hidden;\\\"><img data-ratio=\\\"0.5766037735849057\\\" data-src=\\\"https://mmbiz.qpic.cn/mmbiz_png/VUsUpGDa4qcjdkWaVgxn094JdVexMj2P9KH23ibulgQcf1gicqypOohtm5PwY6giaoI3NVp5iam40hazQskP0D4Uqg/640?wx_fmt=png\\\" data-type=\\\"png\\\" data-w=\\\"1325\\\" style=\\\"border-radius: 6px; display: block; margin: 10px auto; object-fit: contain; box-shadow: rgba(170, 170, 170, 0.48) 0px 0px 6px 0px; max-width: 95% !important; width: 657px !important; height: 379.675px !important;\\\" _width=\\\"677px\\\" class=\\\"img_loading\\\" src=\\\"data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==\\\" crossorigin=\\\"anonymous\\\" alt=\\\"图片\\\"></figure><p  style=\\\"padding-top: 8px;padding-bottom: 8px;line-height: 1.75;margin: 0.8em 0em;font-size: 0.958em;color: #666;\\\">但事实上Coda相当复杂，即便有很多模板作为开始，我还是感受到了恐慌（在你开始之前你得对Coda的文档和各种特性有一定基础了解，不然根本不知道到底下一步该干啥）</p><figure  style=\\\"margin-top: 10px;margin-bottom: 10px;display: flex;flex-direction: column;justify-content: center;align-items: center;border-radius: 0.958em;overflow: hidden;\\\"><img data-ratio=\\\"0.5978480161398789\\\" data-src=\\\"https://mmbiz.qpic.cn/mmbiz_png/VUsUpGDa4qcjdkWaVgxn094JdVexMj2P36TReHq1629JwyUyzvke1O5Q2plRCFnl31IZY8kJag70n3odcK9IPw/640?wx_fmt=png\\\" data-type=\\\"png\\\" data-w=\\\"1487\\\" style=\\\"border-radius: 6px; display: block; margin: 10px auto; object-fit: contain; box-shadow: rgba(170, 170, 170, 0.48) 0px 0px 6px 0px; max-width: 95% !important; width: 657px !important; height: 393.59px !important;\\\" _width=\\\"677px\\\" class=\\\"img_loading\\\" src=\\\"data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==\\\" crossorigin=\\\"anonymous\\\" alt=\\\"图片\\\"></figure><p  style=\\\"padding-top: 8px;padding-bottom: 8px;line-height: 1.75;margin: 0.8em 0em;font-size: 0.958em;color: #666;\\\">这个时候只能寻求更简便的产品了，比如说先前有调研过的Airtable。相对而言就简单很多了，以定好的数据表为基础，可以衍生到表单提交 ，按某个字段聚合的（看板、图表）视图！</p><h2  style=\\\"font-weight: bold;color: black;font-size: 22px;margin-top: 20px;margin-right: 10px;\\\"><span style=\\\"display: none;\\\"></span><span style=\\\"font-size: 18px;color: rgb(34, 34, 34);display: inline-block;padding-left: 10px;border-left: 5px solid rgb(0, 135, 252);\\\">信息的提交和公示</span></h2><figure  style=\\\"margin-top: 10px;margin-bottom: 10px;display: flex;flex-direction: column;justify-content: center;align-items: center;border-radius: 0.958em;overflow: hidden;\\\"><img data-ratio=\\\"0.5974222896133434\\\" data-src=\\\"https://mmbiz.qpic.cn/mmbiz_png/VUsUpGDa4qcjdkWaVgxn094JdVexMj2Px9PKEZxXCPgdXKcx44o7Epw7azJX9DNMDib25SErX7icGV9RBPNggdKg/640?wx_fmt=png\\\" data-type=\\\"png\\\" data-w=\\\"1319\\\" style=\\\"border-radius: 6px; display: block; margin: 10px auto; object-fit: contain; box-shadow: rgba(170, 170, 170, 0.48) 0px 0px 6px 0px; max-width: 95% !important; width: 657px !important; height: 393.312px !important;\\\" _width=\\\"677px\\\" class=\\\"img_loading\\\" src=\\\"data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==\\\" crossorigin=\\\"anonymous\\\" alt=\\\"图片\\\"></figure><p  style=\\\"padding-top: 8px;padding-bottom: 8px;line-height: 1.75;margin: 0.8em 0em;font-size: 0.958em;color: #666;\\\">按【状态】字段聚合表格，方便查看支持情况下的渠道列表</p><figure  style=\\\"margin-top: 10px;margin-bottom: 10px;display: flex;flex-direction: column;justify-content: center;align-items: center;border-radius: 0.958em;overflow: hidden;\\\"><img data-ratio=\\\"0.6348148148148148\\\" data-src=\\\"https://mmbiz.qpic.cn/mmbiz_png/VUsUpGDa4qcjdkWaVgxn094JdVexMj2PozLcrbDYHGYBQE0PSluMZNHicHRc3Vb6dbiaib72MjjfTb3mNFWSYRTfQ/640?wx_fmt=png\\\" data-type=\\\"png\\\" data-w=\\\"1350\\\" style=\\\"border-radius: 6px; display: block; margin: 10px auto; object-fit: contain; box-shadow: rgba(170, 170, 170, 0.48) 0px 0px 6px 0px; max-width: 95% !important; width: 657px !important; height: 417.804px !important;\\\" _width=\\\"677px\\\" class=\\\"img_loading\\\" src=\\\"data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==\\\" crossorigin=\\\"anonymous\\\" alt=\\\"图片\\\"></figure><p  style=\\\"padding-top: 8px;padding-bottom: 8px;line-height: 1.75;margin: 0.8em 0em;font-size: 0.958em;color: #666;\\\">新增一个表单视图，让用户填写要提交的媒体名称，网址以及大致的备注，在描述区域外链到状态聚合表格。</p><p  style=\\\"padding-top: 8px;padding-bottom: 8px;line-height: 1.75;margin: 0.8em 0em;font-size: 0.958em;color: #666;\\\">接着就可以把表单链接发到用户微信群里了、放到官网菜单上等。</p><figure  style=\\\"margin-top: 10px;margin-bottom: 10px;display: flex;flex-direction: column;justify-content: center;align-items: center;border-radius: 0.958em;overflow: hidden;\\\"><img data-ratio=\\\"0.7044072948328267\\\" data-src=\\\"https://mmbiz.qpic.cn/mmbiz_png/VUsUpGDa4qcjdkWaVgxn094JdVexMj2PySO9fTia58Z7VPfdeZRFa5CXw3lgqJxXzOA8esiay3VAEsjfTnTewhAw/640?wx_fmt=png\\\" data-type=\\\"png\\\" data-w=\\\"1316\\\" style=\\\"border-radius: 6px; display: block; margin: 10px auto; object-fit: contain; box-shadow: rgba(170, 170, 170, 0.48) 0px 0px 6px 0px; max-width: 95% !important; width: 657px !important; height: 463.387px !important;\\\" _width=\\\"677px\\\" class=\\\"img_loading\\\" src=\\\"data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==\\\" crossorigin=\\\"anonymous\\\" alt=\\\"图片\\\"></figure><p  style=\\\"padding-top: 8px;padding-bottom: 8px;line-height: 1.75;margin: 0.8em 0em;font-size: 0.958em;color: #666;\\\">在通过Airtable的Iframe嵌套功能，可以很方便的把数据表的状态公示到官网上！再加上提交按钮引导的数据表单上。</p><p  style=\\\"padding-top: 8px;padding-bottom: 8px;line-height: 1.75;margin: 0.8em 0em;font-size: 0.958em;color: #666;\\\">信息流动的效率从未如此之高！</p><h2  style=\\\"font-weight: bold;color: black;font-size: 22px;margin-top: 20px;margin-right: 10px;\\\"><span style=\\\"display: none;\\\"></span><span style=\\\"font-size: 18px;color: rgb(34, 34, 34);display: inline-block;padding-left: 10px;border-left: 5px solid rgb(0, 135, 252);\\\">总结</span></h2><figure  style=\\\"margin-top: 10px;margin-bottom: 10px;display: flex;flex-direction: column;justify-content: center;align-items: center;border-radius: 0.958em;overflow: hidden;\\\"><img data-ratio=\\\"0.18340611353711792\\\" data-src=\\\"https://mmbiz.qpic.cn/mmbiz_png/VUsUpGDa4qcjdkWaVgxn094JdVexMj2PGqM3WeseyiapKUgDq8bqX4W3lTlSUfnRib1RKYYbgiaRWibvKR6TfwqibrQ/640?wx_fmt=png\\\" data-type=\\\"png\\\" data-w=\\\"1145\\\" style=\\\"border-radius: 6px; display: block; margin: 10px auto; object-fit: contain; box-shadow: rgba(170, 170, 170, 0.48) 0px 0px 6px 0px; max-width: 95% !important; width: 657px !important; height: 122.131px !important;\\\" _width=\\\"677px\\\" class=\\\"img_loading\\\" src=\\\"data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==\\\" crossorigin=\\\"anonymous\\\" alt=\\\"图片\\\"></figure><p  style=\\\"padding-top: 8px;padding-bottom: 8px;line-height: 1.75;margin: 0.8em 0em;font-size: 0.958em;color: #666;\\\">果不其然，从1月22号加上到今天，已经收集了大概20多个待支持的渠道。这些积压的需求，进而引发了对提高新渠道对接效率的思考。从而有了新的改进需求，以及是否可以有效利用用户的力量来帮助对接更多的渠道等。</p><figure  style=\\\"margin-top: 10px;margin-bottom: 10px;display: flex;flex-direction: column;justify-content: center;align-items: center;border-radius: 0.958em;overflow: hidden;\\\"><img data-ratio=\\\"0.5560488346281909\\\" data-src=\\\"https://mmbiz.qpic.cn/mmbiz_png/VUsUpGDa4qcjdkWaVgxn094JdVexMj2P6FrT2phibCMBRURIHCOA6kLZR0WCKT3JLgL5pXwZ8gpW8BiaX23qezRw/640?wx_fmt=png\\\" data-type=\\\"png\\\" data-w=\\\"901\\\" style=\\\"border-radius: 6px; display: block; margin: 10px auto; object-fit: contain; box-shadow: rgba(170, 170, 170, 0.48) 0px 0px 6px 0px; max-width: 95% !important; width: 657px !important; height: 366.212px !important;\\\" _width=\\\"677px\\\" class=\\\"img_loading\\\" src=\\\"data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==\\\" crossorigin=\\\"anonymous\\\" alt=\\\"图片\\\"></figure><p  style=\\\"padding-top: 8px;padding-bottom: 8px;line-height: 1.75;margin: 0.8em 0em;font-size: 0.958em;color: #666;\\\">关于Airtable还有很多有趣好玩的地方比如说自动化，表格右边App，比如说表单提交后发送通知到你的IM上等等，这里面各种组合的可玩空间相当大的！</p><p  style=\\\"padding-top: 8px;padding-bottom: 8px;line-height: 1.75;margin: 0.8em 0em;font-size: 0.958em;color: #666;\\\">此外去年底看了下国内也已经有类似的产品了如Treelab、Hipa、Vika等。</p><p  style=\\\"padding-top: 8px;padding-bottom: 8px;line-height: 1.75;margin: 0.8em 0em;font-size: 0.958em;color: #666;\\\">总得来讲这是很有趣的一次尝试！</p></section><p><br></p>\\n                \"\n}`
        },
//             {
//                 fileName: 'toutiao.js',
//                 isLeader: false,
//                 content: `// 头条 demo

// export default class ToutiaoDriver {
//   constructor() {
//     // this.skipReadImage = true
//     this.name = 'toutiao'
//   }

//   async getMetaData() {
//     var res = await $.ajax({
//       url: 'https://mp.toutiao.com/get_media_info/',
//     })
//     // console.log(res);
//     return {
//       uid: res.data.user.id,
//       title: res.data.user.screen_name,
//       avatar: res.data.user.https_avatar_url,
//       supportTypes: ['html'],
//       type: 'toutiao',
//       displayName: '头条',
//       home: 'https://mp.toutiao.com/profile_v3/graphic/publish',
//       icon: 'https://sf1-ttcdn-tos.pstatp.com/obj/ttfe/pgcfe/sz/mp_logo.png',
//     }
//   }

//   async addPost(post) {
//     return {
//       status: 'success',
//       post_id: 0,
//     }
//   }

//   async editPost(post_id, post) {
//     var pgc_feed_covers = []
//     if (post.post_thumbnail_raw && post.post_thumbnail_raw.images) {
//       pgc_feed_covers.push({
//         id: 0,
//         url: post.post_thumbnail_raw.url,
//         uri: post.post_thumbnail_raw.images[0].origin_web_uri,
//         origin_uri: post.post_thumbnail_raw.images[0].origin_web_uri,
//         ic_uri: '',
//         thumb_width: post.post_thumbnail_raw.images[0].width,
//         thumb_height: post.post_thumbnail_raw.images[0].height,
//       })
//     }

//     await $.get('https://mp.toutiao.com/profile_v3/graphic/publish')

//     var res = await $.ajax({
//       // url:'https://mp.toutiao.com/core/article/edit_article_post/?source=mp&type=article',
//       url: 'https://mp.toutiao.com/mp/agw/article/publish?source=mp&type=article',
//       type: 'POST',
//       dataType: 'JSON',
//       data: {
//         title: post.post_title,
//         article_ad_type: 2,
//         article_type: 0,
//         from_diagnosis: 0,
//         origin_debut_check_pgc_normal: 0,
//         tree_plan_article: 0,
//         save: 0,
//         pgc_id: 0,
//         content: post.post_content,
//         pgc_feed_covers: JSON.stringify(pgc_feed_covers),
//       },
//     })

//     if (!res.data) {
//       throw new Error(res.message)
//     }

//     return {
//       status: 'success',
//       post_id: res.data.pgc_id,
//       draftLink:
//         'https://mp.toutiao.com/profile_v3/graphic/publish?pgc_id=' +
//         res.data.pgc_id,
//     }
//   }

//   async uploadFileBySrc(file) {
//     var src = file.src
//     var res = await $.ajax({
//       url: 'https://mp.toutiao.com/tools/catch_picture/',
//       type: 'POST',
//       headers: {
//         accept: '*/*',
//       },
//       data: {
//         upfile: src,
//         version: 2,
//       },
//     })

//     // throw new Error('fuck');
//     if (res.images && !res.images.length) {
//       throw new Error('图片上传失败 ' + src)
//     }

//     // http only
//     console.log('uploadFile', res)
//     return [res]
//   }

//   async uploadFile(file) {
//     var src = file.src
//     var uploadUrl = 'https://mp.toutiao.com/mp/agw/article_material/photo/upload_picture?type=ueditor&pgc_watermark=1&action=uploadimage&encode=utf-8'
//     // var blob = new Blob([file.bits], {
//     //   type: file.type
//     // });
//     var file = new File([file.bits], 'temp', {
//       type: file.type
//     });
//     var formdata = new FormData()
//     formdata.append('upfile', file)
//     var res = await axios({
//       url: uploadUrl,
//       method: 'post',
//       data: formdata,
//       headers: { 'Content-Type': 'multipart/form-data' },
//     })

//     if (res.data.state != 'SUCCESS') {
//       throw new Error('图片上传失败 ' + src)
//     }
//     // http only
//     console.log('uploadFile', res)
//     return [{
//       id: res.data.original,
//       object_key: res.data.original,
//       url: res.data.url,
//       images: [
//         res.data
//       ]
//     }]
//   }

//   async preEditPost(post) {
//     var div = $('<div>')
//     $('body').append(div)

//     div.html(post.content)

//     // var org = $(post.content);
//     // var doc = $('<div>').append(org.clone());

//     var doc = div
//     var pres = doc.find('a')
//     for (let mindex = 0; mindex < pres.length; mindex++) {
//       const pre = pres.eq(mindex)
//       try {
//         pre.after(pre.html()).remove()
//       } catch (e) {}
//     }

//     var pres = doc.find('iframe')
//     for (let mindex = 0; mindex < pres.length; mindex++) {
//       const pre = pres.eq(mindex)
//       try {
//         pre.remove()
//       } catch (e) {}
//     }

//     try {
//       const images = doc.find('img')
//       for (let index = 0; index < images.length; index++) {
//         const image = images.eq(index)
//         const imgSrc = image.attr('src')
//         if (imgSrc && imgSrc.indexOf('.svg') > -1) {
//           console.log('remove svg Image')
//           image.remove()
//         }
//       }
//       const qqm = doc.find('qqmusic')
//       qqm.next().remove()
//       qqm.remove()
//     } catch (e) {}

//     post.content = $('<div>').append(doc.clone()).html()
//     console.log('post', post)
//   }

//   editImg(img, source) {
//     img.attr('web_uri', source.images[0].origin_web_uri)
//   }
//   //   <img class="" src="http://p2.pstatp.com/large/pgc-image/bc0a9fc8e595453083d85deb947c3d6e" data-ic="false" data-ic-uri="" data-height="1333" data-width="1000" image_type="1" web_uri="pgc-image/bc0a9fc8e595453083d85deb947c3d6e" img_width="1000" img_height="1333"></img>
// }
// `
//             },
//             {
//                 fileName: 'weixin.js',
//                 content: `// 微信 demo
// var weixinMetaCache = null

// export default class WeixinDriver {
//   constructor() {
//     this.meta = weixinMetaCache
//     this.name = 'weixin'
//   }

//   async getMetaData() {
//     var res = await $.ajax({ url: 'https://mp.weixin.qq.com/' })
//     var innerDoc = $(res)
//     var doc = $('<div>').append(innerDoc.clone())
//     // console.log('WeixinDriver', res);
//     var code = doc.find('script').eq(0).text()
//     code = code.substring(code.indexOf('window.wx.commonData'))
//     var wx = new Function(
//       'window.wx = {}; window.handlerNickname = function(){};' +
//         code +
//         '; return window.wx;'
//     )()
//     console.log(code, wx)
//     var commonData = Object.assign({}, wx.commonData)
//     delete window.wx
//     if (!commonData.data.t) {
//       throw new Error('未登录')
//     }
//     var metadata = {
//       uid: commonData.data.user_name,
//       title: commonData.data.nick_name,
//       token: commonData.data.t,
//       commonData: commonData,
//       avatar: doc.find('.weui-desktop-account__thumb').eq(0).attr('src'),
//       type: 'weixin',
//       supportTypes: ['html'],
//       home: 'https://mp.weixin.qq.com',
//       icon: 'https://mp.weixin.qq.com/favicon.ico',
//     }
//     weixinMetaCache = metadata
//     console.log('weixinMetaCache', weixinMetaCache)
//     return metadata
//   }

//   async addPost(post) {
//     return {
//       status: 'success',
//       post_id: 0,
//     }
//   }

//   async getArticle(data) {
//     var token = weixinMetaCache.token || '442135330'
//     const tempRespone = await $.get(
//       \`https://mp.weixin.qq.com/cgi-bin/appmsg?action=get_temp_url&appmsgid=\${data.msgId}&itemidx=1&token=\${token}&lang=zh_CN&f=json&ajax=1\`
//     )
//     const { temp_url } = tempRespone
//     const htmlData = await $.get(temp_url)
//     const doc = $(htmlData)
//     console.log('htmlData', htmlData)
//     var post = {}

//     const allMetas = doc
//       .filter(function(index, el) {
//         return $(el).attr('property') && $(el).attr('content')
//       })
//       .map(function() {
//         return {
//           name: $(this).attr('property'),
//           content: $(this).attr('content'),
//         }
//       })
//       .toArray()

//     const metaObj = {}
//     allMetas.forEach(obj => {
//       metaObj[obj.name] = obj.content
//     })

//     post.title = metaObj['og:title']
//     post.content = doc.find('#js_content').html()
//     post.thumb = metaObj['og:image']
//     post.desc = metaObj['og:description'] 
//     post.link = metaObj['og:url'];
//     console.log('post', post, doc)
//     return post
//   }

//   async editPost(post_id, post) {
//     console.log('editPost', post.post_thumbnail)
//     var res = await $.ajax({
//       url:
//         'https://mp.weixin.qq.com/cgi-bin/operate_appmsg?t=ajax-response&sub=create&type=10&token=' +
//         weixinMetaCache.token +
//         '&lang=zh_CN',
//       type: 'POST',
//       dataType: 'JSON',
//       data: {
//         token: weixinMetaCache.token,
//         lang: 'zh_CN',
//         f: 'json',
//         ajax: '1',
//         random: Math.random(),
//         AppMsgId: '',
//         count: '1',
//         data_seq: '0',
//         operate_from: 'Chrome',
//         isnew: '0',
//         ad_video_transition0: '',
//         can_reward0: '0',
//         related_video0: '',
//         is_video_recommend0: '-1',
//         title0: post.post_title,
//         author0: '',
//         writerid0: '0',
//         fileid0: '',
//         digest0: post.post_title,
//         auto_gen_digest0: '1',
//         content0: post.post_content,
//         sourceurl0: '',
//         need_open_comment0: '1',
//         only_fans_can_comment0: '0',
//         cdn_url0: '',
//         cdn_235_1_url0: '',
//         cdn_1_1_url0: '',
//         cdn_url_back0: '',
//         crop_list0: '',
//         music_id0: '',
//         video_id0: '',
//         voteid0: '',
//         voteismlt0: '',
//         supervoteid0: '',
//         cardid0: '',
//         cardquantity0: '',
//         cardlimit0: '',
//         vid_type0: '',
//         show_cover_pic0: '0',
//         shortvideofileid0: '',
//         copyright_type0: '0',
//         releasefirst0: '',
//         platform0: '',
//         reprint_permit_type0: '',
//         allow_reprint0: '',
//         allow_reprint_modify0: '',
//         original_article_type0: '',
//         ori_white_list0: '',
//         free_content0: '',
//         fee0: '0',
//         ad_id0: '',
//         guide_words0: '',
//         is_share_copyright0: '0',
//         share_copyright_url0: '',
//         source_article_type0: '',
//         reprint_recommend_title0: '',
//         reprint_recommend_content0: '',
//         share_page_type0: '0',
//         share_imageinfo0: '{"list":[]}',
//         share_video_id0: '',
//         dot0: '{}',
//         share_voice_id0: '',
//         insert_ad_mode0: '',
//         categories_list0: '[]',
//         sections0:
//           '[{"section_index":1000000,"text_content":"​kkk","section_type":9,"ad_available":false}]',
//         compose_info0:
//           '{"list":[{"blockIdx":1,"content":"<p>​kkk<br></p>","width":574,"height":27,"topMargin":0,"blockType":9,"background":"rgba(0, 0, 0, 0)","text":"kkk","textColor":"rgb(51, 51, 51)","textFontSize":"17px","textBackGround":"rgba(0, 0, 0, 0)"}]}',
//       },
//     })

//     if (!res.appMsgId) {
//       var err = formatError(res)
//       console.log('error', err)
//       throw new Error(
//         '同步失败 错误内容：' + (err && err.errmsg ? err.errmsg : res.ret)
//       )
//     }
//     return {
//       status: 'success',
//       post_id: res.appMsgId,
//       draftLink:
//         'https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit&action=edit&type=10&appmsgid=' +
//         res.appMsgId +
//         '&token=' +
//         weixinMetaCache.token +
//         '&lang=zh_CN',
//     }
//     // https://zhuanlan.zhihu.com/api/articles/68769713/draft
//   }

//   async uploadFile(file) {
//     var formdata = new FormData()
//     var blob = new Blob([file.bits], {
//         type: file.type
//     });

//     formdata.append('type', blob.type)
//     formdata.append('id', new Date().getTime())
//     formdata.append('name', new Date().getTime() + '.jpg')
//     formdata.append('lastModifiedDate', new Date().toString())
//     formdata.append('size', blob.size)
//     formdata.append('file', blob, new Date().getTime() + '.jpg')
    
//     var ticket_id = this.meta.commonData.data.user_name,
//       ticket = this.meta.commonData.data.ticket,
//       svr_time =  this.meta.commonData.data.time,
//       token = this.meta.commonData.data.t,
//       seq = new Date().getTime();

//     var res = await axios({
//       url: \`https://mp.weixin.qq.com/cgi-bin/filetransfer?action=upload_material&f=json&scene=8&writetype=doublewrite&groupid=1&ticket_id=\${ticket_id}&ticket=\${ticket}&svr_time=\${svr_time}&token=\${token}&lang=zh_CN&seq=\${seq}&t=\` + Math.random(),
//       method: 'post',
//       data: formdata,
//       headers: { 'Content-Type': 'multipart/form-data' },
//     })
//     var url = res.data.cdn_url
//     if(res.data.base_resp.err_msg != 'ok') {
//       console.log(res.data);
//       throw new Error('upload failed')
//     }
//     //  return url;
//     return [
//       {
//         id: res.data.content,
//         object_key: res.data.content,
//         url: url,
//       },
//     ]
//   }

//   async uploadFileBySource(file) {
//     var src = file.src
//     var res = await $.ajax({
//       url:
//         'https://mp.weixin.qq.com/cgi-bin/uploadimg2cdn?lang=zh_CN&token=' +
//         weixinMetaCache.token +
//         '&t=' +
//         Math.random(),
//       type: 'POST',
//       dataType: 'JSON',
//       data: {
//         imgurl: src,
//         t: 'ajax-editor-upload-img',
//         token: weixinMetaCache.token,
//         lang: 'zh_CN',
//         f: 'json',
//         ajax: '1',
//       },
//     })

//     if (res.errcode != 0) {
//       throw new Error('图片上传失败' + src)
//     }
//     console.log(res)
//     return [
//       {
//         id: 'aaa',
//         object_key: 'aaa',
//         url: res.url,
//       },
//     ]
//   }

//   async preEditPost(post) {
//     var div = $('<div>')
//     $('body').append(div)

//     if (post.inline_content) {
//       post.content = post.inline_content
//     }

//     div.html(post.content)

//     var doc = div
//     var tags = doc.find('p')
//     for (let mindex = 0; mindex < tags.length; mindex++) {
//       const tag = tags.eq(mindex)
//       try {
//         var nextHasImage = tag.next().children('img').length
//         var span = $('<span></span>')
//         span.html(tag.html())
//         tag.html('')
//         tag.append(span)
//         // if (!tag.children("br").length) tag.css("margin-bottom", "20px");
//         // tag.after("<p><br></p>");
//         // span.css("color", "rgb(68, 68, 68)");
//         // span.css("font-size", "16px");
//       } catch (e) {}
//     }

//     var tags = doc.find('img')
//     for (let mindex = 0; mindex < tags.length; mindex++) {
//       const tag = tags.eq(mindex)
//       const wraperTag = tag.parent()
//       try {
//         tag.removeAttr('_src')
//         tag.attr('style', '')
//         wraperTag.replaceWith('<p>' + wraperTag.html() + '</p>')
//       } catch (e) {}
//     }

//     var pres = doc.find('a')
//     for (let mindex = 0; mindex < pres.length; mindex++) {
//       const pre = pres.eq(mindex)
//       try {
//         pre.after(pre.html()).remove()
//       } catch (e) {}
//     }

//     var processEmptyLine = function (idx, el) {
//       var $obj = $(this)
//       var originalText = $obj.text()
//       var img = $obj.find('img')
//       var brs = $obj.find('br')
//       if (originalText == '') {
//         ;(function () {
//           if (img.length) return
//           if (!brs.length) return
//           $obj.remove()
//         })()
//       }
//     }

//     var processListItem = function (idx, el) {
//       var $obj = $(this)
//       $obj.html($('<p></p>').append($obj.html()))
//     }

//     doc.find('li').each(processListItem)
//     // remove empty break line
//     doc.find('p').each(processEmptyLine)

//     var processBr = function (idx, el) {
//       var $obj = $(this)
//       if (!$obj.next().length) {
//         $obj.remove()
//       }
//     }

//     doc.find('br').each(processBr)
//     post.content = $('<div>')
//       .append(
//         "<section style='margin-left: 6px;margin-right: 6px;line-height: 1.75em;'>" +
//           doc.clone().html() +
//           '</section>'
//       )
//       .html()

//     console.log('post.content', post.content)
//     var inlineCssHTML = juice.inlineContent(
//       post.content,
//       \`
//     /**
//     * common style
//     */

//    html, address,
//    blockquote,
//    body, dd, div,
//    dl, dt, fieldset, form,
//    frame, frameset,
//    h1, h2, h3, h4,
//    h5, h6, noframes,
//    ol, p, ul, center,
//    dir, hr, menu, pre   { display: block; unicode-bidi: embed }
//    li              { display: list-item }
//    head            { display: none }
//    table           { display: table }
//    tr              { display: table-row }
//    thead           { display: table-header-group }
//    tbody           { display: table-row-group }
//    tfoot           { display: table-footer-group }
//    col             { display: table-column }
//    colgroup        { display: table-column-group }
//    td, th          { display: table-cell }
//    caption         { display: table-caption }
//    th              { font-weight: bolder; text-align: center }
//    caption         { text-align: center }
//    body            { margin: 8px }
//    h1              { font-size: 2em; margin: .67em 0 }
//    h2              { font-size: 1.5em; margin: .75em 0 }
//    h3              { font-size: 1.17em; margin: .83em 0 }
//    h4, p,
//    blockquote, ul,
//    fieldset, form,
//    ol, dl, dir,
//    menu            { margin: 1.12em 0 }
//    h5              { font-size: .83em; margin: 1.5em 0 }
//    h6              { font-size: .75em; margin: 1.67em 0 }
//    h1, h2, h3, h4,
//    h5, h6, b,
//    strong          { font-weight: bolder }
//    blockquote      { margin-left: 40px; margin-right: 40px }
//    i, cite, em,
//    var, address    { font-style: italic }
//    pre, tt, code,
//    kbd, samp       { font-family: monospace }
//    pre             { white-space: pre }
//    button, textarea,
//    input, select   { display: inline-block }
//    big             { font-size: 1.17em }
//    small, sub, sup { font-size: .83em }
//    sub             { vertical-align: sub }
//    sup             { vertical-align: super }
//    table           { border-spacing: 2px; }
//    thead, tbody,
//    tfoot           { vertical-align: middle }
//    td, th, tr      { vertical-align: inherit }
//    s, strike, del  { text-decoration: line-through }
//    hr              { border: 1px inset }
//    ol, ul, dir,
//    menu, dd        { margin-left: 40px }
//    ol              { list-style-type: decimal }
//    ol ul, ul ol,
//    ul ul, ol ol    { margin-top: 0; margin-bottom: 0 }
//    u, ins          { text-decoration: underline }
//    br:before       { content: "\A"; white-space: pre-line }
//    center          { text-align: center }
//    :link, :visited { text-decoration: underline }
//    :focus          { outline: thin dotted invert }
   
//    /* Begin bidirectionality settings (do not change) */
//    BDO[DIR="ltr"]  { direction: ltr; unicode-bidi: bidi-override }
//    BDO[DIR="rtl"]  { direction: rtl; unicode-bidi: bidi-override }
   
//    *[DIR="ltr"]    { direction: ltr; unicode-bidi: embed }
//    *[DIR="rtl"]    { direction: rtl; unicode-bidi: embed }
   
//    @media print {
//      h1            { page-break-before: always }
//      h1, h2, h3,
//      h4, h5, h6    { page-break-after: avoid }
//      ul, ol, dl    { page-break-before: avoid }
//    }
//    h1,
//    h2,
//    h3,
//    h4,
//    h5,
//    h6 {
//      font-weight: bold;
//    }
   
//    h1 {
//      font-size: 1.25em;
//      line-height: 1.4em;
//    }
   
//    h2 {
//      font-size: 1.125em;
//    }
   
//    h3 {
//      font-size: 1.05em;
//    }
   
//    h4,
//    h5,
//    h6 {
//      font-size: 1em;
//      margin: 1em 0;
//    }

//     p {
//       color: rgb(51, 51, 51);
//       font-size: 15px;
//     }

//     li p {
//       margin: 0;
//     }
//    \`
//     )
//     console.log('inlineCssHTML new', inlineCssHTML)
//     post.content = inlineCssHTML
//   }
// }

// function formatError(e) {
//   var r,
//     a = {
//       errmsg: '',
//       index: !1,
//     }
//   switch (
//     ('undefined' != typeof e.ret
//       ? (r = 1 * e.ret)
//       : e.base_resp &&
//         'undefined' != typeof e.base_resp.ret &&
//         (r = 1 * e.base_resp.ret),
//     1 * r)
//   ) {
//     case -8:
//     case -6:
//       ;(e.ret = '-6'), (a.errmsg = '请输入验证码')
//       break

//     case 62752:
//       a.errmsg = '可能含有具备安全风险的链接，请检查'
//       break

//     case 64505:
//       a.errmsg = '发送预览失败，请稍后再试'
//       break

//     case 64504:
//       a.errmsg = '保存图文消息发送错误，请稍后再试'
//       break

//     case 64518:
//       a.errmsg = '正文只能包含一个投票'
//       break

//     case 10704:
//     case 10705:
//       a.errmsg = '该素材已被删除'
//       break

//     case 10701:
//       a.errmsg = '用户已被加入黑名单，无法向其发送消息'
//       break

//     case 10703:
//       a.errmsg = '对方关闭了接收消息'
//       break

//     case 10700:
//     case 64503:
//       a.errmsg =
//         '1.接收预览消息的微信尚未关注公众号，请先扫码关注<br /> 2.如果已经关注公众号，请查看微信的隐私设置（在手机微信的“我->设置->隐私->添加我的方式”中），并开启“可通过以下方式找到我”的“手机号”、“微信号”、“QQ号”，否则可能接收不到预览消息'
//       break

//     case 64502:
//       a.errmsg = '你输入的微信号不存在，请重新输入'
//       break

//     case 64501:
//       a.errmsg = '你输入的帐号不存在，请重新输入'
//       break

//     case 412:
//       a.errmsg = '图文中含非法外链'
//       break

//     case 64515:
//       a.errmsg = '当前素材非最新内容，请重新打开并编辑'
//       break

//     case 320001:
//       a.errmsg = '该素材已被删除，无法保存'
//       break

//     case 64702:
//       a.errmsg = '标题超出64字长度限制'
//       break

//     case 64703:
//       a.errmsg = '摘要超出120字长度限制'
//       break

//     case 64704:
//       a.errmsg = '推荐语超出300字长度限制'
//       break

//     case 64708:
//       a.errmsg = '推荐语超出140字长度限制'
//       break

//     case 64515:
//       a.errmsg = '当前素材非最新内容'
//       break

//     case 200041:
//       a.errmsg = '此素材有文章存在违规，无法编辑'
//       break

//     case 64506:
//       a.errmsg = '保存失败,链接不合法'
//       break

//     case 64507:
//       a.errmsg =
//         '内容不能包含外部链接，请输入http://或https://开头的公众号相关链接'
//       break

//     case 64510:
//       a.errmsg = '内容不能包含音频，请调整'
//       break

//     case 64511:
//       a.errmsg = '内容不能包多个音频，请调整'
//       break

//     case 64512:
//       a.errmsg = '文章中音频错误,请使用音频添加按钮重新添加。'
//       break

//     case 64508:
//       a.errmsg = '查看原文链接可能具备安全风险，请检查'
//       break

//     case 64550:
//       a.errmsg = '请勿插入不合法的图文消息链接'
//       break

//     case 64558:
//       a.errmsg = '请勿插入图文消息临时链接，链接会在短期失效'
//       break

//     case 64559:
//       a.errmsg = '请勿插入未群发的图文消息链接'
//       break

//     case -99:
//       a.errmsg = '内容超出字数，请调整'
//       break

//     case 64705:
//       a.errmsg = '内容超出字数，请调整'
//       break

//     case -1:
//       a.errmsg = '系统错误，请注意备份内容后重试'
//       break

//     case -2:
//     case 200002:
//       a.errmsg = '参数错误，请注意备份内容后重试'
//       break

//     case 64509:
//       a.errmsg = '正文中不能包含超过3个视频，请重新编辑正文后再保存。'
//       break

//     case -5:
//       a.errmsg = '服务错误，请注意备份内容后重试。'
//       break

//     case 64513:
//       a.errmsg = '请从正文中选择封面，再尝试保存。'
//       break

//     case -206:
//       a.errmsg = '目前，服务负荷过大，请稍后重试。'
//       break

//     case 10801:
//       ;(a.errmsg =
//         '标题不能有违反公众平台协议、相关法律法规和政策的内容，请重新编辑。'),
//         (a.index = 1 * e.msg)
//       break

//     case 10802:
//       ;(a.errmsg =
//         '作者不能有违反公众平台协议、相关法律法规和政策的内容，请重新编辑。'),
//         (a.index = 1 * e.msg)
//       break

//     case 10803:
//       ;(a.errmsg = '敏感链接，请重新添加。'), (a.index = 1 * e.msg)
//       break

//     case 10804:
//       ;(a.errmsg =
//         '摘要不能有违反公众平台协议、相关法律法规和政策的内容，请重新编辑。'),
//         (a.index = 1 * e.msg)
//       break

//     case 10806:
//       ;(a.errmsg =
//         '正文不能有违反公众平台协议、相关法律法规和政策的内容，请重新编辑。'),
//         (a.index = 1 * e.msg)
//       break

//     case 10808:
//       ;(a.errmsg =
//         '推荐语不能有违反公众平台协议、相关法律法规和政策的内容，请重新编辑。'),
//         (a.index = 1 * e.msg)
//       break

//     case 10807:
//       a.errmsg = '内容不能违反公众平台协议、相关法律法规和政策，请重新编辑。'
//       break

//     case 200003:
//       a.errmsg = '登录态超时，请重新登录。'
//       break

//     case 64513:
//       a.errmsg = '封面必须存在正文中，请检查封面'
//       break

//     case 64551:
//       a.errmsg = '请检查图文消息中的微视链接后重试。'
//       break

//     case 64552:
//       a.errmsg = '请检查阅读原文中的链接后重试。'
//       break

//     case 64553:
//       a.errmsg = '请不要在图文消息中插入超过5张卡券。请删减卡券后重试。'
//       break

//     case 64554:
//       a.errmsg = '在当前情况下不允许在图文消息中插入卡券，请删除卡券后重试。'
//       break

//     case 64555:
//       a.errmsg = '请检查图文消息卡片跳转的链接后重试。'
//       break

//     case 64556:
//       a.errmsg = '卡券不属于该公众号，请删除后重试'
//       break

//     case 64557:
//       a.errmsg = '卡券无效，请删除后重试。'
//       break

//     case 13002:
//       ;(a.errmsg = '该广告卡片已过期，删除后才可保存成功'),
//         (a.index = 1 * e.msg)
//       break

//     case 13003:
//       ;(a.errmsg = '已有文章插入过该广告卡片，一个广告卡片仅可插入一篇文章'),
//         (a.index = 1 * e.msg)
//       break

//     case 13004:
//       ;(a.errmsg = '该广告卡片与图文消息位置不一致'), (a.index = 1 * e.msg)
//       break

//     case 15801:
//     case 15802:
//     case 15803:
//     case 15804:
//     case 15805:
//     case 15806:
//       a.errmsg =
//         e.remind_wording ||
//         '你所编辑的内容可能含有违反微信公众平台平台协议、相关法律法规和政策的内容'
//       break

//     case 1530503:
//       a.errmsg = '请勿添加其他公众号的主页链接'
//       break

//     case 1530504:
//       a.errmsg = '请勿添加其他公众号的主页链接'
//       break

//     case 1530510:
//       a.errmsg = '链接已失效，请在手机端重新复制链接'
//       break

//     case 153007:
//     case 153008:
//     case 153009:
//     case 153010:
//       a.errmsg =
//         '很抱歉，原创声明不成功|你的文章内容未达到声明原创的要求，满足以下任一条件可发起声明：<br />1、文章文字字数大于300字，且自己创作的内容大于引用内容<br />2、文章文字字数小于300字，无视频，且图片（包括封面图）均为你已成功声明原创的图片<br />说明：上述要求中，文章文字字数不包含标点符号和空格，请知悉。'
//       break

//     case 153200:
//       a.errmsg = '无权限声明原创，取消声明后重试'
//       break

//     case 1530511:
//       a.errmsg = '链接已失效，请在手机端重新复制链接'
//       break

//     case 220001:
//       a.errmsg = '"素材管理"中的存储数量已达到上限，请删除后再操作。'
//       break

//     case 220002:
//       a.errmsg = '你的图片库已达到存储上限，请进行清理。'
//       break

//     case 153012:
//       a.errmsg = '请设置转载类型'
//       break

//     case 200042:
//       a.errmsg = '图文中包含的小程序素材不能多于50个、小程序帐号不能多于10个'
//       break

//     case 200043:
//       a.errmsg = '图文中包含没有关联的小程序，请删除后再保存'
//       break

//     case 64601:
//       a.errmsg = '一篇文章只能插入一个广告卡片'
//       break

//     case 64602:
//       a.errmsg = '尚未开通文中广告位，但文章中有广告'
//       break

//     case 64603:
//       a.errmsg = '文中广告前不足300字'
//       break

//     case 64604:
//       a.errmsg = '文中广告后不足300字'
//       break

//     case 64605:
//       a.errmsg = '文中不能同时插入文中广告和互选广告'
//       break

//     case 65101:
//       a.errmsg = '图文模版数量已达到上限，请删除后再操作'
//       break

//     case 64560:
//       a.errmsg = '请勿插入历史图文消息页链接'
//       break

//     case 64561:
//       a.errmsg = '请勿插入mp.weixin.qq.com域名下的非图文消息链接'
//       break

//     case 64562:
//       a.errmsg = '请勿插入非mp.weixin.qq.com域名的链接'
//       break

//     case 153013:
//       a.errmsg = '文章内含有投票，不能设置为开放转载'
//       break

//     case 153014:
//       a.errmsg = '文章内含有卡券，不能设置为开放转载'
//       break

//     case 153015:
//       a.errmsg = '文章内含有小程序链接，不能设置为开放转载'
//       break

//     case 153016:
//       a.errmsg = '文章内含有小程序链接，不能设置为开放转载'
//       break

//     case 153017:
//       a.errmsg = '文章内含有小程序卡片，不能设置为开放转载'
//       break

//     case 153018:
//       a.errmsg = '文章内含有商品，不能设置为开放转载'
//       break

//     case 153019:
//       a.errmsg = '文章内含有广告卡片，不能设置为开放转载'
//       break

//     case 153020:
//       a.errmsg = '文章内含有广告卡片，不能设置为开放转载'
//       break

//     case 153021:
//       a.errmsg = '文章内含有广告卡片，不能设置为开放转载'
//       break

//     case 153101:
//       a.errmsg = '含有原文已删除的转载文章，请删除后重试'
//       break

//     case 64707:
//       a.errmsg = '赞赏账户授权失效或者状态异常'
//       break

//     case 420001:
//       a.errmsg = '封面图不支持GIF，请更换'
//       break

//     case 353004:
//       a.errmsg = '不支持添加商品，请删除后重试'
//       break

//     case 442001:
//       a.errmsg = '帐号新建/编辑素材能力已被封禁，暂不可使用。'
//       break

//     default:
//       a.errmsg = '系统繁忙，请稍后重试'
//   }
//   return a
// }
// `
//             },
            {
                fileName: 'zhihu.js',
                content: `// 知乎 demo
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getChildren(obj, count) {
  count++
  if (count > 4) return null
  if (obj.children().length > 1) return obj
  return getChildren(obj.children().eq(0), count)
}

function CodeBlockToPlainTextOther(pre) {
  var text = []
  var minSub = getChildren(pre, 0)
  var lines = minSub.children()
  for (let index = 0; index < lines.length; index++) {
    const element = lines.eq(index)
    const codeStr = element.text()
    text.push('<code>' + escapeHtml(codeStr) + '</code>')
  }
  return text.join('\n')
}

function CodeBlockToPlainText(pre) {
  var text = []
  var minSub = getChildren(pre, 0)
  var lines = pre.find('code')
  if (lines.length > 1) {
    return CodeBlockToPlainTextOther(pre)
  }

  for (let index = 0; index < lines.length; index++) {
    const element = lines.eq(index)
    const codeStr = element[0].innerText
    console.log('codeStr', codeStr)
    var codeLines = codeStr.split('\n')
    codeLines.forEach((codeLine) => {
      text.push('<code>' + escapeHtml(codeLine) + '</code>')
    })
  }
  return text.join('\n')
}

class ZhiHuDriver {
  constructor() {
    // this.skipReadImage = true
    this.version = '0.0.1'
    this.name = 'zhihu'
  }

  async getMetaData() {
    var res = await $.ajax({
      url:
        'https://www.zhihu.com/api/v4/me?include=account_status%2Cis_bind_phone%2Cis_force_renamed%2Cemail%2Crenamed_fullname',
    })
    // console.log(res);
    return {
      uid: res.uid,
      title: res.name,
      avatar: res.avatar_url,
      supportTypes: ['html'],
      type: 'zhihu',
      displayName: '知乎',
      home: 'https://www.zhihu.com/settings/account',
      icon: 'https://static.zhihu.com/static/favicon.ico',
    }
  }

  async addPost(post) {
    var res = await $.ajax({
      url: 'https://zhuanlan.zhihu.com/api/articles/drafts',
      type: 'POST',
      dataType: 'JSON',
      contentType: 'application/json',
      data: JSON.stringify({
        title: post.post_title,
        // content: post.post_content
      }),
    })
    console.log(res)
    return {
      status: 'success',
      post_id: res.id,
    }
    //
  }

  async editPost(post_id, post) {
    console.log('editPost', post.post_thumbnail)
    var res = await $.ajax({
      url: 'https://zhuanlan.zhihu.com/api/articles/' + post_id + '/draft',
      type: 'PATCH',
      contentType: 'application/json',
      data: JSON.stringify({
        title: post.post_title,
        content: post.post_content,
        isTitleImageFullScreen: false,
        titleImage: 'https://pic1.zhimg.com/' + post.post_thumbnail + '.png',
      }),
    })

    return {
      status: 'success',
      post_id: post_id,
      draftLink: 'https://zhuanlan.zhihu.com/p/' + post_id + '/edit',
    }
    // https://zhuanlan.zhihu.com/api/articles/68769713/draft
  }

  untiImageDone(image_id) {
    return new Promise(function(resolve, reject) {
      function waitToNext() {
        console.log('untiImageDone', image_id);
        (async () => {
          var imgDetail = await $.ajax({
            url: 'https://api.zhihu.com/images/' + image_id,
            type: 'GET',
          })
          console.log('imgDetail', imgDetail)
          if (imgDetail.status != 'processing') {
            console.log('all done')
            resolve(imgDetail)
          } else {
            // console.log('go next', waitToNext)
            setTimeout(waitToNext, 300)
          }
        })()
      }
      waitToNext()
    })
  }

  async _uploadFile(file) {
    var src = file.src
    var res = await $.ajax({
      url: 'https://zhuanlan.zhihu.com/api/uploaded_images',
      type: 'POST',
      headers: {
        accept: '*/*',
        'x-requested-with': 'fetch',
      },
      data: {
        url: src,
        source: 'article',
      },
    })

    return [
      {
        id: res.hash,
        object_key: res.hash,
        url: res.src,
      },
    ]
  }

  async uploadFile(file) {
    console.log('ZhiHuDriver.uploadFile', file, md5)
    var updateData = JSON.stringify({
      image_hash: md5(file.bits),
      source: 'article',
    })
    console.log('upload', updateData)
    var fileResp = await $.ajax({
      url: 'https://api.zhihu.com/images',
      type: 'POST',
      dataType: 'JSON',
      contentType: 'application/json',
      data: updateData,
    })

    console.log('upload', fileResp)

    var upload_file = fileResp.upload_file
    if (fileResp.upload_file.state == 1) {
      var imgDetail = await this.untiImageDone(upload_file.image_id)
      console.log('imgDetail', imgDetail)
      upload_file.object_key = imgDetail.original_hash
    } else {
      var token = fileResp.upload_token
      let client = new OSS({
        endpoint: 'https://zhihu-pics-upload.zhimg.com',
        accessKeyId: token.access_id,
        accessKeySecret: token.access_key,
        stsToken: token.access_token,
        cname: true,
        bucket: 'zhihu-pics',
      })
      var finalUrl = await client.put(
        upload_file.object_key,
        new Blob([file.bits])
      )
      console.log(client, finalUrl)
    }
    console.log(file, fileResp)

    if (file.type === 'image/gif') {
      // add extension for gif
      upload_file.object_key = upload_file.object_key + '.gif';
    }
    return [
      {
        id: upload_file.object_key,
        object_key: upload_file.object_key,
        url: 'https://pic4.zhimg.com/' + upload_file.object_key,
        // url: 'https://pic1.zhimg.com/80/' + upload_file.object_key + '_hd.png',
      },
    ]
  }

  async preEditPost(post) {
    var div = $('<div>')
    $('body').append(div)

    // post.content = post.content.replace(/\>\s+\</g,'');
    div.html(post.content)

    // var org = $(post.content);
    // var doc = $('<div>').append(org.clone());
    var doc = div
    var pres = doc.find('pre')
    console.log('find code blocks', pres.length, post)
    for (let mindex = 0; mindex < pres.length; mindex++) {
      const pre = pres.eq(mindex)
      try {
        var newHtml = CodeBlockToPlainText(pre, 0)
        if (newHtml) {
          console.log(newHtml)
          pre.html(newHtml)
        }
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

      // try to replace as h2;
      var strongTag = $obj.find('strong').eq(0)
      var childStrongText = strongTag.text()
      if (originalText == childStrongText) {
        var strongSize = null
        var tagStart = strongTag
        var align = null
        for (let index = 0; index < 4; index++) {
          var fontSize = tagStart.css('font-size')
          var textAlign = tagStart.css('text-align')
          if (fontSize) {
            strongSize = fontSize
          }
          if (textAlign) {
            align = textAlign
          }
          if (align && strongSize) break
          if (tagStart == $obj) {
            console.log('near top')
            break
          }
          tagStart = tagStart.parent()
        }
        if (strongSize) {
          var theFontSize = parseInt(strongSize)
          if (theFontSize > 17 && align == 'center') {
            var newTag = $('<h2></h2>').append($obj.html())
            $obj.after(newTag).remove()
          }
        }
      }
    }

    // remove empty break line
    doc.find('p').each(processEmptyLine)
    doc.find('section').each(processEmptyLine)

    var processBr = function (idx, el) {
      var $obj = $(this)
      if (!$obj.next().length) {
        $obj.remove()
      }
    }
    doc.find('br').each(processBr)
    // table {
    //     margin-bottom: 10px;
    //     border-collapse: collapse;
    //     display: table;
    //     width: 100%!important;
    // }
    // td, th {
    //     word-wrap: break-word;
    //     word-break: break-all;
    //     padding: 5px 10px;
    //     border: 1px solid #DDD;
    // }

    // console.log('found table', doc.find('table'))
    var tempDoc = $('<div>').append(doc.clone())
    post.content =
      tempDoc.children('div').length == 1
        ? tempDoc.children('div').html()
        : tempDoc.html()
    // div.remove();
  }
}

exports.driver = ZhiHuDriver
 `
            }
        ]
}