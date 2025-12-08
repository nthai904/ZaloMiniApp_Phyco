import React from "react";

interface ProductHeaderProps {
  title: string;
  productCount: number;
  children?: React.ReactNode;
}

export default function ProductHeader({ title, productCount, children }: ProductHeaderProps) {
  return (
    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-4 py-6 border-b border-black/5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-subtitle mt-1">
            {productCount} {productCount === 1 ? "sản phẩm" : "sản phẩm"}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}
