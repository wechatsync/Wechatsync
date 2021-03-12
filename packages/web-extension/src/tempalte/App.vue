<template>
  <el-card class="box-card">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="顶部签名" name="header">
            <div
              @blur="headerChange"
              ref="header"
              contenteditable="true"
              v-html="currentTemplate.definition.header"
            ></div>
          </el-tab-pane>
          <el-tab-pane label="底部签名" name="footer">
            <div
              contenteditable="true"
              v-html="currentTemplate.definition.footer"
            ></div>
          </el-tab-pane>
          <el-tab-pane label="标题" name="h2">
            <el-checkbox
              v-model="currentTemplate.definition.autodetect.strongAsHeader"
              >检测单行加粗体字为大标题</el-checkbox
            >
            <el-checkbox v-model="currentTemplate.definition.h2.enable_custom"
              >自定义模版</el-checkbox
            >
            <Styleditor
              v-if="!currentTemplate.definition.h2.enable_custom"
              @style="h2StyleChange"
              :allow="[
                'margin-top',
                'margin-bottom',
                'text-align',
                'font-weight',
                'font-size',
              ]"
              :styl="currentTemplate.definition.h2.styles"
            />
            <div
              v-if="currentTemplate.definition.h2.enable_custom"
              contenteditable="true"
              v-html="currentTemplate.definition.h2.custom"
            ></div>
          </el-tab-pane>
          <el-tab-pane label="段落" name="paragraph">
            <Styleditor
              @style="paragraphStyleChange"
              :styl="currentTemplate.definition.paragraph.styles"
            />
          </el-tab-pane>
          <el-tab-pane label="图片" name="image">
            <Styleditor
              @style="imageStyleChange"
              :allow="['margin-top', 'margin-bottom']"
              :styl="currentTemplate.definition.image.styles"
            />
          </el-tab-pane>
          <el-tab-pane label="配置" name="config">
            <json-viewer
              :expand-depth="5"
              :value="currentTemplate.definition"
            ></json-viewer>
          </el-tab-pane>
        </el-tabs>
      </el-col>
      <el-col :span="12">
        <div id="article" style="position: relative">
          <p>预览</p>
          <iframe
            id="ueditor_0"
            ref="content"
            allowtransparency="true"
            width="100%"
            height="100%"
            frameborder="0"
            @load="compelet"
          ></iframe>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>
<script>
var PouchDB = require('pouchdb').default

import ClickOutside from 'vue-click-outside'

PouchDB.plugin(require('pouchdb-find').default)
// console.log(PouchDB);
var db = new PouchDB('articles')
var trash = new PouchDB('trash-articles')
// db.put({
//   _id: 'dave@gmail.com',
//   name: 'David',
//   age: 69
// });

// db.changes().on('change', function() {
//   console.log('Ch-Ch-Changes');
// });

var service = analytics.getService('syncer')
var tracker = service.getTracker('UA-48134052-13')

var axios = require('axios')

