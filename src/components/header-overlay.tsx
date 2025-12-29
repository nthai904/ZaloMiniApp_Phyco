import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { WalletIcon, VoucherIcon } from "@/components/vectors";
import { Avatar } from "zmp-ui";
import { authorize, getSetting, getUserInfo } from "zmp-sdk/apis";
import toast from "react-hot-toast";
import { useAtomValue } from "jotai";
import { userInfoState } from "@/state";

type Props = {
  pointsCount?: number;
  voucherCount?: number;
  className?: string;
  pointsBadgeCount?: number;
};

export default function HeaderOverlay({
  pointsCount = 0,
  voucherCount = 0,
  className = "",
  pointsBadgeCount = 0,
}: Props) {
  const navigate = useNavigate();
  const userInfo = useAtomValue(userInfoState);

  useEffect(() => {
    const requestPermissions = async () => {
      if (typeof window.ZJSBridge !== 'undefined') {
        try {
          const { authSetting } = await getSetting({});
          const userInfoGranted = authSetting["scope.userInfo"];
          const phoneGranted = authSetting["scope.userPhonenumber"];
    
          if (!userInfoGranted || !phoneGranted) {
            await authorize({
              scopes: ["scope.userInfo", "scope.userPhonenumber"],
            });
            
          }
        } catch (error) {
        }
      }
    };
    
    requestPermissions();
  }, []);

  return (
    <div
      className={
        "w-full max-w-md mx-auto bg-white text-black rounded-lg shadow-lg py-3 px-4 flex flex-col gap-3 z-50 pointer-events-auto" +
        className
      }
      role="group"
    >
      {/* ------- PHẦN TRÊN ------- */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar
            size={41}
            src={userInfo?.avatar || ""}
          />

          <div className="flex flex-col">
            <span className="font-semibold text-sm">{userInfo?.name || "Đang tải..."}</span>
          </div>
        </div>

        <div className="text-dark-600 font-semibold text-sm">
          {pointsCount} điểm
        </div>
      </div>

      {/* Đường gạch ngăn cách */}
      <div className="h-px w-full bg-gray-200" />

      {/* ------- PHẦN DƯỚI ------- */}
      <div className="flex items-center justify-around pt-1 relative">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex flex-col items-center cursor-pointer relative"
          aria-label="Tích điểm"
        >
          <div className="relative">
            <WalletIcon />

            <span
              className="absolute -left-1 -bottom-1 w-4 h-4 bg-green-500 text-white
             text-[10px] leading-none font-bold rounded-full flex items-center justify-center
             border-2 border-white"
              aria-hidden="true"
            >
              <p className="absolute bottom-0.5">+</p>
            </span>
          </div>

          <span className="text-xs mt-1">Tích điểm</span>
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex flex-col items-center cursor-pointer"
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <VoucherIcon />
          </div>
          <span className="text-xs mt-1">My Voucher</span>
        </button>
      </div>
    </div>
  );
}
