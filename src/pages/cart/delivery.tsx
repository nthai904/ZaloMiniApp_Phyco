import Section from "@/components/section";
import TransitionLink from "@/components/transition-link";
import { LocationMarkerLineIcon, LocationMarkerPackageIcon, PlusIcon } from "@/components/vectors";
import { shippingAddressState } from "@/state";
import { useAtomValue } from "jotai";
import DeliverySummary from "./delivery-summary";

function ShippingAddressSummary() {
  const shippingAddress = useAtomValue(shippingAddressState);

  if (!shippingAddress) {
    return (
      <TransitionLink className="flex flex-col space-y-2 justify-center items-center p-4 w-full" to="/shipping-address">
        <LocationMarkerPackageIcon />
        <div className="flex space-x-1 items-center text-center p-2">
          <PlusIcon width={16} height={16} />
          <span className="text-sm font-medium">Thêm địa chỉ nhận hàng</span>
        </div>
      </TransitionLink>
    );
  }

  return (
    <DeliverySummary
      icon={<LocationMarkerLineIcon />}
      title="Địa chỉ nhận hàng"
      subtitle={shippingAddress.alias}
      description={shippingAddress.address}
      linkTo="/shipping-address"
    />
  );
}

function Delivery() {
  return (
    <Section title="Nhập địa chỉ nhận hàng" className="rounded-lg">
      <div className="p-2">
        <ShippingAddressSummary />
      </div>
    </Section>
  );
}

export default Delivery;
