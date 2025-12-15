import Carousel from "@/components/carousel";
import { useAtomValue } from "jotai";
import { bannersState } from "@/state";

export default function Banners() {
  const banners = useAtomValue(bannersState);

  return (
    <Carousel
      slides={banners.map((banner) => (
        <div className="w-full rounded overflow-hidden relative" style={{ paddingTop: "36%" }}>
          <img src={banner} className="absolute inset-0 w-full h-full object-cover block" loading="lazy" decoding="async" alt="banner" />
        </div>
      ))}
    />
  );
}
