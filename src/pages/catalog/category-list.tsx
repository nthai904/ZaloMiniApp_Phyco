import { collectionsState } from "@/api/state";
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";

export default function CategoryListPage() {
  const collections = useAtomValue(collectionsState);
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {collections.map((c: any) => (
        <button
          key={c.id}
          onClick={() => navigate(`/category/${c.id}`)}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #ddd",
          }}
        >
          {c.title}
        </button>
      ))}
    </div>
  );
}
