"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const router = useRouter();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication: just redirect
    router.push("/analytics");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#ECECEC]">
      <main className="flex w-full max-w-6xl flex-col items-center justify-center px-8 py-32">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-extrabold text-[#8F4444] mb-6">
            Nola Analytics
          </h1>
          <p className="text-2xl text-[#8F4444]/80 max-w-3xl mx-auto leading-relaxed">
            Plataforma de analytics customizável para restaurantes.
            <br />
            Explore seus dados e obtenha insights acionáveis sem complicação.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-16">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl border-2 border-[#ECECEC] p-10 shadow-lg hover:shadow-xl hover:border-[#FD6263] transition-all duration-300">
            <div className="flex flex-col gap-6">
              <div className="flex justify-center">
                <div className="text-5xl p-4 bg-[#ECECEC] rounded-2xl">📊</div>
              </div>
              <h2 className="text-2xl font-bold text-[#8F4444] text-center">
                Análise Flexível
              </h2>
              <p className="text-[#8F4444]/70 text-center leading-relaxed">
                Explore 500k+ vendas com filtros personalizados e visualizações
                intuitivas
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl border-2 border-[#ECECEC] p-10 shadow-lg hover:shadow-xl hover:border-[#FD6263] transition-all duration-300">
            <div className="flex flex-col gap-6">
              <div className="flex justify-center">
                <div className="text-5xl p-4 bg-[#ECECEC] rounded-2xl">🎯</div>
              </div>
              <h2 className="text-2xl font-bold text-[#8F4444] text-center">
                Insights Instantâneos
              </h2>
              <p className="text-[#8F4444]/70 text-center leading-relaxed">
                Responda perguntas complexas em segundos, sem conhecimento
                técnico
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl border-2 border-[#ECECEC] p-10 shadow-lg hover:shadow-xl hover:border-[#FD6263] transition-all duration-300">
            <div className="flex flex-col gap-6">
              <div className="flex justify-center">
                <div className="text-5xl p-4 bg-[#ECECEC] rounded-2xl">📈</div>
              </div>
              <h2 className="text-2xl font-bold text-[#8F4444] text-center">
                Métricas do Negócio
              </h2>
              <p className="text-[#8F4444]/70 text-center leading-relaxed">
                Acompanhe faturamento, ticket médio, produtos mais vendidos e
                mais
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-3xl border-2 border-[#ECECEC] p-10 shadow-lg hover:shadow-xl hover:border-[#FD6263] transition-all duration-300">
            <div className="flex flex-col gap-6">
              <div className="flex justify-center">
                <div className="text-5xl p-4 bg-[#ECECEC] rounded-2xl">🍔</div>
              </div>
              <h2 className="text-2xl font-bold text-[#8F4444] text-center">
                Feito para Restaurantes
              </h2>
              <p className="text-[#8F4444]/70 text-center leading-relaxed">
                Métricas específicas: delivery, customizações, canais e muito
                mais
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button / Login Form */}
        {!showLogin ? (
          <button
            onClick={() => setShowLogin(true)}
            className="inline-flex items-center justify-center px-12 py-5 bg-[#FD6263] text-white rounded-2xl font-bold text-xl hover:bg-[#8F4444] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Acessar Dashboard →
          </button>
        ) : (
          <div className="w-full max-w-md bg-white p-10 rounded-3xl border-2 border-[#ECECEC] shadow-2xl">
            <h2 className="text-3xl font-bold text-[#8F4444] text-center mb-8">
              Acessar Plataforma
            </h2>
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#8F4444]/80 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  defaultValue="admin@nola.com"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#ECECEC] focus:outline-none focus:ring-2 focus:ring-[#FD6263] transition"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#8F4444]/80 mb-2"
                >
                  Senha
                </label>
                <input
                  type="password"
                  id="password"
                  defaultValue="admin"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#ECECEC] focus:outline-none focus:ring-2 focus:ring-[#FD6263] transition"
                />
              </div>
              <button
                type="submit"
                className="w-full px-8 py-4 bg-[#FD6263] text-white rounded-xl font-bold text-lg hover:bg-[#8F4444] transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Entrar
              </button>
            </form>
          </div>
        )}

        {/* Footer Text */}
        <p className="text-sm text-[#8F4444]/60 mt-10 font-medium">
          Dados gerados de 6 meses de operação • 50 lojas • 10k clientes
        </p>
      </main>
    </div>
  );
}
