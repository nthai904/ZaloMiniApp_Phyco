import ProfileActions from "./actions";
import FollowOA from "./follow-oa";
import Points from "./points";
import UserInfo from "./user-info";
import Section from "@/components/section";
import TransitionLink from "@/components/transition-link";
import { Icon } from "zmp-ui";

export default function ProfilePage() {
  return (
    <div className="min-h-full bg-background p-4 space-y-4">
      {/* Top: user summary + points */}
      <div className="rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-indigo-600 p-4">
          <UserInfo>
            <Points />
          </UserInfo>
        </div>
      </div>

      {/* Quick actions and account sections */}
      <div className="grid gap-4">
        <ProfileActions />

        <Section title={<span>Tài khoản & Cài đặt</span>}>
          <div className="grid gap-2 p-2">
            <TransitionLink to="/profile/edit" className="flex items-center justify-between p-3 rounded-lg bg-white border-[0.5px] border-black/10">
              <div className="flex items-center gap-3">
                <Icon icon="zi-user" />
                <div>
                  <div className="text-sm font-medium">Thông tin cá nhân</div>
                  <div className="text-2xs text-subtitle">Cập nhật tên, số điện thoại</div>
                </div>
              </div>
              <Icon icon="zi-arrow-right" />
            </TransitionLink>

            <TransitionLink to="/profile/points" className="flex items-center justify-between p-3 rounded-lg bg-white border-[0.5px] border-black/10">
              <div className="flex items-center gap-3">
                <Icon icon="zi-gift" />
                <div>
                  <div className="text-sm font-medium">Điểm & ưu đãi</div>
                  <div className="text-2xs text-subtitle">Xem điểm, voucher</div>
                </div>
              </div>
              <Icon icon="zi-arrow-right" />
            </TransitionLink>

            <TransitionLink to="/support" className="flex items-center justify-between p-3 rounded-lg bg-white border-[0.5px] border-black/10">
              <div className="flex items-center gap-3">
                <Icon icon="zi-help-circle" />
                <div>
                  <div className="text-sm font-medium">Trợ giúp & liên hệ</div>
                  <div className="text-2xs text-subtitle">Câu hỏi thường gặp, chat</div>
                </div>
              </div>
              <Icon icon="zi-arrow-right" />
            </TransitionLink>
          </div>
        </Section>
      </div>

      <FollowOA />
    </div>
  );
}
