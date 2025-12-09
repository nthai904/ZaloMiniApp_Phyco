// Route lấy ra danh sách sản phẩm
export async function fetchProductsList() {
  const url = `/api/product`;
  const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Kết nối thất bại ${res.status} ${res.statusText} - ${text.slice(0, 200)}`);
  }
  const data = await res.json().catch((err) => {
    throw new Error(`Không kết nối được api - ${err.message}`);
  });

  return data?.products ?? data;
}

// Route lấy ra chi tiết sản phẩm theo id
export async function fetchProductDetail(id: number | string) {
  const url = `/api/product/${id}`;
  const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Kết nối thất bại ${res.status} ${res.statusText} - ${text.slice(0, 200)}`);
  }

  const data = await res.json().catch((err) => {
    throw new Error(`Không kết nối được api - ${err.message}`);
  });

  return data?.product ?? data;
}

// Route lấy ra danh sách bài viết
export async function fetchBLogList() {
  const url = `/api/blog`;
  const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Kết nối thất bại ${res.status} ${res.statusText} - ${text.slice(0, 200)}`);
  }
  const data = await res.json().catch((err) => {
    throw new Error(`Không kết nối được api - ${err.message}`);
  });

  return data?.blogs ?? data;
}

// Route lấy ra chi tiết bài viết
export async function fetchBlogDetail(id: number | string) {
  const url = `/api/blog/${id}`;
  const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Kết nối thất bại ${res.status} ${res.statusText} - ${text.slice(0, 200)}`);
  }

  const data = await res.json().catch((err) => {
    throw new Error(`Không kết nối được api - ${err.message}`);
  });

  return data?.product ?? data;
}