import { Autoformat } from '../util/AutoFormat'
import Styleditor from './StyleEditor.vue'
export default {
  name: '',
  components: {
    Styleditor,
  },
  data() {
    return {
      contentType: 'html',
      submitting: false,
      pageData: {},
      visible: false,
      list: [],
      value: '',
      activeName: 'header',
      taskStatus: {},
      allAccounts: [],
      currentArtitle: {},
      markdownOption: {},
      demoHtml: `
        <p data-mpa-powered-by="yiban.io"><span style="color: rgb(214, 214, 214);">&#8203;原文被知乎日报收录，听说八成的人都没猜出答案。<mpchecktext contenteditable="false" id="1575451174014_0.8607480014604654"></mpchecktext></span><span style="color: rgb(214, 214, 214);">第一次发到公众号来，我也顺便优化了文章，也增加了新的内容。<mpchecktext contenteditable="false" id="1575451174015_0.1595500836987649"></mpchecktext></span></p><p>英国的人机交互课题都喜欢研究一些和文化、游戏、智能硬件、弱势群体之类的“大课题”，而我却偏喜欢琢磨一些接地气的东西，比如说：<mpchecktext contenteditable="false" id="1575451174017_0.42911399444370124"></mpchecktext>确定按钮应该放在左边还是右边？<mpchecktext contenteditable="false" id="1575451174016_0.3249541109870937"></mpchecktext></p><p><img class="rich_pages" data-ratio="0.3638888888888889" data-s="300,640" src="https://mmbiz.qpic.cn/mmbiz_png/UzDNI6O6hCFrSLTKwupehlrMymnZKhnPEib3HV3OJSSmHaiafIfejtgIS46Ucia1VCGlUsUD7zgFibFBSRIsogDLyA/640?wx_fmt=png" data-type="png" data-w="720" style="width: 590px !important;visibility: visible !important;" width="590px"><br></p><p>做PC端得人看到这个问题，可能第一反应是：<mpchecktext contenteditable="false" id="1575451174020_0.1587791631575486"></mpchecktext>放在哪边看的清楚些？<mpchecktext contenteditable="false" id="1575451174018_0.3823335613321368"></mpchecktext>而做移动端的人看到这个问题，也许会想：<mpchecktext contenteditable="false" id="1575451174021_0.11781327021816845"></mpchecktext>放在哪边方便点击？<mpchecktext contenteditable="false" id="1575451174019_0.38188927526344885"></mpchecktext></p><p><br></p><p><img class="rich_pages" data-ratio="0.5361111111111111" data-s="300,640" src="https://mmbiz.qpic.cn/mmbiz_png/UzDNI6O6hCGq7xbxKMlXmicLRx3vbzriaDcDYvukiakJbtWCeicFuicMv5gceatpULIGCJr2X873FtcOaSOmvtPVYeg/640?wx_fmt=png" data-type="png" data-w="720" style="width: 590px !important;visibility: visible !important;" width="590px"><br></p><p><br></p><p>要分析交互形式的好坏，最直观的数据指标就是操作时间与错误率这两种。<mpchecktext contenteditable="false" id="1575451174022_0.36653404466407413"></mpchecktext></p><p><br></p><p><strong>操作时间有差异吗？<mpchecktext contenteditable="false" id="1575451174023_0.5901205339144739"></mpchecktext></strong></p><p>早在 2004 年，就有叫做 Walker 和 Stanley 的两人针对这个问题做了研究实验。<mpchecktext contenteditable="false" id="1575451174024_0.40312918180293433"></mpchecktext>他们用 Windows 98 做了一个类似弹窗游戏的程序，让用户点击 Yes 或 No 来选择是否购买股票。<mpchecktext contenteditable="false" id="1575451174025_0.8444030471363153"></mpchecktext>规则是当价格低于一定值的时候买，高于一定值的时候卖。<mpchecktext contenteditable="false" id="1575451174026_0.899881523697843"></mpchecktext></p><p>结果显示，操作按钮在左侧时，用户的反应速度要快一些。<mpchecktext contenteditable="false" id="1575451174027_0.5917584491126795"></mpchecktext>快多少呢，100 毫秒而已。<mpchecktext contenteditable="false" id="1575451174028_0.6264663717083248"></mpchecktext>我觉得这个差距在实际生活中可以忽视了吧…<mpchecktext contenteditable="false" id="1575451174029_0.8849619429413804"></mpchecktext></p><p><br></p><p><img class="rich_pages" data-croporisrc="https://mmbiz.qlogo.cn/mmbiz_png/UzDNI6O6hCGq7xbxKMlXmicLRx3vbzriaDgaS6sTgpMpDL180NzpchwLs2P4iaWAgo5rfvkeegEqGeVpZa3hlibuaw/0?wx_fmt=png" data-cropx1="0" data-cropx2="1632" data-cropy1="0" data-cropy2="967.2167832167833" data-ratio="0.59140625" data-s="300,640" src="https://mmbiz.qpic.cn/mmbiz_jpg/UzDNI6O6hCGq7xbxKMlXmicLRx3vbzriaDldqjNHRiaibwYj8flYMXor7zmCrJjG32kjbfwqxx2tGg1xznGWnDFu9A/640?wx_fmt=jpeg" data-type="jpeg" data-w="1280" style="border-color: rgb(238, 238, 238);border-style: solid;border-width: 1px;border-radius: 9px;width: 572px !important;visibility: visible !important;" width="572px"><br></p><p><br></p><p><br></p><p>再说这种不断点弹窗的游戏，已经完全脱离了真实的使用场景，即便测出了什么，也不具备足够的体验设计借鉴价值。<mpchecktext contenteditable="false" id="1575451174030_0.815715023429834"></mpchecktext>看来操作时间这个指标，不太好用。<mpchecktext contenteditable="false" id="1575451174031_0.05927219867955036"></mpchecktext></p><p><br></p><p><strong>错误率有差异吗？<mpchecktext contenteditable="false" id="1575451174032_0.43483515860851973"></mpchecktext></strong></p><p>我发现错误率还没人研究，于是就自己做了一个实验。<mpchecktext contenteditable="false" id="1575451174033_0.5148244964486037"></mpchecktext>我手动码了下面这两个网站（为了优化文章阅读体验，下图为示意，与真实的网站不完全一致），用户被要求填写一些基本信息，然后从九张图片中选择自己最喜欢的。<mpchecktext contenteditable="false" id="1575451174034_0.9766579971708813"></mpchecktext>这两个网站几乎一模一样，唯一的区别在于选图页面确定按钮与取消按钮的位置。<mpchecktext contenteditable="false" id="1575451174035_0.5323373011973929"></mpchecktext></p><p>为了让实验更加真实，我会“诱骗”参与者，不告诉他们测试的真实目的。<mpchecktext contenteditable="false" id="1575451174036_0.5231124123884792"></mpchecktext>总共 30 人从我手中接过 iPad 参加这个实验，也就是说每组15人。<mpchecktext contenteditable="false" id="1575451174037_0.9361936906490571"></mpchecktext></p><p><span style="color: rgb(214, 214, 214);">P.S. 很多心理学/行为学实验都是这个样本量，不是大数据那套玩法。<mpchecktext contenteditable="false" id="1575451174038_0.8451381559027475"></mpchecktext></span></p><p><br></p><p><img class="rich_pages  __bg_gif" data-ratio="0.8328125" src="https://mmbiz.qpic.cn/mmbiz_gif/UzDNI6O6hCGq7xbxKMlXmicLRx3vbzriaDt41FetJmJQZLzpSiaSyz3yPCtSLXuMZHZjZQQEeYsXzudNrZslzcFBQ/640?wx_fmt=gif" data-type="gif" data-w="640" style="width: 590px !important;visibility: visible !important;" width="590px"><br></p><p><br></p><p><br></p><p>结果，现实狠狠地给我一个教训，两组的错误率像差无几！<mpchecktext contenteditable="false" id="1575451174039_0.4325303255078541"></mpchecktext>确定在左边时错误率高一些，但也没有达到统计学上的“有感”。<mpchecktext contenteditable="false" id="1575451174040_0.40768597961680797"></mpchecktext></p><p><br></p><p><br></p><p><strong>错误率真的看不出问题吗？<mpchecktext contenteditable="false" id="1575451174041_0.1025307312868502"></mpchecktext></strong></p><p>虽然第一次实验失败了，但是我总觉得有哪里不对。<mpchecktext contenteditable="false" id="1575451174043_0.31397006661451843"></mpchecktext>作为一名用户，我并不认为确定按钮的位置是无所谓的，但为什么表现在操作时间和错误率上的差异会如此无感？<mpchecktext contenteditable="false" id="1575451174042_0.6029549726410393"></mpchecktext></p><p>思考了很久之后，我对原有的实验做了优化。<mpchecktext contenteditable="false" id="1575451174044_0.6585056049091358"></mpchecktext>两个网站几乎与之前一模一样，唯一的差别是，在选了最喜欢的图片后，用户会被要求选择最不喜欢的图片。<mpchecktext contenteditable="false" id="1575451174045_0.4345405808670939"></mpchecktext></p><p><br></p><p><img class="rich_pages  __bg_gif" data-ratio="0.8328125" src="https://mmbiz.qpic.cn/mmbiz_gif/UzDNI6O6hCGq7xbxKMlXmicLRx3vbzriaD1Vtvau3AP2Tibw7fgYChXtZfOgAVbGVkIxiaBxcvoBKog5vMNOcAHTpw/640?wx_fmt=gif" data-type="gif" data-w="640" style="width: 590px !important;visibility: visible !important;" width="590px"><br></p><p><br></p><p><br></p><p><br></p><p>结果却出现了神奇的反转：<mpchecktext contenteditable="false" id="1575451174047_0.7638416903226775"></mpchecktext>第一个页面的错误率与上次没有差别（肯定的），第二个页面的错误率不但大大增加，而且两组之间出现三倍的差异！<mpchecktext contenteditable="false" id="1575451174046_0.18392764437952236"></mpchecktext></p><p><br></p><p><img class="rich_pages" data-ratio="0.625" data-s="300,640" src="https://mmbiz.qpic.cn/mmbiz_png/UzDNI6O6hCGq7xbxKMlXmicLRx3vbzriaDoSmVfmVrqVnhKpfqXGUIHSPF2lvicgwiagx6CC0qFG5ialwY6pGTk3A3g/640?wx_fmt=png" data-type="png" data-w="720" style="width: 590px !important;visibility: visible !important;" width="590px"><br></p><p><br></p><p><br></p><p><strong>看不见的用户心理<mpchecktext contenteditable="false" id="1575451174048_0.5688520061066691"></mpchecktext></strong></p><p>无论是哪一组，用户在第一次点击确定按钮时，错误率都不高。<mpchecktext contenteditable="false" id="1575451174050_0.672152490793404"></mpchecktext>而为什么在第二页交换按钮位置后，为什么只有从右变到左的B组，错误率从 0 逆转至 66.66% 呢？<mpchecktext contenteditable="false" id="1575451174049_0.9971109244105034"></mpchecktext>而从左变到右的A组，错误率从 13.33%到23.08% 也不过翻了一倍而已（虽然这也很夸张了）。<mpchecktext contenteditable="false" id="1575451174051_0.9686191848736745"></mpchecktext></p><p>想一想按钮位置是不是和开门很像呢？<mpchecktext contenteditable="false" id="1575451174052_0.8024211630947076"></mpchecktext>虽然通常室内设计都是“推门而入”，但有时候我们也不知道而该推门还是拉门。<mpchecktext contenteditable="false" id="1575451174053_0.09617926274084243"></mpchecktext></p><p>有天小蓝来到一栋陌生大楼，因为第一次来，所以他推门稍稍前留了一个心眼。<mpchecktext contenteditable="false" id="1575451174054_0.27759642288703423"></mpchecktext>他在门上看到了一个“拉”字，于是立即反应过来，停止推门的动作，改为拉门而入。<mpchecktext contenteditable="false" id="1575451174055_0.9724081341995114"></mpchecktext>进去后，走着走着，又遇到一个门。<mpchecktext contenteditable="false" id="1575451174056_0.28963386539928315"></mpchecktext>他记着刚才的教训，这次动手前仔细看了一眼，结果发现门上写的是“推”字。<mpchecktext contenteditable="false" id="1575451174057_0.8116680965830423"></mpchecktext></p><p>小红也同样来到一个陌生的大楼，她在推门前也稍稍留了个心眼。<mpchecktext contenteditable="false" id="1575451174058_0.9690685858816519"></mpchecktext>幸运的是大门和她的习惯一样，都是朝里推的，所以她没有遇到任何阻碍就进入了这栋楼。<mpchecktext contenteditable="false" id="1575451174059_0.9570722295305694"></mpchecktext>由于进大门时没有阻碍，所以她在遇到第二扇门时，就没再多想，直接推门。<mpchecktext contenteditable="false" id="1575451174060_0.6630349926033468"></mpchecktext>结果推了几次才发现门上写的是“拉”字。<mpchecktext contenteditable="false" id="1575451174061_0.7969911772410512"></mpchecktext></p><p><br></p><p><img class="rich_pages" data-ratio="0.5333333333333333" data-s="300,640" src="https://mmbiz.qpic.cn/mmbiz_png/UzDNI6O6hCGq7xbxKMlXmicLRx3vbzriaDb77br7I77PvIFo3HBuJVfyrPIicYPXXLNtrZ6W7K9vw9XMbJwSUwCJg/640?wx_fmt=png" data-type="png" data-w="720" style="width: 590px !important;visibility: visible !important;" width="590px"><br></p><p><br></p><p><br></p><p><br></p><p>如果把小明看作A组用户，小红看作B组用户，错误率的差异就不难理解了。<mpchecktext contenteditable="false" id="1575451174062_0.6745797139779417"></mpchecktext>因为A组用户在第一次尝试时差点吃亏，于是吸取了教训，第二次格外小心；<mpchecktext contenteditable="false" id="1575451174064_0.4579875979008603"></mpchecktext>反观B组用户，第一次畅通无阻，于是就看不到第二次的坑。<mpchecktext contenteditable="false" id="1575451174063_0.2250103173658604"></mpchecktext></p><p>想到这里，感觉太棒了，终于得出结论了！<mpchecktext contenteditable="false" id="1575451174066_0.8192292473337963"></mpchecktext>所以确定按钮应该放在左边才是最顺手的对吗？<mpchecktext contenteditable="false" id="1575451174065_0.6254136638794066"></mpchecktext>非也！<mpchecktext contenteditable="false" id="1575451174067_0.014535837855363498"></mpchecktext></p><p><br></p><p><strong>一开始就问错了问题<mpchecktext contenteditable="false" id="1575451174068_0.3492429905564405"></mpchecktext></strong></p><p>确定按钮无论在左边在右边，单次操作时间和错误率都没有多大的差别，哪怕真的有影响，那点微乎其微的差异真的没有纠结的必要，简直浪费时间。<mpchecktext contenteditable="false" id="1575451174069_0.7791044254193884"></mpchecktext></p><p>而且无论做什么实验，都会收到设备和系统的影响。<mpchecktext contenteditable="false" id="1575451174070_0.2791689454521462"></mpchecktext>我的实验使用的是 iPad 网页浏览器，说实话也不一定具备完全的代表性。<mpchecktext contenteditable="false" id="1575451174071_0.8748671263237222"></mpchecktext></p><p>我认为这个实验真正教会我们的是，不要轻易违背用户习惯！<mpchecktext contenteditable="false" id="1575451174072_0.6117413063103601"></mpchecktext></p><p>为了提高效率，我们的很多行为，不是靠大脑思考的，而是靠身体记忆的。<mpchecktext contenteditable="false" id="1575451174074_0.9500610296330987"></mpchecktext>人们通常只会在第一次接触新事物时，启用大脑，之后大部分情况都处于“无意识状态”。<mpchecktext contenteditable="false" id="1575451174075_0.21625377539473845"></mpchecktext>也就是说，除了第一次，以后都不要指望用户再动脑筋！<mpchecktext contenteditable="false" id="1575451174073_0.8830747164271342"></mpchecktext></p><p>有本书叫做 Don't Make Me Think ，其实我觉得可以加一句 NEVER Make Me Think Again。<mpchecktext contenteditable="false" id="1575451174076_0.7680761817821165"></mpchecktext></p><p><img class="rich_pages" data-ratio="0.5972222222222222" data-s="300,640" src="https://mmbiz.qpic.cn/mmbiz_png/UzDNI6O6hCGq7xbxKMlXmicLRx3vbzriaDvBsO2e4p3ErsJz1WQDn6MTJxicbqvh9eCesQmaiaobvvgy4Paj1sGdBQ/640?wx_fmt=png" data-type="png" data-w="720" style="width: 590px !important;visibility: visible !important;" width="590px"><br></p><p><br></p><p><strong>所以，确定按钮到底要放哪？<mpchecktext contenteditable="false" id="1575451174077_0.8543834878443435"></mpchecktext></strong></p><p>确定按钮无论在左边还是在右边，遵循系统规范才是最稳妥的。<mpchecktext contenteditable="false" id="1575451174078_0.758247716361089"></mpchecktext>倒不是说他们设计得一定多好，而是因为操作系统就好比一栋大楼，用户在进入你的房间之前，必定经过了这栋的大门，所以十有八九已经“被养成”一定的操作习惯了。<mpchecktext contenteditable="false" id="1575451174079_0.007411968548081793"></mpchecktext></p><p>现在除了 Windows 之外，其它大部分操作系统，不论是PC还是移动，都普遍把确定按钮放在右边。<mpchecktext contenteditable="false" id="1575451174080_0.5089019843112719"></mpchecktext>所以再决定按钮之前，想一想你的用户是从哪个系统来的就好。<mpchecktext contenteditable="false" id="1575451174081_0.9373846558639201"></mpchecktext></p><p><img class="rich_pages" data-ratio="0.75" data-s="300,640" src="https://mmbiz.qpic.cn/mmbiz_png/UzDNI6O6hCGq7xbxKMlXmicLRx3vbzriaDtCvkvCBF5vCngibh4I5gg7UNAdE0E3ibEHJNFR2mMpm7z1icfWmcfQHJg/640?wx_fmt=png" data-type="png" data-w="720" style="width: 590px !important;visibility: visible !important;" width="590px"><br></p><p><br></p><p><br></p><p><img class="rich_pages" data-ratio="0.5861111111111111" data-s="300,640" src="https://mmbiz.qpic.cn/mmbiz_png/UzDNI6O6hCGq7xbxKMlXmicLRx3vbzriaDybOeLY7DsZcia1hkDH4ITH2cbwZ8F2fDMJlibmIXFNhhtmnSlopKibv7g/640?wx_fmt=png" data-type="png" data-w="720" style="width: 590px !important;visibility: visible !important;" width="590px"><br></p><p><br></p><p><br></p><p>除了按钮之外，统一规则还可以延展至其它的控件、布局和概念。<mpchecktext contenteditable="false" id="1575451174082_0.49121595197258183"></mpchecktext>让用户养成习惯，直至不带脑子就可以使用你的产品，这样就不会踩坑了。<mpchecktext contenteditable="false" id="1575451174083_0.8121983249808924"></mpchecktext></p><p>甚至你把用户培养好后，他们会产生依赖，即便遇到设计得更有理有据的产品，也都懒得切换了。<mpchecktext contenteditable="false" id="1575451174084_0.9995344047443604"></mpchecktext>因为任何人都会对陌生事物产生顾虑，哪怕新路更省时省力省钱，也更愿意走自己熟悉的老路。<mpchecktext contenteditable="false" id="1575451174085_0.9196765252321886"></mpchecktext></p><p><br></p><p style="font-size: 15px; margin-bottom: 30px;"><img class="rich_pages" data-ratio="0.5" data-s="300,640" src="https://mmbiz.qpic.cn/mmbiz_png/UzDNI6O6hCGq7xbxKMlXmicLRx3vbzriaDEJZqbDKibMFJibNOY1C5rsjzASZB1TExCdZiav6u3ShTKZib3k1zgONvJg/640?wx_fmt=png" data-type="png" data-w="720" style="font-size: 17px;width: 590px !important;visibility: visible !important;" width="590px"><br></p>
      `,
      currentTemplate: null,
      templates: [
        {
          name: '默认',
          definition: {
            // 正文默认字体大小
            font: {
              size: '15px',
            },
            autodetect: {
              // 自动检测加粗的段落为h2
              strongAsHeader: true,
            },
            // 图片样式
            image: {
              styles: [
                {
                  name: 'margin-top',
                  value: '5px',
                },
                {
                  name: 'margin-bottom',
                  value: '25px',
                },
              ],
            },
            // 段落样式
            paragraph: {
              styles: [
                {
                  name: 'font-size',
                  value: '15px',
                },
                {
                  name: 'margin-bottom',
                  value: '30px',
                },
              ],
            },

            // 标题样式
            h2: {
              // 自定义模板
              enable_custom: true,
              custom: `
      <section style="display:flex;align-items: center;justify-content: center; margin-bottom: 25px"><section style="width:30px;height:30px;border-radius:100%;border:1px solid rgb(248,212,151);margin-top: -30px;margin-right:-15px;"></section><section style="padding:5px 20px;background:rgb(57,207,202);"><p class="white title" style="font-size:18px;color:rgb(255,255,255);min-width:1em;">{value}</p></section><section style="width:20px;height:20px;border-radius:100%;border:1px solid rgb(248,212,151);margin-left:5px;"></section></section>
      `,
              styles: [
                {
                  name: 'font-size',
                  value: '20px',
                },
                {
                  name: 'margin-bottom',
                  value: '30px',
                },
                {
                  name: 'text-align',
                  value: 'center',
                },
                {
                  name: 'font-weight',
                  value: 'bold',
                },
              ],
            },
            // 试图样式
            viewport: {
              styles: [
                {
                  name: 'margin',
                  value: '0 8px 0 8px',
                },
              ],
            },
            // 底部签名
            footer: `
      <section style="margin-right: 8px;margin-left: 8px;max-width: 100%;text-align: center;box-sizing: border-box !important;overflow-wrap: break-word !important;"><img class="rich_pages " data-cropselx1="0" data-cropselx2="558" data-cropsely1="0" data-cropsely2="310" data-ratio="0.5555555555555556" data-s="300,640" data-type="png" data-w="720" data-src="https://mmbiz.qpic.cn/mmbiz_png/UzDNI6O6hCH8dXvlJwcBIroKJRWu6AmqKaCs2icnhHqUvt9mYicREVQXvMwho2tUXEwxiaRdy6L9MWwU0VxqnjcrQ/640?wx_fmt=png" style="box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible !important; width: 379px !important; height: auto !important;" _width="379px" src="https://mmbiz.qpic.cn/mmbiz_png/UzDNI6O6hCH8dXvlJwcBIroKJRWu6AmqKaCs2icnhHqUvt9mYicREVQXvMwho2tUXEwxiaRdy6L9MWwU0VxqnjcrQ/640?wx_fmt=png&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1&amp;wx_co=1" crossorigin="anonymous" data-fail="0"></section>
      <p style="max-width: 100%;min-height: 1em;text-align: center;box-sizing: border-box !important;overflow-wrap: break-word !important;"><br></p>
      <p style="text-align: center;"><br></p>
      <p style="text-align: center;"><img class="rich_pages " data-ratio="0.6277777777777778" data-s="300,640" data-src="https://mmbiz.qpic.cn/mmbiz_png/UzDNI6O6hCH8dXvlJwcBIroKJRWu6AmqpUbaZWJXwQEFjRicB8dgUSfmenHCefyfTI7aibcw1ZaicxhjkFBOiceJhw/640?wx_fmt=png" data-type="png" data-w="720" style="width: 379px !important; height: auto !important; visibility: visible !important;" _width="379px" src="https://mmbiz.qpic.cn/mmbiz_png/UzDNI6O6hCH8dXvlJwcBIroKJRWu6AmqpUbaZWJXwQEFjRicB8dgUSfmenHCefyfTI7aibcw1ZaicxhjkFBOiceJhw/640?wx_fmt=png&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1&amp;wx_co=1" crossorigin="anonymous" data-fail="0"></p>
      <p style="text-align: center;"><br></p>
      <section style="text-align: center;margin-left: 8px;margin-right: 8px;"><img class="rich_pages" data-ratio="0.03333333333333333" data-s="300,640" data-src="https://mmbiz.qpic.cn/mmbiz_png/UzDNI6O6hCGt4dyAKGmD6Mibvd1Gbz6AsexqSbL3otgVVhvkGaBxWH6gKzkPrxq6PiceT7ibsyiaHTotSooNCY4cBw/640?wx_fmt=png" data-type="png" data-w="720" style="width: 379px !important; height: auto !important; visibility: visible !important;" _width="379px" src="https://mmbiz.qpic.cn/mmbiz_png/UzDNI6O6hCGt4dyAKGmD6Mibvd1Gbz6AsexqSbL3otgVVhvkGaBxWH6gKzkPrxq6PiceT7ibsyiaHTotSooNCY4cBw/640?wx_fmt=png&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1&amp;wx_co=1" crossorigin="anonymous" data-fail="0"></section>
    `,
            // 顶部签名
            header: `
      <section style="margin-bottom:20px;" data-mpa-powered-by="wechatsync.io"><span style="color: rgb(178, 178, 178);font-size: 15px;"><img class=" __bg_gif" data-cropselx1="0" data-cropselx2="558" data-cropsely1="0" data-cropsely2="38" data-ratio="0.06666666666666667" data-s="300,640" data-src="https://mmbiz.qpic.cn/mmbiz_gif/UzDNI6O6hCH8dXvlJwcBIroKJRWu6AmqUC4VfbW8UHpo9o8rzSnwtWiaFkFKalic4vm0wCohec76HxoiaTibrzUH2g/640?wx_fmt=gif" data-type="gif" data-w="630" style="white-space: normal; width: 379px !important; height: auto !important; visibility: visible !important;" _width="379px" src="https://mmbiz.qpic.cn/mmbiz_gif/UzDNI6O6hCH8dXvlJwcBIroKJRWu6AmqUC4VfbW8UHpo9o8rzSnwtWiaFkFKalic4vm0wCohec76HxoiaTibrzUH2g/640?wx_fmt=gif&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1" data-order="0" data-fail="0"></span></section>
    `,
          },
        },
      ],
    }
  },
  watch: {
    currentTemplate: {
      handler() {
        this.render()
      },
      deep: true,
    },
  },
  directives: {
    ClickOutside,
  },
  mounted() {
    var self = this
    this.currentTemplate = this.templates[0]
    tracker.sendAppView('ArticleView')
  },
  methods: {
    headerChange() {
      console.log('headerChange')
      this.currentTemplate.definition.header = this.$refs.header.innerHTML
      // this.render();
    },

    focusChange(type) {
      var doc = $(this.$refs.content.contentWindow.document)
      var type = doc.find("[autoformat='" + type + "']")
      var firstparagraph = type.eq(0)

      this.$refs.content.sc
      console.log('type', type)
    },
    imageStyleChange(styles) {
      this.currentTemplate.definition.image.styles = styles
    },
    h2StyleChange(styles) {
      this.currentTemplate.definition.h2.styles = styles
      // this.render();
    },
    paragraphStyleChange(styles) {
      this.currentTemplate.definition.paragraph.styles = styles
      // this.render();
      console.log('paragraphStyleChange', styles)
      setTimeout(() => {
        this.focusChange('paragraph')
      }, 30)
    },
    render() {
      var doc = $(this.$refs.content.contentWindow.document)
      doc.find('body').html(this.demoHtml)
      Autoformat(doc, this.currentTemplate.definition)
    },
    handleClick() {},
    compelet() {
      console.log('compelet')
      this.$refs.content.contentWindow.document.body.innerHTML = this.demoHtml
      var css = `<style>
           * {
    margin: 0;
    padding: 0;
}
    body * {
      max-width: 100% !important;
      word-wrap: break-word !important;
      box-sizing: border-box !important;
    }
    body table {
      box-sizing: content-box !important;
    }
    body table * {
      box-sizing: content-box !important;
    }
    body p {
      clear: both;
      min-height: 1em;
    }
    .mpa-black-tech {
      cursor: default;
      user-select: none;
    }

    body {
    margin: 20px 0 20px 0;
    font-family: "mp-quote",-apple-system-font,BlinkMacSystemFont,"Helvetica Neue","PingFang SC","Hiragino Sans GB","Microsoft YaHei UI","Microsoft YaHei",Arial,sans-serif;
    padding: 0 40px 15px;
    text-align: justify;
    font-size: 17px;
    color: #333;
}
    </style>`

      var doc = $(this.$refs.content.contentWindow.document)
      doc.find('head').append(css)
      Autoformat(doc, this.currentTemplate.definition)
    },
    taskUpdate(task) {
      this.taskStatus = task
      var currentAccount = task.accounts.filter((a) => {
        return a.status == 'uploading'
      })

      var doneAccounts = task.accounts.filter((a) => {
        if (this.lastProcessAccount) {
          return a.status == 'done' && a.type == this.lastProcessAccount.type
        }
        return a.status == 'done'
      })

      var allDoneAccounts = task.accounts.filter((a) => a.status == 'done')

      var msg = ''
      var title = task.post.title

      if (!currentAccount.length) {
        title = '准备同步'
        if (doneAccounts.length) {
          title = doneAccounts[0].displayName
          msg = '同步成功'
          this.lastProcessAccount = null
        }
      } else {
        var processAccount = currentAccount[0]
        this.lastProcessAccount = processAccount
        if (!processAccount.msg) {
          title = '准备同步到:' + processAccount.displayName
        } else {
          title = processAccount.displayName + ':' + processAccount.title
          msg = processAccount.msg
        }
      }

      if (task.accounts.length == allDoneAccounts.length) {
        // title = "同步成功";
      }

      // this.$notify({
      //   title: title,
      //   message: msg,
      //   duration: 2000
      // });
      console.log('taskUpdate', task)
    },
    hide() {
      console.log('click out')
    },
    closeView() {
      window.parent.postMessage(JSON.stringify({ method: 'closeMe' }), '*')
    },
    loadAccounts() {
      console.log('loadAccounts')
      var allAccounts = []
      var accounts = []
      var self = this
      function getAccounts() {
        chrome.extension.sendMessage(
          {
            action: 'getAccount',
          },
          function (resp) {
            console.log('allAccounts', resp)
            self.allAccounts = resp.filter((item) => {
              if (!item.supportTypes) return true
              return item.supportTypes.indexOf(self.contentType) > -1
            })
          }
        )
      }
      getAccounts()
    },
    cleanNode() {},
    async doSubmit() {
      var self = this
      this.cleanNode()
      var originalHtml = self.$refs.viewport.innerHTML
      // $(".page").makeCssInline();
      function getPost() {
        var post = {}
        post.title = self.$refs.title.innerText
        post.content = originalHtml
        post.inline_content = self.$refs.viewport.innerHTML
        // post.markdown = self.currentArtitle.content;
        post.thumb = self.pageData.mainImage
        if (!post.thumb) {
          post.thumb = self.pageData.leadingImage
        }
        // choose from content
        if (!post.thumb) {
          var images = self.$refs.viewport.getElementsByTagName('img')
          if (images.length) {
            if (images[0].src != '') {
              post.thumb = images[0].src
            }
          }
        }
        post.desc = self.pageData.description
        console.log(post)
        return post
      }
      var selectedAc = this.allAccounts.filter((a) => {
        return a.checked
      })

      this.$message('准备同步')
      setTimeout(() => {
        chrome.extension.sendMessage(
          {
            action: 'addTask',
            task: {
              post: getPost(),
              accounts: selectedAc,
            },
          },
          function (resp) {
            console.log('addTask return', resp)
          }
        )
      }, 1000)
      this.submitting = true
      this.taskStatus = {}
      // this.visible = false;
    },
  },
}
</script>
<style>
.box-card {
  margin: 20px;
}

