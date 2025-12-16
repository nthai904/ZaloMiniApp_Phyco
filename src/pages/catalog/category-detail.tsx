import { productsByCollectionState } from "@/api/state";
import { useAtomValue } from "jotai";
import { useParams } from "react-router-dom";

export default function CategoryDetailPage() {
  const { id } = useParams();

  const products = useAtomValue(productsByCollectionState(id!));

  if (!id) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 12,
        marginTop: 16,
      }}
    >
      {products.map((p: any) => (
        <div
          key={`product-${p.id}`}
          style={{
            border: "1px solid #eee",
            borderRadius: 8,
            padding: 10,
          }}
        >
          <img src={p.image?.src} alt={p.title} style={{ width: "100%", borderRadius: 6 }} />
          <h4>{p.title}</h4>
        </div>
      ))}
    </div>
  );
}
