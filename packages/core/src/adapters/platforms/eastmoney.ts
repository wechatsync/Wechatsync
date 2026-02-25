/**
 * 东方财富适配器
 */
import { CodeAdapter, type ImageUploadResult } from "../code-adapter";
import type {
  Article,
  AuthResult,
  SyncResult,
  PlatformMeta,
} from "../../types";
import type { PublishOptions } from "../types";
import { createLogger } from "../../lib/logger";

const logger = createLogger("Eastmoney");

interface UploadResponse {
  code: number;
  message: string;
  data?: {
    url: string;
    id: string;
  };
}

interface DraftApiResponse {
  RRquestSuccess: boolean;
  RCode: number;
  RMsg?: string;
  RData: string;
}

interface DraftResult {
  error_code?: number;
  draft_id?: string;
  me?: string;
}

export class EastmoneyAdapter extends CodeAdapter {
  readonly meta: PlatformMeta = {
    id: "eastmoney",
    name: "东方财富",
    icon: "https://mp.eastmoney.com/collect/pc_article/favicon.ico",
    homepage: "https://mp.eastmoney.com",
    capabilities: ["article", "draft", "image_upload", "cover"],
  };

  /** 预处理配置 */
  readonly preprocessConfig = {
    outputFormat: "html" as const,
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
  };

  private ctoken: string = "";
  private utoken: string = "";
  private deviceId: string = "";

  /** 获取或生成持久化 deviceId（32位大写 hex） */
  private async getDeviceId(): Promise<string> {
    if (this.deviceId) return this.deviceId;
    const stored = await this.runtime.storage.get<string>("eastmoney_deviceId");
    if (stored) {
      this.deviceId = stored;
      return this.deviceId;
    }
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    this.deviceId = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
      .join("");
    await this.runtime.storage.set("eastmoney_deviceId", this.deviceId);
    return this.deviceId;
  }

  /** API Header 规则 */
  private readonly HEADER_RULES = [
    {
      urlFilter: "*://mp.eastmoney.com/*",
      headers: {
        Origin: "https://mp.eastmoney.com",
        HOST: "emfront.eastmoney.com",
      },
      resourceTypes: ["xmlhttprequest"],
    },
  ];

  async checkAuth(): Promise<AuthResult> {
    try {
      await this.fetchToken();

      const response = await this.runtime.fetch(
        `https://caifuhaoapi.eastmoney.com/api/v2/getauthorinfo?platform=&ctoken=${this.ctoken}&utoken=${this.utoken}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "x-requested-with": "fetch" },
        },
      );

      const data = (await response.json()) as {
        Success: number;
        Result?: {
          accountId?: string;
          accountName?: string;
          portrait?: string;
        };
      };

      if (data.Success === 1 && data.Result?.accountId) {
        return {
          isAuthenticated: true,
          userId: data.Result.accountId,
          username: data.Result.accountName,
          avatar: data.Result.portrait,
        };
      }

      return { isAuthenticated: false };
    } catch (error) {
      logger.debug("checkAuth: not logged in -", error);
      return { isAuthenticated: false, error: (error as Error).message };
    }
  }

  /** 从 cookie 读取 token */
  private async fetchToken(): Promise<void> {
    if (!this.runtime.getCookie) {
      throw new Error("Cookie API 不可用，请先登录东方财富");
    }

    const ctoken = await this.runtime.getCookie(".eastmoney.com", "ct");
    const utoken = await this.runtime.getCookie(".eastmoney.com", "ut");

    if (!ctoken || !utoken) {
      throw new Error("未检测到登录信息，请先登录东方财富");
    }

    this.ctoken = ctoken;
    this.utoken = utoken;
  }

  async publish(
    article: Article,
    options?: PublishOptions,
  ): Promise<SyncResult> {
    return this.withHeaderRules(this.HEADER_RULES, async () => {
      await this.fetchToken();
      logger.info("Starting publish to eastmoney...");

      // 1. 创建空草稿，获取 draft_id
      const draftId = await this.createDraft(article.title);
      logger.debug("Draft created:", draftId);

      // 2. 处理图片（基于预处理后的 HTML）
      const content = await this.processImages(
        article.html || "",
        (src) => this.uploadImageByUrl(src),
        {
          skipPatterns: ["gbres.dfcfw.com"],
          onProgress: options?.onImageProgress,
        },
      );

      // 3. 更新草稿内容
      await this.updateDraft(draftId, article.title, content);
      logger.debug("Draft updated");

      const draftUrl = `https://mp.eastmoney.com/collect/pc_article/index.html#/?id=${draftId}`;

      return this.createResult(true, {
        postId: draftId,
        postUrl: draftUrl,
        draftOnly: options?.draftOnly ?? true,
      });
    }).catch((error) =>
      this.createResult(false, {
        error: (error as Error).message,
      }),
    );
  }

