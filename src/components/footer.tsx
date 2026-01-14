import { ArticleIcon, CategoryIcon, HomeIcon, PackageIcon } from "./vectors";
import { ShoppingCartOutlined } from "@ant-design/icons";
import HorizontalDivider from "./horizontal-divider";
import { useAtomValue } from "jotai";
import { cartStateV2 } from "@/state";
import TransitionLink from "./transition-link";
import { useRouteHandle } from "@/hooks";
import { useLocation } from "react-router-dom";
import Badge from "./badge";

const NAV_ITEMS = [
  {
    name: "Trang chủ",
    path: "/",
    icon: HomeIcon,
  },
  {
    name: "Sản phẩm",
    path: "/products",
    icon: CategoryIcon,
  },
  {
    name: "Bài viết",
    path: "/articles",
    icon: ArticleIcon,
  },
  // {
  //   name: "Đơn hàng",
  //   path: "/orders",
  //   icon: PackageIcon,
  // },
  {
    name: "Giỏ hàng",
    path: "/cart",
    icon: (props: { active?: boolean }) => {
      const cart = useAtomValue(cartStateV2);
      const color = props.active ? "var(--primary)" : "#6F7071";

      return (
        <Badge value={cart.length}>
          <ShoppingCartOutlined style={{ fontSize: 24, color }} />
        </Badge>
      );
    },
  },
];

export default function Footer() {
  const [handle] = useRouteHandle();
  const location = useLocation();
  const pathname = location.pathname;

  if (!handle?.noFooter) {
    return (
      <>
        <HorizontalDivider />
        <div
          className="w-full px-4 pt-2 grid pb-sb"
          style={{
            gridTemplateColumns: `repeat(${NAV_ITEMS.length}, 1fr)`,
          }}
        >
          {NAV_ITEMS.map((item) => {
            let isActive = pathname === item.path;
            if (item.path === "/articles") {
              if (pathname.startsWith("/article") || pathname.startsWith("/articles") || pathname.startsWith("/blogs")) {
                isActive = true;
              }
            }

            return (
              <TransitionLink to={item.path} key={item.path} className="flex flex-col items-center space-y-0.5 p-1 pb-0.5 cursor-pointer active:scale-105">
                <>
                  <div className="w-6 h-6 flex justify-center items-center">
                    <item.icon active={isActive} />
                  </div>
                  <div className={`text-2xs ${isActive ? "text-primary" : ""}`}>{item.name}</div>
                </>
              </TransitionLink>
            );
          })}
        </div>
      </>
    );
  }
}
