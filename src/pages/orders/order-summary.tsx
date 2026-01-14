// ...existing code...
import HorizontalDivider from "@/components/horizontal-divider";
import Section from "@/components/section";
import { Order } from "@/types";
import { formatPrice } from "@/utils/format";
import CollapsibleOrderItems from "./collapsible-order-items";
import { useNavigate } from "react-router-dom";

function OrderSummary(props: { order: Order; full?: boolean }) {
  const navigate = useNavigate();

  const orderStatusMap: Record<string, { text: string; className: string }> = {
    pending: { text: "Chờ xác nhận", className: "bg-yellow-50 text-yellow-800" },
    shipping: { text: "Đang giao", className: "bg-blue-50 text-blue-800" },
    completed: { text: "Đã hoàn thành", className: "bg-green-50 text-green-800" },
    cancelled: { text: "Đã hủy", className: "bg-red-50 text-red-800" },
  };

  const paymentStatusMap: Record<string, { text: string; className: string }> = {
    pending: { text: "Chờ thanh toán", className: "bg-yellow-50 text-yellow-800" },
    authorized: { text: "Đã ủy quyền", className: "bg-blue-50 text-blue-800" },
    partially_paid: { text: "Thanh toán một phần", className: "bg-orange-50 text-orange-800" },
    paid: { text: "Đã thanh toán", className: "bg-green-50 text-green-800" },
    partially_refunded: { text: "Hoàn tiền một phần", className: "bg-purple-50 text-purple-800" },
    refunded: { text: "Đã hoàn tiền", className: "bg-gray-50 text-gray-800" },
    voided: { text: "Đã hủy thanh toán", className: "bg-red-50 text-red-800" },
  };

  const orderStatus = orderStatusMap[props.order.status] ?? { text: props.order.status, className: "bg-gray-50 text-gray-800" };
  const paymentStatus = paymentStatusMap[props.order.paymentStatus] ?? { text: props.order.paymentStatus, className: "bg-gray-50 text-gray-800" };
  const itemCount = props.order.items?.length ?? 0;
  const paymentMethod = (() => {
    const tx = (props.order as any)?.transactions?.[0];
    if (tx && tx.gateway) return tx.gateway;
    if ((props.order as any)?.gateway) return (props.order as any).gateway;
    return "Chưa rõ";
  })();

  const displayOrderNumber = props.order.order_number || props.order.id;
  const subtotal = props.order.subtotal ?? props.order.total;
  const shippingFee = props.order.shippingFee ?? 0;

  return (
    <Section
      title={
        <div className="w-full flex items-center justify-between space-x-3">
          <div className="min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-1">
              <div className="text-sm font-semibold truncate">
                Đơn {typeof displayOrderNumber === "string" && displayOrderNumber.startsWith("#") ? displayOrderNumber : `#${displayOrderNumber}`}
              </div>
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${orderStatus.className}`}>{orderStatus.text}</span>
              {props.order.paymentStatus !== "paid" && <span className={`px-2 py-0.5 text-xs font-medium rounded ${paymentStatus.className}`}>{paymentStatus.text}</span>}
            </div>
          </div>

          <div className="flex-shrink-0 text-right">
            <div className="text-xs text-gray-500">Tổng</div>
            <div className="text-sm font-semibold">{formatPrice(props.order.total)}</div>
          </div>
        </div>
      }
      className={`flex-1 overflow-y-auto rounded-lg bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow ${
        !props.full ? "cursor-pointer" : ""
      }`}
      onClick={() => {
        if (!props.full) {
          navigate(`/order/${props.order.id}`, {
            state: props.order,
            viewTransition: true,
          });
        }
      }}
    >
      <div className="w-full px-3 py-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="rounded-md bg-primary/10 text-primary w-9 h-9 flex items-center justify-center text-sm font-medium">{itemCount}</div>
            <div>
              <div className="text-sm font-medium">Sản phẩm</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-gray-500">Phương thức</div>
            <div className="text-sm font-medium">{paymentMethod}</div>
          </div>
        </div>

        <CollapsibleOrderItems items={props.order.items} defaultExpanded={props.full} />

        <HorizontalDivider />

        <div className="px-3 py-2 space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <div>Tạm tính</div>
            <div>{formatPrice(subtotal)}</div>
          </div>
          {shippingFee > 0 && (
            <div className="flex justify-between text-xs text-gray-500">
              <div>Phí vận chuyển</div>
              <div>{formatPrice(shippingFee)}</div>
            </div>
          )}
          <div className="flex justify-between items-center pt-1">
            <div className="text-sm font-medium">Tổng tiền</div>
            <div className="text-lg font-bold text-primary">{formatPrice(props.order.total)}</div>
          </div>
        </div>
      </div>
    </Section>
  );
}

export default OrderSummary;
// ...existing code...
