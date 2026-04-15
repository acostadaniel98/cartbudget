'use client';

import React, { useEffect } from 'react';
import {
  AddProductForm,
  BudgetCard,
  ProductList,
  TotalCard,
  ServiceWorkerClient,
} from '@/presentation/components';
import { useCartBudgetStore } from '@/presentation/store/useCartBudgetStore';

export default function Home() {
  const { products, total, isExceeded, isNearLimit, initializeStore } =
    useCartBudgetStore();

  // Initialize store on mount
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  return (
    <div className="flex-1 flex flex-col h-full">
      <ServiceWorkerClient />

      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-lg mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            <span className="text-green-600">Cart</span>Budget
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Calculadora de compras inteligente
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 py-6 pb-40 space-y-6">
        {/* Budget Section */}
        <section>
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
            Tu presupuesto
          </h2>
          <BudgetCard />
        </section>

        {/* Add Product Form */}
        <section>
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
            Agregar producto
          </h2>
          <AddProductForm />
        </section>

        {/* Products List */}
        <section className="flex-1">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
            Tu carrito ({products.length})
          </h2>
          <ProductList products={products} />
        </section>
      </main>

      {/* Sticky Total Card */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-4">
          <TotalCard
            total={total}
            isExceeded={isExceeded}
            isNearLimit={isNearLimit}
          />
        </div>
      </div>
    </div>
  );
}
