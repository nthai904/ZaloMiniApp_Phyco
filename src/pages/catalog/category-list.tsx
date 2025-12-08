import TransitionLink from "@/components/transition-link";
import { useAtomValue } from "jotai";
import { categoriesState } from "@/state";

export default function CategoryListPage() {
  const categories = useAtomValue(categoriesState);

  return (
    <div className="min-h-full bg-background pb-8">
      {/* Header */}
      <div className="bg-white px-4 py-6 border-b border-black/5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Danh mục sản phẩm</h1>
            <p className="text-sm text-subtitle mt-1">Khám phá các danh mục của chúng tôi</p>
          </div>
        </div>
        <TransitionLink
          to="/products"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primaryForeground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Xem tất cả sản phẩm
        </TransitionLink>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
        {categories.map((category) => (
          <TransitionLink
            key={category.id}
            className="group flex flex-col items-center bg-white rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-black/5"
            to={`/category/${category.id}`}
          >
            {/* Category Image */}
            <div className="relative w-full aspect-square mb-3 rounded-xl overflow-hidden bg-skeleton group-hover:scale-105 transition-transform duration-300">
              <img src={category.image} className="w-full h-full object-cover rounded-xl" alt={category.name} />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
            </div>

            {/* Category Name */}
            <div className="text-center w-full">
              <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300">{category.name}</h3>
            </div>

            <div className="mt-2 w-8 h-0.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
          </TransitionLink>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-24 h-24 rounded-full bg-section flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-subtitle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <p className="text-subtitle text-center">Chưa có danh mục nào</p>
        </div>
      )}
    </div>
  );
}