.viewer-wrapper {
  padding: 20px;
}

#ueditor_0 {
  width: 411px;
  box-shadow: 0px 0px 5px 5px #eee;
  height: 100%;
  min-height: 700px;
}

.article-list {
  height: 100%;
  width: 350px;
}


.article-all {
  color: #878787;
  height: 100%;
  width: 350px;
  overflow-y: auto;
  box-sizing: border-box;
  position: relative;
  margin-top: 80px;
}

.editor-main {
  background: white;
  border-left: 1px solid #ececec;
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  min-width: 403px;
  transition: top 0.5s ease-in-out 0.2s;
  margin-left: 350px;
  height: 100%;
}

.article-item {
  height: 120px;
  cursor: pointer;
  margin: 0 auto;
  text-align: left;
  overflow: hidden;
  position: relative;
  transition: opacity 0.2s ease-in-out, height 0.2s ease-in-out,
    width 0.2s ease-in-out;
}

.article-item .main-content {
  color: #878787;
  left: 24px;
  overflow: hidden;
  overflow-wrap: break-word;
  position: absolute;
  right: 24px;
  top: 12px;
  word-wrap: break-word;
  bottom: 15px;
}

.article-item .title {
  transition: color 0.1s ease-in-out, width 0s ease-in-out 0.1s;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: caecilia, times, serif;
  font-size: 16px;
  font-weight: 400;
  color: #4a4a4a;
  margin-bottom: 3px;
  max-height: 40px;
  overflow: hidden;
  overflow-wrap: break-word;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-wrap: break-word;
  line-height: 20px;
  width: 302px;
}

