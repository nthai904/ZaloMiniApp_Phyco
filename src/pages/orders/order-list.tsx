import { Order } from "@/types";
import { Atom, useAtomValue } from "jotai";
import { loadable } from "jotai/utils";
import { useMemo } from "react";
import { EmptyOrder } from "@/components/empty";
import OrderSummary from "./order-summary";
import { OrderSummarySkeleton } from "@/components/skeleton";

function OrderList(props: { ordersState: Atom<Promise<Order[]>> }) {
  const orderList = useAtomValue(useMemo(() => loadable(props.ordersState), [props.ordersState]));

  if (orderList.state === "hasData") {
    if (orderList.data.length === 0) return <EmptyOrder />;

    return (
      <div className="space-y-2 p-4">
        {orderList.data.map((order) => (
          <OrderSummary key={order.id} order={order} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      <OrderSummarySkeleton />
      <OrderSummarySkeleton />
      <OrderSummarySkeleton />
    </div>
  );
}

export default OrderList;
