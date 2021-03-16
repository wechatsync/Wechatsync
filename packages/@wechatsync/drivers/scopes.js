import axios from "axios"
import md5 from "js-md5"
import juice from "juice/client"
import turndown from "turndown"
import tools from './tools'

export default {
  tools,
  turndown,
  axios,
  md5,
  juice,
  // Runtime Host Need implementation
  console () {},
  $ () { return {} },
  DOMParser () { return {} },
  document: {},
  Blob () {return {}},
  Promise () {},
  setCache () {},
  initliazeFrame () {},
  requestFrameMethod () {}
}
