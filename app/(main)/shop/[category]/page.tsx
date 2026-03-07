"use client";

import React from "react";
import { useParams } from "next/navigation";

function CategoryPage() {
  const params = useParams();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Category: {params.category}</h1>
        <p className="text-gray-600">Category page content coming soon.</p>
      </div>
    </div>
  );
}

export default CategoryPage;
