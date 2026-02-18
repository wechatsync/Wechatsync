/**
 * 东方财富适配器
 */
import { CodeAdapter, type ImageUploadResult } from '../code-adapter'
import type { Article, AuthResult, SyncResult, PlatformMeta } from '../../types'
import type { PublishOptions } from '../types'
import { processHtml } from '../../lib'
import { createLogger } from '../../lib/logger'

const logger = createLogger('Eastmoney')

export class EastmoneyAdapter extends CodeAdapter {
  readonly meta: PlatformMeta = {
    id: 'eastmoney',
    name: '东方财富',
    icon: 'https://mp.eastmoney.com/collect/pc_article/favicon.ico',
    homepage: 'https://mp.eastmoney.com',
    capabilities: ['article', 'draft', 'image_upload', 'cover'],
  }

  private headerRuleIds: string[] = []
  private ctoken: string = ''
  private utoken: string = ''

  /**
   * 设置动态请求头规则
   */
  private async setupHeaderRules(): Promise<void> {
    if (this.headerRuleIds.length > 0) return
    if (!this.runtime.headerRules) return

    // mp.eastmoney.com
    const ruleId1 = await this.runtime.headerRules.add({
      urlFilter: '*://mp.eastmoney.com/*',
      headers: {
        'Origin': 'https://mp.eastmoney.com',
        'HOST': 'emfront.eastmoney.com',
      },
      resourceTypes: ['xmlhttprequest'],
    })
    this.headerRuleIds.push(ruleId1)

    logger.debug('Header rules added:', this.headerRuleIds)
  }

  /**
   * 清除动态请求头规则
   */
  private async clearHeaderRules(): Promise<void> {
    if (!this.runtime.headerRules) return
    for (const ruleId of this.headerRuleIds) {
      await this.runtime.headerRules.remove(ruleId)
    }
    this.headerRuleIds = []
    logger.debug('Header rules cleared')
  }

