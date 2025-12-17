import { shippingAddressState } from "@/state";
import { useAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button, Icon, Input } from "zmp-ui";

function ShippingAddressPage() {
  const [address, setAddress] = useAtom(shippingAddressState);
  const resetAddress = useResetAtom(shippingAddressState);
  const navigate = useNavigate();

  return (
    <form
      className="h-full flex flex-col justify-between"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const newAddress = {};
        data.forEach((value, key) => {
          newAddress[key] = value;
        });
        setAddress(newAddress as typeof address);
        toast.success("Đã cập nhật địa chỉ");
        navigate(-1);
      }}
    >
      <div className="py-2 space-y-2">
        <div className="bg-section p-4 grid gap-4">
          <Input name="alias" label="Tên địa chỉ" placeholder="Ví dụ: công ty, trường học" defaultValue={address?.alias} />
          <Input
            name="address"
            label={
              <>
                Địa chỉ (đường, số nhà) <span className="text-danger">*</span>
              </>
            }
            placeholder="Nhập địa chỉ"
            required
            defaultValue={address?.address}
            onInvalid={(e) => {
              e.currentTarget.setCustomValidity("Vui lòng nhập địa chỉ");
              e.currentTarget.reportValidity();
            }}
            onInput={(e) => {
              e.currentTarget.setCustomValidity("");
            }}
          />
          <Input name="address2" label="Địa chỉ (phần bổ sung)" placeholder="Tầng, căn hộ, tên toà nhà..." defaultValue={address?.address2 as any} />
          <Input name="company" label="Công ty" placeholder="Tên công ty (nếu có)" defaultValue={address?.company as any} />
          <Input name="city" label="Thành phố" placeholder="Ví dụ: Hồ Chí Minh" defaultValue={address?.city as any} />
          <Input name="province" label="Tỉnh/Thành" placeholder="Tỉnh/Thành" defaultValue={address?.province as any} />
          <Input name="district" label="Quận/Huyện" placeholder="Quận/Huyện" defaultValue={address?.district as any} />
          <Input name="ward" label="Phường/Xã" placeholder="Phường/Xã" defaultValue={address?.ward as any} />
          <Input name="zip" label="Mã bưu chính" placeholder="Zip / Postal code" defaultValue={address?.zip as any} />
        </div>
        <div className="bg-section p-4 grid gap-4">
          <Input name="name" label="Tên người nhận" placeholder="Nhập tên người nhận" defaultValue={address?.name} />
          <Input name="first_name" label="Tên (first name)" placeholder="First name" defaultValue={address?.first_name as any} />
          <Input name="last_name" label="Họ (last name)" placeholder="Last name" defaultValue={address?.last_name as any} />
          <Input name="phone" label="Số điện thoại" placeholder="0912345678" defaultValue={address?.phone} />
          <Input name="province_code" label="Mã tỉnh (province_code)" placeholder="Ví dụ: HC" defaultValue={address?.province_code as any} />
          <Input name="district_code" label="Mã quận (district_code)" placeholder="district code" defaultValue={address?.district_code as any} />
          <Input name="ward_code" label="Mã phường (ward_code)" placeholder="ward code" defaultValue={address?.ward_code as any} />
          <Input name="country_code" label="Mã quốc gia (country_code)" placeholder="Ví dụ: VN" defaultValue={address?.country_code as any} />
        </div>
        <Button
          fullWidth
          className="!bg-section !text-danger !rounded-none"
          type="danger"
          prefixIcon={<Icon icon="zi-delete" />}
          onClick={() => {
            resetAddress();
            toast.success("Đã xóa địa chỉ");
            navigate(-1);
          }}
        >
          Xóa địa chỉ này
        </Button>
      </div>
      <div className="p-6 pt-4 bg-section">
        <Button htmlType="submit" fullWidth>
          Xong
        </Button>
      </div>
    </form>
  );
}

export default ShippingAddressPage;
