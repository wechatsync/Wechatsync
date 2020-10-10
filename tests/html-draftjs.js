// import htmlToDraft from 'html-to-draftjs';
require('jsdom-global')()
const convertToRaw = require('draft-js').convertToRaw
const htmlToDraft = require('html-to-draftjs').default
const ContentState = require( 'draft-js').ContentState

// import { EditorState, ContentState } from 'draft-js';
// const dom = new JSDOM(html)
// global.document = dom.window.document
// const stateFromHTML = require('draft-js-import-html').stateFromHTML
// const blocksFromHtml = stateFromHTML('<h1>hello</h1>');

const blocksFromHtml = htmlToDraft('<h1>hello</h1><img src="//wx3.sinaimg.cn/mw1024/0072vvHCgy1gjjgu55by8g308206o7uc.gif" onload="add_img_loading_mask(this, load_sina_gif);" referrerpolicy="no-referrer" style="max-width: 100%; max-height: 450px;">')
const { contentBlocks, entityMap } = blocksFromHtml;
const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
const contentStateString = JSON.stringify(convertToRaw(contentState))
console.log('contentStateString', contentStateString)
