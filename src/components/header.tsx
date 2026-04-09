import { useAtomValue } from "jotai";
import { useLocation, useNavigate } from "react-router-dom";
import { categoriesStateUpwrapped, loadableUserInfoState } from "@/state";
import { useMemo, useState, useEffect } from "react";
import { useRouteHandle } from "@/hooks";
import SearchBar from "./search-bar";
import { ShoppingCartOutlined } from "@ant-design/icons";
import HeaderOverlay from "@/components/header-overlay";
import { cartStateV2 } from "@/state";
import logoImage from "@/static/logo-1.png";

type HeaderProps = {
  overlayProgress?: number;
  isScrolled?: boolean;
};

export default function Header({ overlayProgress = 1, isScrolled = false }: HeaderProps) {
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

  const cart = useAtomValue(cartStateV2);

  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    if (location.pathname !== "/search") setSearchFocused(false);
  }, [location.pathname]);

  const isHomePage = location.pathname === "/";
  const shouldRoundBottomCorners = isHomePage && !isScrolled;
  const visibleOverlayProgress = searchFocused ? 0 : overlayProgress;

  return (
    <div className="w-full flex flex-col bg-transparent z-10 relative">
      {/* Dải header màu xanh ở phía trên */}
      <div
        className={`bg-gradient-to-r px-4 pt-st bg-no-repeat bg-right-top bg-main transition-all duration-300 ease-in-out ${
          shouldRoundBottomCorners ? "rounded-bl-lg rounded-br-lg" : ""
        } pb-7`}
      >
        <div
          className="pt-1 transition-transform duration-300 ease-out"
          style={{
            transform: isHomePage && isScrolled ? "scale(0.98) translateY(-2px)" : "scale(1) translateY(0px)",
            transformOrigin: "top center",
            willChange: "transform",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo thương hiệu  */}
              <div className="w-20 h-10 sm:w-32 sm:h-10 flex items-center justify-center cursor-pointer" onClick={() => navigate("/")} aria-label="Home">
                <img src={logoImage} alt="Logo" className="max-w-full max-h-full object-contain" loading="lazy" />
              </div>

              {/* Thanh tìm kiếm  */}
              <div>
                <div className="w-[70%] py-3 flex space-x-2">
                  <SearchBar
                    onFocus={() => {
                      setSearchFocused(true);
                      if (location.pathname !== "/search") {
                        navigate("/search", { viewTransition: true });
                      }
                    }}
                  />
                </div>
              </div>

              <div className="w-8 h-8 relative flex items-center justify-center cursor-pointer" onClick={() => navigate("/cart")} aria-label="Giỏ hàng">
                <ShoppingCartOutlined
                  style={{
                    fontSize: 24,
                    color: "#fff",
                    transform: "translateX(-70px)",
                  }}
                />
                <span className="absolute -top-0 -left-12 bg-danger text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">{cart.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {handle?.search && (
        <div
          className="absolute left-0 right-0 px-4 transition-all duration-200 ease-out"
          style={{
            top: "100%",
            marginTop: -20,
            opacity: visibleOverlayProgress,
            transform: `translateY(${-8 * (1 - visibleOverlayProgress)}px)`,
            pointerEvents: visibleOverlayProgress > 0.05 ? "auto" : "none",
            willChange: "opacity, transform",
          }}
        >
          <div className="transition-all duration-200 ease-out" style={{ willChange: "transform, opacity" }}>
            <HeaderOverlay pointsCount={0} voucherCount={0} />
          </div>
        </div>
      )}
    </div>
  );
}
