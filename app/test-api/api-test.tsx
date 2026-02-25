"use client";

import { useState } from "react";
import apiClient from "@/lib/api";

export default function ApiTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Testing API at:", process.env.NEXT_PUBLIC_API_BASE_URL);
      
      const response = await apiClient.get("/health");
      setResult(response);
      console.log("Success:", response);
    } catch (err: any) {
      console.error("Error:", err);
      setError({
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config,
        url: err.config?.url
      });
    } finally {
      setLoading(false);
    }
  };

  const testRegister = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.post("/auth/register", {
        name: "Test User",
        email: "test@example.com",
        password: "Test@123"
      });
      setResult(response);
      console.log("Register Success:", response);
    } catch (err: any) {
      console.error("Register Error:", err);
      setError({
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">API Connectivity Test</h1>
      
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <p><strong>API Base URL:</strong></p>
        <p className="text-sm text-gray-700">{process.env.NEXT_PUBLIC_API_BASE_URL}</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={testConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Testing..." : "Test Health Endpoint"}
        </button>

        <button
          onClick={testRegister}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 ml-4"
        >
          {loading ? "Testing..." : "Test Register"}
        </button>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="text-lg font-bold text-red-700 mb-2">Error</h2>
          <pre className="text-xs bg-white p-3 rounded overflow-auto max-h-64">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
          <h2 className="text-lg font-bold text-green-700 mb-2">Success</h2>
          <pre className="text-xs bg-white p-3 rounded overflow-auto max-h-64">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