.article-item .date {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: gotham, helvetica, arial, sans-serif;
  font-size: 11px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 6px;
}

.article-item .desc {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: gotham, helvetica, arial, sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 17px;
}

.article-item * {
  box-sizing: border-box;
}

.article-item:hover .date,
.article-item:hover .title,
.article-item:hover .desc {
  color: #fff;
}

.item-divider {
  border-top: 1px solid #ececec;
  left: 20px;
  right: 20px;
  top: 0;
  position: absolute;
}

.article-item:hover .item-divider {
  border-top: none;
}

.article-item .hover-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  opacity: 0;
  background-color: rgba(43, 181, 92, 0.9);
  transition: opacity 0.1s ease-in-out;
}

.article-item.selected .selected-overlay {
  border: 3px solid #d9d9d9;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.hover-container {
  position: absolute;
  opacity: 0;
  top: 0;
  right: 0;
  transition: opacity 0.1s ease-in-out;
}

.hover-container .icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
  margin: 8px 12px 0 0;
  color: white;
  font-size: 20px;
  text-align: center;
  line-height: 24px;
}

.article-item:hover .hover-overlay {
  opacity: 1;
}

.article-item:hover .hover-container {
  opacity: 1;
}

.top-tools {
  padding: 10px 24px;
  font-size: 13px;
  text-align: right;
  border-bottom: 1px solid #d9d9d9;
  width: 350px;
}

