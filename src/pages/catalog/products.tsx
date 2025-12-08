import ProductGrid from "@/components/product-grid";
import ProductHeader from "@/components/product-header";
import ProductFilterBar from "@/components/product-filter-bar";
import ProductSortBar, { SortOption } from "@/components/product-sort-bar";
import { useAtomValue } from "jotai";
import { productsState, categoriesState } from "@/state";
import { Suspense, useState, useMemo } from "react";
import { ProductGridSkeleton } from "../search";
import EmptyProductList from "@/components/empty-product-list";

function ProductList() {
  const allProducts = useAtomValue(productsState);
  const categories = useAtomValue(categoriesState);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("default");

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (selectedCategory === null) {
      return allProducts;
    }
    return allProducts.filter((product) => {
      if (!product.category) {
        return false;
      }
      return product.category.id === selectedCategory;
    });
  }, [allProducts, selectedCategory]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const products = [...filteredProducts];
    switch (sortOption) {
      case "price-asc":
        return products.sort((a, b) => a.price - b.price);
      case "price-desc":
        return products.sort((a, b) => b.price - a.price);
      case "name-asc":
        return products.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return products;
    }
  }, [filteredProducts, sortOption]);

  const handleResetFilter = () => {
    setSelectedCategory(null);
    setSortOption("default");
  };

  return (
    <div className="min-h-full bg-background">
      <ProductHeader title="Tất cả sản phẩm" productCount={sortedProducts.length}>
        <ProductFilterBar categories={categories} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
      </ProductHeader>

      <ProductSortBar selectedCategory={selectedCategory} categories={categories} sortOption={sortOption} onSortChange={setSortOption} />

      {sortedProducts.length > 0 ? (
        <div className="pb-8">
          <ProductGrid products={sortedProducts} className="pt-4" />
        </div>
      ) : (
        <EmptyProductList selectedCategory={selectedCategory} categories={categories} onResetFilter={handleResetFilter} />
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="h-full flex flex-col bg-section">
      <div className="flex-1 overflow-y-auto">
        <Suspense fallback={<ProductGridSkeleton className="pt-4" />}>
          <ProductList />
        </Suspense>
      </div>
    </div>
  );
}
