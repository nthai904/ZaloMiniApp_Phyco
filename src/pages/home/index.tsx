import Banners from "./banners";
import Category from "./category";
import Articles from "./articles";
import ProductList from "./product-list";
import ProductListV2 from "./product-list";
import Section from "@/components/section";
import TransitionLink from "@/components/transition-link";
import PaginatedProductGrid from "@/components/paginated-product-grid";

const HomePage: React.FunctionComponent = () => {
  return (
    <div className="min-h-full space-y-2 py-2">
      <div className="bg-sction mt-1">
        <Banners />
      </div>
      <div className="bg-section">
        <Category />
      </div>

      <Section
        title={
          <div className="flex items-center justify-between w-full">
            <span>Danh sách sản phẩm</span>
            <TransitionLink to="/products" className="text-xs text-primary font-medium hover:underline">
              Xem tất cả →
            </TransitionLink>
          </div>
        }
      >
        <PaginatedProductGrid perPage={10} />
      </Section>

      <Articles />
    </div>
  );
};

export default HomePage;
