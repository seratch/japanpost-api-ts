export interface JapanPostAPIErrorOptions {
  status: number;
  body: string;
  headers: Record<string, string>;
}
export class JapanPostAPIError extends Error {
  status: number;
  headers: Record<string, string>;
  body: string;
  error: JapanPostAPIErrorBody | null;
  constructor({ status, body, headers }: JapanPostAPIErrorOptions) {
    const bodyText = body.replace(/\n/g, "").substring(0, 200);
    super(`JapanPostAPIError: (status: ${status}, body: ${bodyText} ...)`);

    this.status = status;
    this.headers = headers;
    this.body = body;
    try {
      this.error = JSON.parse(body);
    } catch (e) {
      this.error = null;
    }
  }
}

export type JapanPostAPIErrorBody = {
  /**
   * 問合せID (追跡コード)
   */
  request_id: string;
  /**
   * エラーコード
   */
  error_code: string;
  /**
   * エラーメッセージ
   */
  message: string;
};
