import { useAtomValue } from "jotai";
import { useLocation, useNavigate } from "react-router-dom";
import {
  categoriesStateUpwrapped,
  loadableUserInfoState,
  userInfoState,
} from "@/state";
import { useMemo } from "react";
import { useRouteHandle } from "@/hooks";
import { getConfig } from "@/utils/template";
import headerIllus from "@/static/header-illus.svg";
import SearchBar from "./search-bar";
import TransitionLink from "./transition-link";
import { Icon } from "zmp-ui";
import { DefaultUserAvatar } from "./vectors";

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

  return (
    <div className="bg-gradient-to-r w-full flex flex-col px-4 pt-st overflow-hidden bg-no-repeat bg-right-top bg-main text-white">
      <div className="pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
              onClick={() => navigate("/")}
            >
              <img
                src={getConfig((c) => c.template.logoUrl)}
                alt="Logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              {handle?.search && (
                <div className="w-[80%] py-2 flex space-x-2">
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
          </div>
        </div>
      </div>
    </div>

    // <div
    //   className="w-full flex flex-col px-4 bg-primary text-primaryForeground pt-st overflow-hidden bg-no-repeat bg-right-top"
    //   style={{
    //     backgroundImage: `url(${headerIllus})`,
    //   }}
    // >
    //   <div className="w-full min-h-12 pr-[90px] flex py-2 space-x-2 items-center">
    //     {handle?.logo ? (
    //       <>
    //         <img
    //           src={getConfig((c) => c.template.logoUrl)}
    //           className="flex-none w-8 h-8 rounded-full"
    //         />
    //         <TransitionLink to="/stations" className="flex-1 overflow-hidden">
    //           <div className="flex items-center space-x-1">
    //             <h1 className="text-lg font-bold">
    //               {getConfig((c) => c.template.shopName)}
    //             </h1>
    //             <Icon icon="zi-chevron-right" />
    //           </div>
    //           <p className="overflow-x-auto whitespace-nowrap text-2xs">
    //             {getConfig((c) => c.template.shopAddress)}
    //           </p>
    //         </TransitionLink>
    //       </>
    //     ) : (
    //       <>
    //         {showBack && (
    //           <div
    //             className="py-1 px-2 cursor-pointer"
    //             onClick={() => navigate(-1)}
    //           >
    //             <Icon icon="zi-arrow-left" />
    //           </div>
    //         )}
    //         <div className="text-xl font-medium truncate">{title}</div>
    //       </>
    //     )}
    //   </div>
    //   {handle?.search && (
    //     <div className="w-full py-2 flex space-x-2">
    //       <SearchBar
    //         onFocus={() => {
    //           if (location.pathname !== "/search") {
    //             navigate("/search", { viewTransition: true });
    //           }
    //         }}
    //       />
    //       <TransitionLink to="/profile">
    //         {userInfo.state === "hasData" && userInfo.data ? (
    //           <img
    //             className="w-8 h-8 rounded-full"
    //             src={userInfo.data.avatar}
    //           />
    //         ) : (
    //           <DefaultUserAvatar
    //             width={32}
    //             height={32}
    //             className={userInfo.state === "loading" ? "animate-pulse" : ""}
    //           />
    //         )}
    //       </TransitionLink>
    //     </div>
    //   )}
    // </div>
  );
}
