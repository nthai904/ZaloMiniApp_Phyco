import TransitionLink from "@/components/transition-link";
import { useEffect, useState } from "react";

const NO_IMAGE_URL = "https://theme.hstatic.net/200000436051/1000801313/14/no_image.jpg?v=721";

interface Collection {
  id: number | string;
  title: string;
  handle: string;
  image: { src: string } | string | null;
}

function mapToCollection(c: any): Collection {
  return {
    id: c.id ?? 0,
    title: c.title ?? "",
    handle: c.handle ?? "",
    image: c.image ?? null,
  };
}

export default function Category() {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    async function loadCollectionsWithProducts() {
      try {
        const res = await fetch(`${import.meta.env.VITE_RENDER_API_URL}/api/collection/`);
        const data = await res.json();

        let collectionArray: any[] = [];

        if (data.custom_collections && Array.isArray(data.custom_collections)) {
          collectionArray = data.custom_collections;
        } else if (Array.isArray(data)) {
          collectionArray = data;
        } else if (data.collections && Array.isArray(data.collections)) {
          collectionArray = data.collections;
        }

        const mappedCollections = collectionArray.filter((c) => c != null).map(mapToCollection);

        const collectionsWithProducts = await Promise.all(
          mappedCollections.map(async (collection) => {
            try {
              const collectRes = await fetch(`${import.meta.env.VITE_RENDER_API_URL}/api/collect?collection_id=${collection.id}`);
              const collectData = await collectRes.json();
              const collects = collectData?.collects ?? collectData ?? [];

              if (Array.isArray(collects) && collects.length > 0) {
                return collection;
              }
              return null;
            } catch (err) {
              console.error(`Error checking products for collection ${collection.id}:`, err);
              return null;
            }
          })
        );

        const filteredCollections = collectionsWithProducts.filter((c) => c != null) as Collection[];
        setCollections(filteredCollections);
      } catch (err) {
        console.error("❌ API ERROR:", err);
        setCollections([]);
      }
    }

    loadCollectionsWithProducts();
  }, []);

  if (collections.length === 0) {
    return null;
  }

  return (
    <div
      className="bg-section grid gap-x-2 gap-y-4 py-2 px-4 overflow-x-auto"
      style={{
        gridTemplateColumns: `repeat(${Math.ceil(collections.length > 4 ? collections.length / 2 : collections.length)}, minmax(70px, 1fr))`,
      }}
    >
      {collections.map((collection) => {
        const imageSrc = collection.image && typeof collection.image === "object" ? collection.image.src : collection.image;
        return (
          <TransitionLink
            key={collection.id}
            className="flex flex-col items-center space-y-1 flex-none overflow-hidden cursor-pointer mx-auto"
            to={`/products?active=${collection.id}`}
          >
            <img src={imageSrc || NO_IMAGE_URL} className="w-12 h-12 object-cover rounded-full bg-skeleton" alt={collection.title} />
            <div className="text-center text-3xs w-full line-clamp-2 text-subtitle">{collection.title}</div>
          </TransitionLink>
        );
      })}
    </div>
  );
}
