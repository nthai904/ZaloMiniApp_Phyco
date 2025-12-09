import Banners from "./banners";
import Category from "./category";
import Articles from "./articles";
import ProductList from "./product-list";
import ProductListV2 from "./product-listv2";

const HomePage: React.FunctionComponent = () => {
  return (
    <div className="min-h-full space-y-2 py-2">
      <div className="bg-sction mt-1">
        <Banners />
      </div>
      <div className="bg-section">
        <Category />
      </div>
      <ProductListV2 />
      <Articles />
    </div>
  );
};

export default HomePage;
