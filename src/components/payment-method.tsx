import { useAtom } from "jotai";
import { paymentMethodState } from "@/state";
import Section from "./section";

export default function PaymentMethod() {
  const [method, setMethod] = useAtom(paymentMethodState);

  return (
    <Section title="Phương thức thanh toán">
      <div className="flex space-x-3 items-center p-2">
        <label className={`flex items-center gap-2 cursor-pointer p-2 rounded-md ${method === "cod" ? "bg-white/10" : "hover:bg-white/5"}`}>
          <input type="radio" name="payment" value="cod" checked={method === "cod"} onChange={() => setMethod("cod")} />
          <div className="text-sm">Thanh toán khi giao hàng (COD)</div>
        </label>

        <label className={`flex items-center gap-2 cursor-pointer p-2 rounded-md ${method === "bank_transfer" ? "bg-white/10" : "hover:bg-white/5"}`}>
          <input type="radio" name="payment" value="bank_transfer" checked={method === "bank_transfer"} onChange={() => setMethod("bank_transfer")} />
          <div className="text-sm">Chuyển khoản ngân hàng</div>
        </label>
      </div>
    </Section>
  );
}
