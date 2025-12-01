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

type HeaderProps = {
  showHeaderOverlay?: boolean;
  isScrolled?: boolean;
};

export default function Header({ showHeaderOverlay = true, isScrolled = false }: HeaderProps) {
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

  const isHomePage = location.pathname === "/";
  const shouldRoundBottomCorners = isHomePage && !isScrolled;
  const shouldShrink = isHomePage && isScrolled;

  const getHeaderPadding = () => {
    if (isHomePage) {
      return shouldShrink ? "pb-1" : "pb-8";
    }
    return "pb-4";
  };

  return (
    <div className="w-full flex flex-col bg-transparent z-10">
      {/* Dải header màu xanh ở phía trên */}
      <div
        className={`bg-gradient-to-r px-4 pt-st bg-no-repeat bg-right-top bg-main transition-all duration-300 ease-in-out ${
          shouldRoundBottomCorners ? "rounded-bl-lg rounded-br-lg" : ""
        } ${getHeaderPadding()}`}
      >
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

      {handle?.search && (
        <div
          className={`-mt-6 px-4 overflow-hidden transition-all duration-300 ease-in-out ${showHeaderOverlay ? "max-h-96 opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}
          style={{
            willChange: "max-height, opacity",
          }}
        >
          <div
            className={`transition-transform duration-300 ease-in-out ${showHeaderOverlay ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}`}
            style={{
              willChange: "transform, opacity",
            }}
          >
            <HeaderOverlay pointsCount={0} voucherCount={0} />
          </div>
        </div>
      )}
    </div>
  );
}
