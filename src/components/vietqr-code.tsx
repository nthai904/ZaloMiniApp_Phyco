import { QRCodeSVG } from "qrcode.react";
import { useAtomValue } from "jotai";
import { cartTotalState } from "@/state";
import { formatPrice } from "@/utils/format";
import { generateVietQRString, generateVietQRURL, VietQRConfig } from "@/utils/vietqr";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface VietQRCodeProps {
  bankCode?: string;
  bankAccount?: string;
  accountName?: string;
  orderId?: string;
  customerName?: string;
}

export default function VietQRCode({
  bankCode = "970415", 
  bankAccount = "111002996402",
  accountName = "CONG TY CO PHAN PHYCO VIET NAM",
  orderId,
  customerName,
}: VietQRCodeProps) {
  const { totalAmount } = useAtomValue(cartTotalState);
  const [qrValue, setQrValue] = useState<string>("");
  const [qrImageUrl, setQrImageUrl] = useState<string>("");
  const [useImageAPI, setUseImageAPI] = useState<boolean>(true);

  useEffect(() => {
    let content = "";
    if (orderId) {
      content = `DH${orderId}`.substring(0, 19);
    } else if (customerName) {
      content = customerName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "")
        .toUpperCase()
        .substring(0, 19);
    } else {
      content = "THANH TOAN DON HANG";
    }

    const config: VietQRConfig = {
      bankCode,
      bankAccount,
      accountName: accountName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, " "),
      amount: totalAmount,
      content,
    };

    try {
      const qrUrl = generateVietQRURL(config);
      setQrImageUrl(qrUrl);
      setUseImageAPI(true);

      const qrString = generateVietQRString(config);
      setQrValue(qrString);
    } catch (error) {
      console.error("Error generating VietQR:", error);
      toast.error("Không thể tạo mã QR. Vui lòng thử lại.");
    }
  }, [bankCode, bankAccount, accountName, totalAmount, orderId, customerName]);

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
            <path
              d="M3 3H9V9H3V3ZM5 5V7H7V5H5ZM3 15H9V21H3V15ZM5 17V19H7V17H5ZM15 3H21V9H15V3ZM17 5V7H19V5H17ZM13 13H15V15H13V13ZM15 15H17V17H15V15ZM17 13H19V15H17V13ZM13 17H15V19H13V17ZM15 17H17V19H15V17ZM17 17H19V19H17V17ZM19 15H21V17H19V15ZM19 19H21V21H19V19ZM21 13H23V15H21V13Z"
              fill="currentColor"
            />
          </svg>
          <h3 className="font-semibold text-foreground text-lg">Quét mã QR để thanh toán</h3>
        </div>
        <div className="bg-white/40 rounded-lg px-4 py-2 inline-block">
          <p className="text-xs text-subtitle">Số tiền cần thanh toán</p>
          <p className="text-lg font-bold text-primary">{formatPrice(totalAmount)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-2xl border-4 border-white">
        {useImageAPI && qrImageUrl ? (
          <div className="relative">
            <img
              src={qrImageUrl}
              alt="VietQR Code"
              className="w-64 h-64 object-contain"
              onError={() => {
                console.warn("VietQR API image failed, falling back to QRCodeSVG");
                setUseImageAPI(false);
              }}
            />
            {!qrValue && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-xs text-subtitle">Đang tạo mã QR...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <QRCodeSVG value={qrValue || "Loading..."} size={256} level="H" includeMargin={true} className="w-64 h-64" />
        )}
      </div>

      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-foreground">Mở app ngân hàng và quét mã QR</p>
        <p className="text-xs text-subtitle">Hỗ trợ tất cả các ngân hàng tại Việt Nam</p>
      </div>

      <div className="w-full bg-white/60 rounded-xl p-4 space-y-3 border border-primary/10">
        <div className="flex items-center justify-between py-2 border-b border-primary/10">
          <span className="text-sm text-subtitle font-medium">Số tài khoản:</span>
          <span className="font-mono font-bold text-foreground text-base">{bankAccount}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-primary/10">
          <span className="text-sm text-subtitle font-medium">Tên tài khoản:</span>
          <span className="font-semibold text-foreground text-sm text-right max-w-[60%]">{accountName}</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-subtitle font-medium">Số tiền:</span>
          <span className="font-bold text-primary text-lg">{formatPrice(totalAmount)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-subtitle bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-3 py-2 border border-yellow-200 dark:border-yellow-800">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-yellow-600 dark:text-yellow-400 flex-shrink-0">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor" />
        </svg>
        <p className="text-left">Sau khi chuyển khoản, vui lòng chờ xác nhận từ hệ thống</p>
      </div>
    </div>
  );
}
