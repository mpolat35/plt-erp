"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Zap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Demo: herhangi bir email/şifre ile giriş yapılabilir
    await new Promise((r) => setTimeout(r, 1000));

    if (!email || !password) {
      setError("Lütfen tüm alanları doldurun.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sol Panel - Marka */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-violet-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Dekoratif daireler */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-violet-500/20 rounded-full -translate-x-1/2 -translate-y-1/2" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-md flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-xl tracking-tight">AdminPanel</span>
        </div>

        {/* Orta İçerik */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white leading-tight">
              İşletmenizi tek<br />
              <span className="text-blue-200">yerden yönetin.</span>
            </h1>
            <p className="text-blue-100/80 text-lg leading-relaxed max-w-sm">
              Fatura, PDKS, stok, abone yönetimi ve daha fazlası — birbirine bağlı, modüler yapıda.
            </p>
          </div>

          {/* Özellik etiketleri */}
          <div className="flex flex-wrap gap-2">
            {["Fatura", "PDKS", "Stok Sayım", "Abone Yönetimi"].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white/90 text-sm rounded-full border border-white/10"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Alt */}
        <div className="relative z-10 text-blue-200/60 text-sm">
          © 2025 AdminPanel. Tüm hakları saklıdır.
        </div>
      </div>

      {/* Sağ Panel - Login Formu */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobil Logo */}
          <div className="flex lg:hidden items-center gap-3 justify-center mb-2">
            <div className="w-9 h-9 bg-blue-600 rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-800 font-semibold text-xl">AdminPanel</span>
          </div>

          {/* Başlık */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-800">Hoş geldiniz</h2>
            <p className="text-slate-500 text-sm">Hesabınıza giriş yapın</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">E-posta</label>
              <input
                type="email"
                placeholder="ornek@sirket.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Şifre</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                />
                <span className="text-sm text-slate-600">Beni hatırla</span>
              </label>
              <button type="button" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                Şifremi unuttum
              </button>
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-md text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-all text-sm disabled:opacity-70 disabled:cursor-not-allowed shadow-sm shadow-blue-600/20 hover:shadow-blue-600/30"
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>

          {/* Demo notu */}
          <p className="text-center text-xs text-slate-400">
            Demo: herhangi bir e-posta ve şifre ile giriş yapabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
