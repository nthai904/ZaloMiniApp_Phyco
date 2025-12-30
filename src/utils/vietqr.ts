/**
 * Utility functions for VietQR payment
 */

export interface VietQRConfig {
  bankCode: string; // Mã ngân hàng (VD: "970415" cho Vietinbank)
  bankAccount: string; // Số tài khoản
  accountName: string; // Tên chủ tài khoản (không dấu)
  amount?: number; // Số tiền (VND)
  content?: string; // Nội dung chuyển khoản (tối đa 19 ký tự, không dấu)
}

/**
 * Chuyển đổi số tiền thành chuỗi theo format VietQR (12 chữ số)
 */
function formatAmount(amount: number): string {
  return Math.round(amount).toString().padStart(12, "0");
}

/**
 * Tạo chuỗi QR code theo chuẩn VietQR (EMV QR Code)
 * Format: 00020101021238[Payload]6304[CRC]
 */
export function generateVietQRString(config: VietQRConfig): string {
  const { bankCode, bankAccount, accountName, amount, content } = config;

  // Tạo các trường dữ liệu
  const fields: string[] = [];

  // Payload Format Indicator (00)
  fields.push("000201");

  // Point of Initiation Method (01) - 11 = Static, 12 = Dynamic
  fields.push(amount ? "010212" : "010211");

  // Merchant Account Information (38)
  // Bank Code (00)
  const bankInfo = `0014${bankCode.length.toString().padStart(2, "0")}${bankCode}`;
  // Account Number (01)
  const accountInfo = `01${bankAccount.length.toString().padStart(2, "0")}${bankAccount}`;
  // Account Name (02)
  const nameInfo = `02${accountName.length.toString().padStart(2, "0")}${accountName}`;

  const merchantAccountInfo = `38${(bankInfo + accountInfo + nameInfo).length.toString().padStart(2, "0")}${bankInfo}${accountInfo}${nameInfo}`;
  fields.push(merchantAccountInfo);

  // Transaction Currency (52) - VND = 704
  fields.push("5203704");

  // Transaction Amount (54) - chỉ thêm nếu có số tiền
  if (amount) {
    const amountStr = formatAmount(amount);
    fields.push(`54${amountStr.length.toString().padStart(2, "0")}${amountStr}`);
  }

  // Country Code (58) - VN
  fields.push("5802VN");

  // Additional Data Field Template (62)
  if (content) {
    // Reference Number (01) - nội dung chuyển khoản
    const contentInfo = `01${content.length.toString().padStart(2, "0")}${content}`;
    fields.push(`62${contentInfo.length.toString().padStart(2, "0")}${contentInfo}`);
  }

  // CRC (63) - sẽ được tính sau
  const payload = fields.join("");
  const crc = calculateCRC16(payload);
  const crcHex = crc.toString(16).toUpperCase().padStart(4, "0");

  return `${payload}6304${crcHex}`;
}

/**
 * Tính CRC16 cho VietQR
 */
function calculateCRC16(data: string): number {
  const polynomial = 0x1021;
  let crc = 0xffff;

  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }

  return crc;
}

/**
 * Tạo URL VietQR sử dụng API VietQR
 * Format: https://img.vietqr.io/image/{bankCode}-{accountNumber}-{template}.png?amount={amount}&addInfo={content}
 *
 * Templates có sẵn:
 * - compact: QR code nhỏ gọn
 * - compact2: QR code nhỏ gọn (phiên bản 2)
 * - print: QR code để in
 */
export function generateVietQRURL(config: VietQRConfig, template: string = "compact2"): string {
  const { bankCode, bankAccount, amount, content } = config;

  // Tạo base URL
  let url = `https://img.vietqr.io/image/${bankCode}-${bankAccount}-${template}.png`;

  // Thêm query parameters
  const urlParams: string[] = [];

  if (amount && amount > 0) {
    urlParams.push(`amount=${Math.round(amount)}`);
  }

  if (content && content.trim()) {
    // Nội dung phải được encode và giới hạn 19 ký tự
    const encodedContent = encodeURIComponent(content.substring(0, 19));
    urlParams.push(`addInfo=${encodedContent}`);
  }

  if (urlParams.length > 0) {
    url += `?${urlParams.join("&")}`;
  }

  return url;
}