  async checkAuth(): Promise<AuthResult> {
    try {
      await this.fetchToken()
      const response = await this.runtime.fetch(`https://caifuhaoapi.eastmoney.com/api/v2/getauthorinfo?platform=&ctoken=${this.ctoken}&utoken=${this.utoken}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'x-requested-with': 'fetch',
        },
      })

      const data = await response.json();

      if (data.Success === 1 && data.Result) {
        const result = data.Result as {
          accountId?: string;
          accountName?: string; // nickName
          portrait?: string;
        };
        if (result.accountId) {
          return {
            isAuthenticated: true,
            userId: result.accountId,
            username: result.accountName,
            avatar: result.portrait,
          };
        }
      }

      // 未认证或请求失败
      return { isAuthenticated: false };
    } catch (error) {
      logger.debug('checkAuth: not logged in -', error)
      return { isAuthenticated: false, error: (error as Error).message }
    }
  }

  /**
   * 获取 token 值 (从 cookie 或生成)
   */

  private async fetchToken(): Promise<void> {
    if (this.runtime.getCookie) {
      const ctoken = await this.runtime.getCookie('.eastmoney.com', 'ct')
      const utoken = await this.runtime.getCookie('.eastmoney.com', 'ut')

      if (!ctoken || !utoken) {
        throw new Error('cokkie参数获取失败，请先登录东方财富')
      }
      this.ctoken = ctoken
      this.utoken = utoken
    } else {
      throw new Error('cokkie参数获取失败，请先登录东方财富')
    }
  }



  async publish(article: Article, options?: PublishOptions): Promise<SyncResult> {
    // 设置请求头规则
    await this.setupHeaderRules()
    await this.fetchToken()
    try {
      logger.info('Starting publish...')
      let parm = [
        { "ip": "$IP$" },
        { "deviceid": "8C67557BE560F5454573A4F9CDF472F6" },
        { "version": "100" },
        { "plat": "web" },
        { "product": "CFH" },
        { "ctoken": this.ctoken },
        { "utoken": this.utoken },
        { "draftid": "" },
        { "drafttype": "0" },
        { "type": "0" },
        { "title": article.title },
        {
          "text": "<div class=\"xeditor_content cfh_web\"></div>"
        },
        { "columns": "2" },
        { "cover": "" },
        { "issimplevideo": "0" },
        { "videos": "" },
        { "vods": "" },
        { "isoriginal": "0" },
        { "tgProduct": "" },
        { "spcolumns": "" },
        { "textsource": "0" },
        { "replyauthority": "0" },
        { "modules": "[]" }
      ]
      //构造数据
      let formData = {
        "pageUrl": "https://mp.eastmoney.com/collect/pc_article/index.html#/",
        "path": "draft/api/Article/SaveDraft",
        "parm": JSON.stringify(parm)
      }

      // 1. 创建草稿
      const createResponse = await this.runtime.fetch('https://emfront.eastmoney.com/apifront/Tran/GetData?platform', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
      })

      const responseText = await createResponse.text()
      logger.debug('Create draft response:', createResponse.status, responseText.substring(0, 200))

      if (!createResponse.ok) {
        throw new Error(`创建草稿失败: ${createResponse.status} - ${responseText}`)
      }

      const rawData = JSON.parse(responseText);

      if (!rawData.RRquestSuccess || rawData.RCode !== 200) {
        throw new Error(`创建草稿失败: 接口返回错误 - ${rawData.RMsg || '未知错误'}`);
      }

      let innerData: { error_code?: number; draft_id?: string; me?: string };
      try {
        innerData = JSON.parse(rawData.RData);
      } catch {
        throw new Error(`创建草稿失败: 无法解析内层数据 - ${rawData.RData}`);
      }

      if (innerData.error_code !== 0) {
        throw new Error(`创建草稿失败: 业务错误 - ${innerData.me || '未知错误'}`);
      }

      // 4. 检查必需的 draft_id 是否存在
      if (!innerData.draft_id) {
        throw new Error('创建草稿失败: 响应缺少 draft_id');
      }

      // 成功，可以使用 innerData.draft_id
      const draftId = innerData.draft_id;


      logger.debug('Draft created:', draftId)

      // 2. 获取 HTML 内容并处理
      const rawHtml = article.html || article.markdown

      // 3. HTML 预处理 (来自 DSL zhihu.yaml html_processing 配置)
      let content = processHtml(rawHtml, {
        removeComments: true,
        removeSpecialTags: true,
        processCodeBlocks: true,
        convertSectionToDiv: true,
        removeEmptyLines: true,
        removeEmptyDivs: true,
        removeNestedEmptyContainers: true,
        unwrapSingleChildContainers: true,
        unwrapNestedFigures: true,
        removeTrailingBr: true,
        removeDataAttributes: true,
        removeSrcset: true,
        removeSizes: true,
        compactHtml: true,
      })


      // 4. 处理图片
      content = await this.processImages(
        content,
        (src) => this.uploadImageByUrl(src),
        {
          skipPatterns: ['gbres.dfcfw.com'],
          onProgress: options?.onImageProgress,
        }
      )

      parm[7]['draftid'] = draftId
      parm[11]['text'] = "<div class=\"xeditor_content cfh_web\">" + content + "</div>"
      formData.parm = JSON.stringify(parm)

      // 6. 更新草稿内容
      const updateResponse = await this.runtime.fetch(
        `https://emfront.eastmoney.com/apifront/Tran/GetData?platform`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData),
        }
      )

      const updateResponseText = await updateResponse.text()
      logger.debug('Create draft response:', updateResponse.status, updateResponseText.substring(0, 200))

      if (!updateResponse.ok) {
        logger.error('Update draft failed:', updateResponse.status, updateResponseText)
        throw new Error(`创建草稿失败: ${updateResponse.status} - ${updateResponseText}`)
      }

      const updateRawData = JSON.parse(updateResponseText);

      if (!updateRawData.RRquestSuccess || updateRawData.RCode !== 200) {
        logger.error('Update draft failed:', updateResponse.status, updateRawData.RMsg || '未知错误')
        throw new Error(`创建草稿失败: 接口返回错误 - ${updateRawData.RMsg || '未知错误'}`);
      }

      logger.debug('Draft updated, status:', updateResponse.status)

      const draftUrl = `https://mp.eastmoney.com/collect/pc_article/index.html#/?id=${draftId}`

      const result = this.createResult(true, {
        postId: draftId,
        postUrl: draftUrl,
        draftOnly: options?.draftOnly ?? true,
      })

      // 清除请求头规则
      await this.clearHeaderRules()
      return result
    } catch (error) {
      // 清除请求头规则
      await this.clearHeaderRules()
      return this.createResult(false, {
        error: (error as Error).message,
      })
    }
  }


  /**
   * 通过 URL 上传图片
   * 支持远程 URL 和 data URI
   */
  protected async uploadImageByUrl(src: string): Promise<ImageUploadResult> {
    // 检测 data URI，使用二进制上传
    if (src.startsWith('data:')) {
      logger.debug('Detected data URI, using binary upload')
      const blob = await fetch(src).then(r => r.blob())
      const url = await this.uploadImageBinaryInternal(blob)
      return { url }
    }

    // 远程 URL 使用知乎 URL 上传 API
    const response = await this.runtime.fetch('https://gbapi.eastmoney.com/iimage/image/byLink?platform=', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        noinlist: '1',
        linkUrl: src,
        ctoken: this.ctoken,
        utoken: this.utoken
      }),
    })

    interface UploadResponse {
      code: number;
      message: string;
      data?: {
        url: string;
        id: string;
      };
    }

    const res = await response.json() as UploadResponse;

    // 检查 HTTP 业务状态码
    if (res.code === 200 && res.data?.url) {
      return { url: res.data.url };
    }

    // 抛出详细错误
    throw new Error(`图片上传失败: ${res.message || '未知错误'} (code: ${res.code})`);
  }

  /**
   * 上传图片 (二进制方式) - 内部使用
   */
  private async uploadImageBinaryInternal(file: Blob): Promise<string> {
    // 1. 获取上传凭证

    // 2. 生成文件名
    const ext = file.type.split('/')[1] || 'png'
    const filename = `${Date.now()}.${ext}`

    // 3. 上传到七牛云
    const formData = new FormData()
    formData.append('file', file, filename)
    formData.append('noinlist', "1")
    formData.append('utoken', this.utoken)
    formData.append('ctoken', this.ctoken)

    const response = await fetch("https://gbapi.eastmoney.com/iimage/image?platform=", {
      method: 'POST',
      body: formData,
    })

    interface UploadResponse {
      code: number;
      message: string;
      data?: {
        url: string;
        id: string;
      };
    }

    const res = await response.json() as UploadResponse;

    if (res.code === 200 && res.data?.url) {
      return res.data.url;
    }

    throw new Error(`图片上传失败: ${res.message || '未知错误'} (code: ${res.code})`);
  }
}
