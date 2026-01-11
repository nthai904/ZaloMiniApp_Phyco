import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductItemV2 from "@/components/product-item";

interface Collection {
  id: number | string;
  title: string;
  handle: string;
  image: { src: string } | string | null;
}

export default function CategoryListPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollection, setActiveCollection] = useState<number | string | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetch("https://api-server-nuj6.onrender.com/api/collection/")
      .then((res) => res.json())
      .then((data) => {
        console.log("🔥 COLLECTION DATA FROM SERVER:", data);

        let collectionArray: any[] = [];

        if (data.custom_collections && Array.isArray(data.custom_collections)) {
          collectionArray = data.custom_collections;
        } else if (Array.isArray(data)) {
          collectionArray = data;
        } else if (data.collections && Array.isArray(data.collections)) {
          collectionArray = data.collections;
        }

        const mappedCollections = collectionArray
          .filter((c) => c != null)
          .map((c: any) => ({
            id: c.id ?? 0,
            title: c.title ?? "",
            handle: c.handle ?? "",
            image: c.image ?? null,
          }));
        
        setCollections(mappedCollections);
      })
      .catch((err) => {
        console.error("❌ API ERROR:", err);
      });
  }, []);

  useEffect(() => {
    const param = searchParams.get("active");
    if (param && !activeCollection) {
      setActiveCollection(param);
      return;
    }

    if (!activeCollection && collections.length > 0) {
      setActiveCollection(collections[0].id);
    }
  }, [collections, searchParams, activeCollection]);

  return (
    <div className="p-3">
      <div className="flex gap-3 overflow-x-auto pb-3">
        {collections.map((c: any) => (
          <button
            key={c.id}
            onClick={() => setActiveCollection(c.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap border ${
              String(activeCollection) === String(c.id) ? "bg-primary text-white border-primary" : "bg-white text-foreground border-gray-200"
            }`}
          >
            {c.title}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="text-center text-subtitle col-span-2 py-8">Chọn danh mục để xem sản phẩm</div>
      </div>
    </div>
  );
}
