import { Tabs } from "zmp-ui";
import OrderList from "./order-list";
import { ordersState } from "@/state";
import { useNavigate, useParams } from "react-router-dom";

function OrdersPage() {
  const { status } = useParams();
  const navigate = useNavigate();

  return (
    <Tabs className="h-full flex flex-col" activeKey={status} onChange={(status) => navigate(`/orders/${status}`)}>
      <Tabs.Tab key="pending" label="Đang xử lý">
        <OrderList ordersState={ordersState("pending")} />
      </Tabs.Tab>
      <Tabs.Tab key="shipping" label="Đang giao">
        <OrderList ordersState={ordersState("shipping")} />
      </Tabs.Tab>
      <Tabs.Tab key="completed" label="Đã hoàn thành">
        <OrderList ordersState={ordersState("completed")} />
      </Tabs.Tab>
      <Tabs.Tab key="cancelled" label="Đã hủy">
        <OrderList ordersState={ordersState("cancelled")} />
      </Tabs.Tab>
    </Tabs>
  );
}

export default OrdersPage;
