import { useAtom, useAtomValue } from "jotai";
import { cartTotalState, paymentMethodState } from "@/state";
import Section from "./section";

import BankTransfer from "./bank-transfer";

export default function PaymentMethod() {
  const [method, setMethod] = useAtom(paymentMethodState);

  const isBankTransfer = method === "bank_transfer";

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

        {isBankTransfer && <BankTransfer />}
      </div>
    </Section>
  );
}