  /** 构造 API 参数 */
  private async buildParm(params: {
    draftid?: string;
    title: string;
    text: string;
  }): Promise<object[]> {
    const deviceid = await this.getDeviceId();
    return [
      { ip: "$IP$" },
      { deviceid },
      { version: "100" },
      { plat: "web" },
      { product: "CFH" },
      { ctoken: this.ctoken },
      { utoken: this.utoken },
      { draftid: params.draftid ?? "" },
      { drafttype: "0" },
      { type: "0" },
      { title: encodeURIComponent(params.title) },
      { text: encodeURIComponent(params.text) },
      { columns: "2" },
      { cover: "" },
      { issimplevideo: "0" },
      { videos: "" },
      { vods: "" },
      { isoriginal: "0" },
      { tgProduct: "" },
      { spcolumns: "" },
      { textsource: "0" },
      { replyauthority: "" },
      { modules: encodeURIComponent("[]") },
    ];
  }

  /** 调用草稿 API */
  private async callDraftApi(parm: object[], draftId?: string): Promise<DraftResult> {
    const pageUrl = draftId
      ? `https://mp.eastmoney.com/collect/pc_article/index.html#/?id=${draftId}`
      : "https://mp.eastmoney.com/collect/pc_article/index.html#/";

    const body = JSON.stringify({
      pageUrl,
      path: "draft/api/Article/SaveDraft",
      parm: JSON.stringify(parm),
    });

    const response = await this.runtime.fetch(
      "https://emfront.eastmoney.com/apifront/Tran/GetData?platform=",
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body,
      },
    );

    const responseText = await response.text();
    logger.debug(
      "Draft API response:",
      response.status,
      responseText.substring(0, 200),
    );

    if (!response.ok) {
      throw new Error(`草稿 API 请求失败: ${response.status}`);
    }

    let rawData: DraftApiResponse;
    try {
      rawData = JSON.parse(responseText);
    } catch {
      throw new Error("草稿 API 响应不是有效 JSON");
    }

    if (!rawData.RRquestSuccess || rawData.RCode !== 200) {
      throw new Error(`草稿 API 错误: ${rawData.RMsg || "未知错误"}`);
    }

    let innerData: DraftResult;
    try {
      innerData = JSON.parse(rawData.RData);
    } catch {
      throw new Error("无法解析草稿响应数据");
    }

    if (innerData.error_code !== 0) {
      throw new Error(`草稿业务错误: ${innerData.me || "未知错误"}`);
    }

    return innerData;
  }

  private async createDraft(title: string): Promise<string> {
    const parm = await this.buildParm({
      title,
      text: '<div class="xeditor_content cfh_web"></div>',
    });
    const result = await this.callDraftApi(parm);
    if (!result.draft_id) {
      throw new Error("创建草稿失败: 响应缺少 draft_id");
    }
    return result.draft_id;
  }

  private async updateDraft(
    draftId: string,
    title: string,
    content: string,
  ): Promise<void> {
    const parm = await this.buildParm({
      draftid: draftId,
      title,
      text: `<div class="xeditor_content cfh_web">${content}</div>`,
    });
    await this.callDraftApi(parm, draftId);
  }

  /** URL 上传图片 */
  protected async uploadImageByUrl(src: string): Promise<ImageUploadResult> {
    // data URI 使用二进制上传
    if (src.startsWith("data:")) {
      logger.debug("Detected data URI, using binary upload");
      const blob = await this.dataUriToBlob(src);
      return this.uploadImageBlob(blob);
    }

    // 远程 URL 使用链接上传接口
    const response = await this.runtime.fetch(
      "https://gbapi.eastmoney.com/iimage/image/byLink?platform=",
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          noinlist: "1",
          linkUrl: src,
          ctoken: this.ctoken,
          utoken: this.utoken,
        }),
      },
    );

    const res = (await response.json()) as UploadResponse;
    if (res.code === 200 && res.data?.url) {
      return { url: res.data.url };
    }
    throw new Error(
      `图片上传失败: ${res.message || "未知错误"} (code: ${res.code})`,
    );
  }

  /** 上传图片 Blob */
  private async uploadImageBlob(file: Blob): Promise<ImageUploadResult> {
    const ext = file.type.split("/")[1] || "png";
    const filename = `${Date.now()}.${ext}`;

    const formData = new FormData();
    formData.append("file", file, filename);
    formData.append("noinlist", "1");
    formData.append("utoken", this.utoken);
    formData.append("ctoken", this.ctoken);

    const response = await this.runtime.fetch(
      "https://gbapi.eastmoney.com/iimage/image?platform=",
      {
        method: "POST",
        credentials: "include",
        body: formData,
      },
    );

    const res = (await response.json()) as UploadResponse;
    if (res.code === 200 && res.data?.url) {
      return { url: res.data.url };
    }
    throw new Error(
      `图片上传失败: ${res.message || "未知错误"} (code: ${res.code})`,
    );
  }
}
