import { shippingAddressState } from "@/state";
import { useAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button, Icon, Input } from "zmp-ui";
import useLocations from "@/hooks/useLocations";
import Select from "@/components/select";

function ShippingAddressPage() {
  const [address, setAddress] = useAtom(shippingAddressState);
  const resetAddress = useResetAtom(shippingAddressState);
  const navigate = useNavigate();
  const { provinces, districts, wards, selectedProvince, selectedDistrict, selectedWard, ensureProvincesLoaded, handleProvinceChange, handleDistrictChange, handleWardChange } =
    useLocations(address);

  return (
    <form
      className="h-full flex flex-col justify-between"
      onSubmit={(e) => {
        e.preventDefault();
        try {
          const data = new FormData(e.currentTarget);
          const addressInput = String(data.get("address") ?? "").trim();
          const ward = String(data.get("ward") ?? "").trim() || null;
          const district = String(data.get("district") ?? "").trim() || null;
          const province = String(data.get("province") ?? "").trim() || null;

          // Tạo address1 bằng cách ghép: địa chỉ + xã + huyện + tỉnh
          const addressParts: string[] = [];
          if (addressInput) addressParts.push(addressInput);
          if (ward) addressParts.push(ward);
          if (district) addressParts.push(district);
          if (province) addressParts.push(province);
          const address1 = addressParts.join(" ");

          const sanitized: any = {
            address: addressInput,
            address1: address1, // Lưu địa chỉ đầy đủ
            name: String(data.get("name") ?? "").trim(),
            phone: String(data.get("phone") ?? "").trim(),
            email: String(data.get("email") ?? "").trim(),
            province: province,
            province_code: String(data.get("province_code") ?? "").trim() || null,
            district: district,
            district_code: String(data.get("district_code") ?? "").trim() || null,
            ward: ward,
            ward_code: String(data.get("ward_code") ?? "").trim() || null,
          };

          setAddress(sanitized as typeof address);
          toast.success("Đã cập nhật địa chỉ");
          navigate(-1);
        } catch (err) {
          console.error("Failed to save address", err);
          toast.error("Không thể lưu địa chỉ lúc này");
        }
      }}
    >
      <div className="py-2 space-y-2">
        <div className="bg-section p-4 grid gap-4">
          <Input
            name="address"
            label={
              <>
                Địa chỉ <span className="text-danger">*</span>
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
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div>
                <div className="text-xs text-gray-500 mb-1">Tỉnh/Thành phố</div>
                <div onMouseDown={() => ensureProvincesLoaded()}>
                  <Select
                    items={provinces}
                    value={selectedProvince}
                    renderItemKey={(p: any) => String(p.code ?? p.name)}
                    renderItemLabel={(p: any) => p.name}
                    renderTitle={(s) => (s ? s.name : "Chọn tỉnh/Thành phố")}
                    onChange={(p) => handleProvinceChange(p)}
                  />
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Quận/Huyện</div>
                <Select
                  items={districts}
                  value={selectedDistrict}
                  renderItemKey={(d: any) => String(d.code ?? d.name)}
                  renderItemLabel={(d: any) => d.name}
                  renderTitle={(s) => (s ? s.name : "Chọn quận/huyện")}
                  onChange={(d) => handleDistrictChange(d)}
                />
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Phường/Xã</div>
                <Select
                  items={wards}
                  value={selectedWard}
                  renderItemKey={(w: any) => String(w.code ?? w.name)}
                  renderItemLabel={(w: any) => w.name}
                  renderTitle={(s) => (s ? s.name : "Chọn phường/xã")}
                  onChange={(w) => handleWardChange(w)}
                />
              </div>
            </div>

            <input type="hidden" name="province" value={selectedProvince?.name ?? address?.province ?? ""} />
            <input type="hidden" name="province_code" value={selectedProvince?.code ?? (address as any)?.province_code ?? ""} />
            <input type="hidden" name="district" value={selectedDistrict?.name ?? address?.district ?? ""} />
            <input type="hidden" name="district_code" value={selectedDistrict?.code ?? (address as any)?.district_code ?? ""} />
            <input type="hidden" name="ward" value={selectedWard?.name ?? address?.ward ?? ""} />
            <input type="hidden" name="ward_code" value={selectedWard?.code ?? (address as any)?.ward_code ?? ""} />
          </div>
        </div>
        <div className="bg-section p-4 grid gap-4">
          <Input name="name" label="Tên người nhận" placeholder="Nhập tên người nhận" defaultValue={address?.name} />
          <Input name="phone" label="Số điện thoại" placeholder="0912345678" defaultValue={address?.phone} />
          <Input name="email" label="Email" placeholder="abc@gmail.com" defaultValue={address?.email ?? ""} />
        </div>
      </div>

      <div className="px-6 py-6 pb-1 pt-4 bg-section">
        <Button htmlType="submit" fullWidth>
          Lưu địa chỉ
        </Button>
      </div>

      <div className="px-6 py-6 pt-1 bg-section">
        <Button
          type="danger"
          onClick={() => {
            resetAddress();
            toast.success("Đã xóa địa chỉ");
            navigate(-1);
          }}
          fullWidth
        >
          Xoá địa chỉ này
        </Button>
      </div>
    </form>
  );
}

export default ShippingAddressPage;