.top-tools .btn {
  font-size: 13px;
}

.v-note-wrapper .v-note-op {
  border-top: 1px solid #f2f6fc;
  border-radius: 0px;
}

.v-note-wrapper {
  height: 100%;
  position: absolute !important;
  width: 100%;
  top: 0;
  padding-top: 80px;
  border-left: none !important;
  box-sizing: border;
}

.top-tools,
.post-title {
  // margin-bottom: 12px;
  position: absolute;
  z-index: 1502;
  top: 32px;
}

.post-title input {
  border: none;
  height: 45px;
  outline: none;
  font-size: 20px;
  font-family: caecilia, times, serif;
  font-size: 28px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-weight: 300;
  width: 700px;
  padding-left: 24px;
}

.not-article {
  padding: 10px 20px;
  font-size: 12px;
  color: #666;
}

.major-actions {
  margin-left: 12px;
}

.all-pubaccounts {
  // background: #f3f3f3;
}

.account-item img {
  margin-right: 5px;
}

.account-item {
  // height: 36px;
  line-height: 36px;
  padding: 0 15px;
  font-size: 14px;
}

.account-item .name-block {
  // width: 100px;
  // font-weight: bold;
  // color: black;
  // overflow: hidden;
  // display: inline-block;
}
.account-item .message {
  max-width: 300px;
  overflow: hidden;
  display: inline-block;
  vertical-align: middle;
  line-height: 140%;
}
.account-item .failed {
  color: red;
}

.account-item .uploading {
  color: #888;
}

.all-pubaccounts {
}
.account-item .done {
  color: #155724;
}

.lds-dual-ring {
  display: inline-block;
  width: 15px;
  height: 15px;
}

.lds-dual-ring:after {
  content: ' ';
  display: block;
  width: 12px;
  height: 12px;
  margin: 1px;
  border-radius: 50%;
  border: 1px solid #111;
  border-color: #111 transparent #111 transparent;
  animation: lds-dual-ring 1.2s linear infinite;
}

@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
