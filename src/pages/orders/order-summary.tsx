// ...existing code...
import HorizontalDivider from "@/components/horizontal-divider";
import Section from "@/components/section";
import { Order } from "@/types";
import { formatPrice } from "@/utils/format";
import CollapsibleOrderItems from "./collapsible-order-items";
import { useNavigate } from "react-router-dom";

function OrderSummary(props: { order: Order; full?: boolean }) {
  const navigate = useNavigate();

  const statusMap: Record<string, { text: string; className: string }> = {
    pending: { text: "Chờ xác nhận", className: "bg-yellow-50 text-yellow-800" },
    success: { text: "Đã thanh toán", className: "bg-green-50 text-green-800" },
    failed: { text: "Thanh toán thất bại", className: "bg-red-50 text-red-800" },
  };

  const status = statusMap[props.order.paymentStatus] ?? { text: props.order.paymentStatus, className: "bg-gray-50 text-gray-800" };
  const itemCount = props.order.items?.length ?? 0;

  return (
    <Section
      title={
        <div className="w-full flex items-center justify-between space-x-3">
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <div className="text-sm font-semibold truncate">Đơn #{props.order.id}</div>
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${status.className}`}>{status.text}</span>
            </div>
            <div className="text-xs text-muted mt-1 truncate">Thời gian nhận: Từ 16h, 20/1/2025</div>
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
              <div className="text-sm font-medium">Số sản phẩm</div>
              <div className="text-xs text-gray-500">{itemCount} item(s)</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-gray-500">Phương thức</div>
            <div className="text-sm font-medium">Chưa rõ</div>
          </div>
        </div>

        <CollapsibleOrderItems items={props.order.items} defaultExpanded={props.full} />

        <HorizontalDivider />

        <div className="px-3 py-2 space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <div>Tạm tính</div>
            <div>{formatPrice(props.order.total)}</div>
          </div>
          {"" !== undefined && (
            <div className="flex justify-between text-xs text-gray-500">
              <div>Phí vận chuyển</div>
              <div>0đ</div>
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
