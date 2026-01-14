import ResizeObserver from "resize-observer-polyfill";
Object.assign(window, { ResizeObserver });

import { useCallback, useEffect, useState } from "react";
import { EmblaCarouselType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import banner1 from "@/static/banner1.png";
import banner2 from "@/static/banner2.png";

type UseDotButtonType = {
  selectedIndex: number;
  scrollSnaps: number[];
  onDotButtonClick: (index: number) => void;
};

export const useDotButton = (emblaApi: EmblaCarouselType | undefined): UseDotButtonType => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onDotButtonClick = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onInit = useCallback((emblaApi: EmblaCarouselType) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on("reInit", onInit).on("reInit", onSelect).on("select", onSelect);
  }, [emblaApi, onInit, onSelect]);

  return {
    selectedIndex,
    scrollSnaps,
    onDotButtonClick,
  };
};

export interface CarouselProps {
  disabled?: boolean; 
}

export default function Carousel(props: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "center" }, [Autoplay({ active: !props.disabled })]);
  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi);

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex space-x-2 mt-2 mx-4 h-[120px]">
        <div className="flex-none basis-full">
          <img src={banner1} alt="Banner 1" className="w-full h-full object-cover" />
        </div>
        <div className="flex-none basis-full">
          <img src={banner2} alt="Banner 2" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="py-2 flex justify-center items-center space-x-2">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => onDotButtonClick(index)}
            className={`rounded-full w-1 h-1 bg-black/10 ${index === selectedIndex && !props.disabled ? "bg-primary" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
