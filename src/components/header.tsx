import { useAtomValue } from "jotai";
import { useLocation, useNavigate } from "react-router-dom";
import { categoriesStateUpwrapped, loadableUserInfoState, userInfoState } from "@/state";
import { useMemo } from "react";
import { useRouteHandle } from "@/hooks";
import { getConfig } from "@/utils/template";
import headerIllus from "@/static/header-illus.svg";
import SearchBar from "./search-bar";
import TransitionLink from "./transition-link";
import { Icon } from "zmp-ui";
import { DefaultUserAvatar } from "./vectors";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { Badge } from "antd";
import HeaderOverlay from "@/components/header-overlay";
import { cartState } from "@/state";

export default function Header() {
  const categories = useAtomValue(categoriesStateUpwrapped);
  const navigate = useNavigate();
  const location = useLocation();
  const [handle, match] = useRouteHandle();
  const userInfo = useAtomValue(loadableUserInfoState);

  const title = useMemo(() => {
    if (handle) {
      if (typeof handle.title === "function") {
        return handle.title({ categories, params: match.params });
      } else {
        return handle.title;
      }
    }
  }, [handle, categories]);

  const showBack = location.key !== "default" && !handle?.noBack;

  const cart = useAtomValue(cartState);

  return (
    <div className="w-full flex flex-col bg-white">
      {/* Dải header màu xanh ở phía trên */}
      <div className="bg-gradient-to-r px-4 pb-9 pt-st bg-no-repeat bg-right-top bg-main rounded-bl-lg rounded-br-lg">
        <div className="pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo thương hiệu  */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer" onClick={() => navigate("/")}>
                <img src={getConfig((c) => c.template.logoUrl)} alt="Logo" className="w-full h-full object-cover rounded-full" />
              </div>

              {/* Thanh tìm kiếm  */}
              <div>
                {handle?.search && (
                  <div className="w-[75%] py-3 flex space-x-2">
                    <SearchBar
                      onFocus={() => {
                        if (location.pathname !== "/search") {
                          navigate("/search", { viewTransition: true });
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Giỏ hàng chỉ hiển thị giống logic thanh search (chỉ ở các trang có handle.search) */}
              {handle?.search && (
                <div className="w-8 h-8 relative flex items-center justify-center cursor-pointer" onClick={() => navigate("/cart")} aria-label="Giỏ hàng">
                  <ShoppingCartOutlined style={{ fontSize: 24, color: "#fff", transform: "translateX(-70px)" }} />
                  <span className="absolute -top-0 -left-12 bg-danger text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">{cart.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* HeaderOverlay dính với mép dưới của header, không cần lớp phủ trắng */}
      <div className="px-4 -mt-6">{handle?.search && <HeaderOverlay pointsCount={0} voucherCount={0} />}</div>
    </div>
  );
}
