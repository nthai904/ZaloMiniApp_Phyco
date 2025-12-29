import { useAtom, useAtomValue } from "jotai";
import { cartTotalState, paymentMethodState } from "@/state";
import Section from "./section";
import { formatPrice } from "@/utils/format";
import toast from "react-hot-toast";

export default function PaymentMethod() {
  const [method, setMethod] = useAtom(paymentMethodState);
  const { totalAmount } = useAtomValue(cartTotalState);

  const isBankTransfer = method === "bank_transfer";
  const accountNumber = "111002996402";

  // hàm copy số tài khoản
  const handleCopyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      toast.success("Đã sao chép số tài khoản!");
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = accountNumber;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        toast.success("Đã sao chép số tài khoản!");
      } catch (fallbackErr) {
        toast.error("Không thể sao chép");
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <Section title="Phương thức thanh toán">
      <div className="space-y-3 p-2">
        <div className="flex space-x-3 items-center">
          <label
            className={`flex-1 flex items-center gap-2 cursor-pointer p-3 rounded-xl border text-sm transition 
            ${method === "cod" ? "border-primary bg-primary/5" : "border-transparent bg-white/5 hover:bg-white/10"}`}
          >
            <input type="radio" name="payment" value="cod" checked={method === "cod"} onChange={() => setMethod("cod")} />
            <div className="flex flex-col">
              <span className="font-medium">Thanh toán khi giao hàng (COD)</span>
              <span className="text-xs text-subtitle">Thanh toán tiền mặt khi nhận hàng</span>
            </div>
          </label>

          <label
            className={`flex-1 flex items-center gap-2 cursor-pointer p-3 rounded-xl border text-sm transition 
            ${isBankTransfer ? "border-primary bg-primary/5" : "border-transparent bg-white/5 hover:bg-white/10"}`}
          >
            <input type="radio" name="payment" value="bank_transfer" checked={isBankTransfer} onChange={() => setMethod("bank_transfer")} />
            <div className="flex flex-col">
              <span className="font-medium">Chuyển khoản qua ngân hàng</span>
              <span className="text-xs text-subtitle">Chuyển khoản trước, giao hàng sau</span>
            </div>
          </label>
        </div>

        {isBankTransfer && (
          <div className="mt-1 rounded-xl bg-white/5 border border-primary/40 px-3 py-3 text-subtitle space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-primary">Thông tin chuyển khoản</span>
              <span className="text-[11px]">Số tiền cần thanh toán</span>
            </div>
            <div className="rounded-lg bg-black/5 px-3 py-2 flex items-center justify-between">
              <span className="text-[11px] text-subtitle">Tổng thanh toán</span>
              <span className="font-semibold text-primary text-sm">{formatPrice(totalAmount)}</span>
            </div>

            <div className="pt-2 space-y-3 text-sm leading-relaxed">
              <p className="font-medium text-foreground">Khách hàng có thể lựa chọn các hình thức thanh toán sau:</p>

              <div className="space-y-2.5">
                <div>
                  <p className="font-semibold text-foreground mb-1.5">1.1. Thanh toán trả trước:</p>
                  <p className="mb-2.5">Quý khách vui lòng chuyển khoản vào tài khoản công ty:</p>
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 space-y-3 border-2 border-primary/30 shadow-sm">
                    <div className="space-y-2.5">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wide">Tên tài khoản</span>
                        <p className="font-bold text-foreground text-base leading-tight">CONG TY CỔ PHAN PHYCO VIET NAM</p>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wide">Số tài khoản</span>
                        <div className="bg-white/40 rounded-lg px-3 py-2.5 border border-primary/20 flex items-center justify-between gap-2 group">
                          <p className="font-mono font-bold text-foreground text-lg tracking-wider">{accountNumber}</p>
                          <button
                            onClick={handleCopyAccountNumber}
                            className="flex-shrink-0 p-1.5 rounded-md bg-primary/10 hover:bg-primary/20 active:bg-primary/30 transition-colors duration-200 group-hover:bg-primary/15"
                            title="Sao chép số tài khoản"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                              <path
                                d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z"
                                fill="currentColor"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wide">Ngân hàng</span>
                        <p className="text-foreground font-medium">Vietinbank - Chi nhánh Hội sở Cần Thơ</p>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-primary/20">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wide flex-shrink-0 mt-0.5">Nội dung:</span>
                        <p className="text-foreground font-medium">Họ tên và số điện thoại</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <p className="font-semibold text-foreground mb-1">1.2. Thanh toán trả sau:</p>
                  <p>COD – giao hàng và thu tiền tận nơi</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
