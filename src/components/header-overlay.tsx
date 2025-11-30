import React from "react";
import { useNavigate } from "react-router";
import { WalletIcon, VoucherIcon } from "@/components/vectors";

type Props = {
  pointsCount?: number;
  voucherCount?: number;
  className?: string;
  pointsBadgeCount?: number;
};

export default function HeaderOverlay({ pointsCount = 0, voucherCount = 0, className = "", pointsBadgeCount = 0 }: Props) {
  const navigate = useNavigate();

  return (
    <div className={"w-full max-w-md mx-auto bg-white text-black rounded-lg shadow-lg py-3 px-4 flex flex-col gap-3 z-50 pointer-events-auto" + className} role="group">
      {/* ------- PHẦN TRÊN ------- */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="https://scontent.fsgn5-12.fna.fbcdn.net/v/t39.30808-1/298030286_610132504162632_3563065853572641621_n.jpg?stp=c0.10.889.889a_dst-jpg_s200x200_tt6&_nc_cat=103&ccb=1-7&_nc_sid=e99d92&_nc_ohc=w83NOa4JTnwQ7kNvwHDZWpY&_nc_oc=AdlMw2e-oCCO0563piUOkS0N5ntMXetiZ-j_hONE0NpgEbbJCv2f5TrGm6DlTGgQeQ51G5ZWc1nOXYvCZ51c4h-U&_nc_zt=24&_nc_ht=scontent.fsgn5-12.fna&_nc_gid=bhEcV05uSPM9HTvNYqM-3Q&oh=00_AfiVltgsbG3jUA7zc7MyMG0zEbU1q-9YvelTZg4emXpWUQ&oe=6930D4CB"
            alt="User Avatar"
            className="w-10 h-10 rounded-full object-cover"
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
