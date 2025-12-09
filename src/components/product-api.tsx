import { useSetAtom, useAtomValue } from "jotai";
import { productsState, productDetailState, fetchProductDetailState, blogsState } from "@/api/state";

export default function ProductPage() {
  // Gọi qua state
  const products = useAtomValue(productsState);
  const productDetail = useAtomValue(productDetailState);
  const fetchDetail = useSetAtom(fetchProductDetailState);

  async function handleSelect(id: number | string) {
    await fetchDetail(id);
  }

  const blogs = useAtomValue(blogsState);
  const blogDetail = useAtomValue(fetchProductDetailState);
  const fetchBlogDetail = useSetAtom(fetchProductDetailState);

  async function handleSelectBlog(id: number | string) {
    await fetchBlogDetail(id);
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Danh sách sản phẩm</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {products.map((p: any) => (
          <div
            key={p.id}
            onClick={() => handleSelect(p.id)}
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 12,
              cursor: "pointer",
            }}
          >
            {/* Ảnh */}
            {p.images?.length > 0 ? (
              <img src={p.images[0].src ?? p.images[0].url} alt={p.title} style={{ width: "100%", borderRadius: 10 }} />
            ) : (
              <div style={{ background: "#eee", padding: 30, textAlign: "center" }}>Không có ảnh</div>
            )}

            {/* Tên */}
            <h3 style={{ fontSize: 16, marginTop: 10 }}>{p.title ?? p.name}</h3>

            {/* Vendor */}
            <p>
              <strong>Vendor:</strong> {p.vendor}
            </p>

            {/* Giá */}
            <p>
              <strong>Giá:</strong> {p.variants?.[0]?.price ?? p.price ?? 0}₫
            </p>
          </div>
        ))}
      </div>

      <hr style={{ margin: "16px 0" }} />

      <div>
        <h2>Chi tiết sản phẩm</h2>

        {productDetail && (
          <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
            <h3>{productDetail.title}</h3>

            <p>
              <strong>Type:</strong> {productDetail.product_type}
            </p>

            <p>
              <strong>Giá:</strong> {productDetail?.variants?.[0]?.price ?? productDetail?.price ?? "-"}₫
            </p>

            <div
              dangerouslySetInnerHTML={{
                __html: productDetail.body_html ?? productDetail.detail ?? "",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
