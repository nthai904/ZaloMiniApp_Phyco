import TransitionLink from "@/components/transition-link";
import { useAtomValue } from "jotai";
import { collectionsWithProductsState } from "@/api/state";

const NO_IMAGE_URL = "https://theme.hstatic.net/200000436051/1000801313/14/no_image.jpg?v=721";

export default function Category() {
  const collections = useAtomValue(collectionsWithProductsState);

  return (
    <div
      className="bg-section grid gap-x-2 gap-y-4 py-2 px-4 overflow-x-auto"
      style={{
        gridTemplateColumns: `repeat(${Math.ceil(collections.length > 4 ? collections.length / 2 : collections.length)}, minmax(70px, 1fr))`,
      }}
    >
      {collections.map((collection: any) => (
        <TransitionLink
          key={collection.id}
          className="flex flex-col items-center space-y-1 flex-none overflow-hidden cursor-pointer mx-auto"
          to={`/products?active=${collection.id}`}
        >
          <img src={collection?.image?.src || collection?.image || NO_IMAGE_URL} className="w-12 h-12 object-cover rounded-full bg-skeleton" alt={collection.title} />
          <div className="text-center text-3xs w-full line-clamp-2 text-subtitle">{collection.title}</div>
        </TransitionLink>
      ))}
    </div>
  );
}
