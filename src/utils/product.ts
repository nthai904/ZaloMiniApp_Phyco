import { createOrder } from "zmp-sdk";
import { getConfig } from "./config";

type PayParams = {
  amount: number;
  mac: string;
  description?: string;
};

const pay = ({ amount, mac, description }: PayParams) =>
  createOrder({
    desc: description ?? `Thanh toán cho ${getConfig(c => c.app.title)}`,
    item: [],
    extradata: "",  
    mac,
    amount,
    success: (data) => console.log("Payment success:", data),
    fail: (err) => console.log("Payment error:", err),
  });

export default pay;