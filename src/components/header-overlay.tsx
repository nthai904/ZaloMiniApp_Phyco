import React from "react";
import { useNavigate } from "react-router";
import { WalletIcon, VoucherIcon } from "@/components/vectors";
import { Avatar } from "zmp-ui";

type Props = {
  pointsCount?: number;
  voucherCount?: number;
  className?: string;
  pointsBadgeCount?: number;
};

export default function HeaderOverlay({ pointsCount = 0, voucherCount = 0, className = "", pointsBadgeCount = 0 }: Props) {
  const navigate = useNavigate();

  return (
    <div className={"w-full mt-12 mb-5 max-w-md mx-auto bg-white text-black rounded-lg shadow-lg py-3 px-4 flex flex-col gap-3 z-50 pointer-events-auto" + className} role="group">
      {/* ------- PHẦN TRÊN ------- */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar
            size={41}
            src="https://scontent.fsgn5-12.fna.fbcdn.net/v/t39.30808-1/298030286_610132504162632_3563065853572641621_n.jpg?stp=c0.10.889.889a_dst-jpg_s200x200_tt6&_nc_cat=103&_nc_cb=99be929b-ad57045b&ccb=1-7&_nc_sid=e99d92&_nc_ohc=HW8T6xmign8Q7kNvwGYn5Aw&_nc_oc=AdngXUjVUaNUQfq9gjLCO-YH2W5ndT12o64Ejm2fd8Ul_0RMC_aiiRihrgJSXRd0vKgSshYQ9zF_nq_cymqJNT-6&_nc_zt=24&_nc_ht=scontent.fsgn5-12.fna&_nc_gid=BqL1t3_dgFocRlPgrehs6Q&oh=00_Afk5AEWNo3pBbkP_s9klkdCEAYznP_tAhCerJxl3OfV0hg&oe=6951920B"
          />

          <div className="flex flex-col">
            <span className="font-semibold text-sm">Lâm Nhật Huy</span>
          </div>
        </div>

        <div className="text-dark-600 font-semibold text-sm">{pointsCount} điểm</div>
      </div>

      {/* Đường gạch ngăn cách */}
      <div className="h-px w-full bg-gray-200" />

      {/* ------- PHẦN DƯỚI ------- */}
      <div className="flex items-center justify-around pt-1 relative">
        <button type="button" onClick={() => navigate("/")} className="flex flex-col items-center cursor-pointer relative" aria-label="Tích điểm">
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

        <button type="button" onClick={() => navigate("/")} className="flex flex-col items-center cursor-pointer">
          <div className="w-8 h-8 flex items-center justify-center">
            <VoucherIcon />
          </div>
          <span className="text-xs mt-1">My Voucher</span>
        </button>
      </div>
    </div>
  );
}
