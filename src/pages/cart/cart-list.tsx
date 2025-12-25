import { useAtomValue } from "jotai";
import { cartStateV2 } from "@/state";
import CartItem from "./cart-item";
import Section from "@/components/section";
import { Icon, Input } from "zmp-ui";
import HorizontalDivider from "@/components/horizontal-divider";

export default function CartList() {
  const cart = useAtomValue(cartStateV2);

  return (
    <Section
      title="Danh sách giỏ hàng"
      className="flex-1 overflow-y-auto rounded-lg"
    >
      <div className="w-full">
        {cart.map((item) => (
          <CartItem key={item.product.id} {...item} />
        ))}
      </div>
      <HorizontalDivider />
    </Section>
  );
}
