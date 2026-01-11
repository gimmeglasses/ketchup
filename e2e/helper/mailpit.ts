import { Page, expect } from "@playwright/test";

/**
 * Mailpitのメッセージデータ
 */
export interface MailpitMessage {
  ID: string;
  From: {
    Address: string;
    Name: string;
  };
  To: Array<{
    Address: string;
    Name: string;
  }>;
  Subject: string;
  Date: string;
  Text: string;
  HTML: string;
}

/**
 * Mailpit API操作のヘルパークラス
 */
export class MailpitHelper {
  private readonly baseUrl: string;
  private readonly page: Page;

  constructor(page: Page, mailpitUrl = "http://127.0.0.1:54324") {
    this.page = page;
    this.baseUrl = mailpitUrl;
  }

  /**
   * すべてのメールを削除します
   */
  async deleteAllMessages() {
    const response = await this.page.request.delete(
      `${this.baseUrl}/api/v1/messages`
    );
    expect(response.ok()).toBeTruthy();
  }

  /**
   * メール一覧を取得します
   */
  async getMessages(): Promise<MailpitMessage[]> {
    const response = await this.page.request.get(
      `${this.baseUrl}/api/v1/messages`
    );
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    return data.messages || [];
  }

  /**
   * 特定のメールアドレス宛のメールを取得します
   * @param email - 受信者のメールアドレス
   * @param timeout - タイムアウト時間（ミリ秒）
   */
  async waitForEmail(
    email: string,
    timeout = 10000
  ): Promise<MailpitMessage | null> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const messages = await this.getMessages();
      const message = messages.find((msg) =>
        msg.To.some((to) => to.Address === email)
      );

      if (message) {
        return await this.getMessageById(message.ID);
      }

      // 500ms待機してリトライ
      await this.page.waitForTimeout(500);
    }

    return null;
  }

  /**
   * 特定の件名のメールを取得します
   * @param subject - 件名（部分一致）
   * @param timeout - タイムアウト時間（ミリ秒）
   */
  async waitForEmailBySubject(
    subject: string,
    timeout = 10000
  ): Promise<MailpitMessage | null> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const messages = await this.getMessages();
      const message = messages.find((msg) => msg.Subject.includes(subject));

      if (message) {
        return message;
      }

      // 500ms待機してリトライ
      await this.page.waitForTimeout(500);
    }

    return null;
  }

  /**
   * メール本文からURLを抽出します
   * @param message - メールメッセージ
   * @param pattern - URL抽出パターン（デフォルトはhttpで始まるURL）
   */
  extractUrlFromEmail(
    message: MailpitMessage,
    pattern = /https?:\/\/[^\s<>"]+/g
  ): string[] {
    const text = message.Text || message.HTML;
    const matches = text.match(pattern);
    return matches || [];
  }

  /**
   * 確認リンクを抽出します
   * @param message - メールメッセージ
   */
  extractConfirmationLink(message: MailpitMessage): string | null {
    const urls = this.extractUrlFromEmail(message);
    // 確認リンクを含むURLを探す（実際のパターンに応じて調整）
    const confirmLink = urls.find(
      (url) =>
        url.includes("/auth/confirm") ||
        url.includes("/auth/verify") ||
        url.includes("token=")
    );
    let fixedLink = confirmLink?.replace(/\\u0026/g, "&");
    fixedLink = fixedLink?.replace("127.0.0.1", "host.docker.internal");
    return fixedLink || null;
  }

  /**
   * メールの内容を検証します
   * @param message - メールメッセージ
   * @param expectedContent - 期待する内容（部分一致）
   */
  verifyEmailContent(message: MailpitMessage, expectedContent: string) {
    const content = message.Text || message.HTML;
    expect(content).toContain(expectedContent);
  }

  /**
   * メッセージの本文（テキスト）を取得します
   * @param messageId - メッセージID
   */
  async getMessageText(messageId: string): Promise<string> {
    const response = await this.page.request.get(
      `${this.baseUrl}/api/v1/message/${messageId}`
    );

    if (!response.ok()) {
      console.warn("テキスト取得失敗");
      return "";
    }

    return await response.text();
  }

  async getMessageById(messageId: string): Promise<MailpitMessage> {
    const response = await this.page.request.get(
      `${this.baseUrl}/api/v1/message/${messageId}`
    );
    expect(response.ok()).toBeTruthy();

    const message = await response.json();

    // 本文を個別に取得（必須）
    message.Text = await this.getMessageText(messageId);

    return message;
  }
}
