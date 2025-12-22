import { defineConfig } from "vite";
import zaloMiniApp from "zmp-vite-plugin";
import react from "@vitejs/plugin-react";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

export default () => {
  return defineConfig({
    root: "./src",
    base: "",
    plugins: [zaloMiniApp(), react()],
    server: {
      proxy: {
        // Cấu hình API danh sách sản phẩm và chi tiết sản phẩm
        "/api/product": {
          target: `${process.env.API_URL}`,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => {
            const m = path.match(/^\/api\/product\/?(\d+)(?:\.json)?$/);
            if (m && m[1]) {
              return `/com/products/${m[1]}.json`;
            }
            return path.replace(/^\/api\/product/, "/com/products.json");
          },
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq: any, req: any, res: any) => {
              try {
                proxyReq.setHeader("Authorization", `Bearer ${process.env.API_TOKEN}`);
                proxyReq.setHeader("Content-Type", "application/json");
              } catch (e) {
                console.error("Lỗi cấu hình proxyy:", e);
              }
            });
          },
        },

        // Cấu hình API danh sách bài viết và chi tiết bài viết
        "/api/blog": {
          target: `${process.env.API_URL}`,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => {
            // Support: /api/blog -> /web/blogs.json
            if (/^\/api\/blog(?:\/?$|\.json$)/.test(path)) {
              return path.replace(/^\/api\/blog/, "/web/blogs.json");
            }

            // Support: /api/blog/{id}/count -> /web/blogs/{id}/articles/count.json
            const mCount = path.match(/^\/api\/blog\/(\d+)\/count(?:\.json)?$/);
            if (mCount && mCount[1]) {
              return `/web/blogs/${mCount[1]}/articles/count.json`;
            }

            // Support: /api/blog/{id} -> /web/blogs/{id}/articles.json
            const m = path.match(/^\/api\/blog\/(\d+)(?:\.json)?$/);
            if (m && m[1]) {
              return `/web/blogs/${m[1]}/articles.json`;
            }

            // Fallback
            return path.replace(/^\/api\/blog/, "/web/blogs.json");
          },
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq: any, req: any, res: any) => {
              try {
                if (process.env.API_TOKEN) {
                  proxyReq.setHeader("Authorization", `Bearer ${process.env.API_TOKEN}`);
                }
                proxyReq.setHeader("Content-Type", "application/json");
              } catch (e) {
                console.error("Lỗi cấu hình proxy:", e);
              }
            });
          },
        },
        "/api/collection": {
          target: `${process.env.API_URL}`,
          changeOrigin: true,
          secure: true,
          rewrite: () => "/com/custom_collections.json",
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq: any) => {
              proxyReq.setHeader("Authorization", `Bearer ${process.env.API_TOKEN}`);
              proxyReq.setHeader("Content-Type", "application/json");
            });
          },
        },

        "/api/collect": {
          target: `${process.env.API_URL}`,
          changeOrigin: true,
          secure: true,
          rewrite: () => "/com/collects.json",
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq: any) => {
              proxyReq.setHeader("Authorization", `Bearer ${process.env.API_TOKEN}`);
              proxyReq.setHeader("Content-Type", "application/json");
            });
          },
        },
        "/api/provinces": {
          target: "https://provinces.open-api.vn",
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/provinces/, "/api/v1"),
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  });
};
