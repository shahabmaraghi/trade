"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  CheckCircle2,
  Loader2,
  Save,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

type AiProvider = "chatgpt" | "gapgpt";

const providers: {
  id: AiProvider;
  title: string;
  description: string;
}[] = [
  {
    id: "chatgpt",
    title: "ChatGPT",
    description: "استفاده از سرویس ChatGPT برای پاسخ‌های هوش مصنوعی",
  },
  {
    id: "gapgpt",
    title: "GapGPT",
    description: "استفاده از سرویس GapGPT برای پاسخ‌های هوش مصنوعی",
  },
];

export default function AiSettingsPage() {
  const [activeProvider, setActiveProvider] = useState<AiProvider>("chatgpt");
  const [initialProvider, setInitialProvider] = useState<AiProvider>("chatgpt");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const hasChanged = activeProvider !== initialProvider;

  useEffect(() => {
    const fetchAiProvider = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const res = await fetch("/api/admin/ai-provider", {
          method: "GET",
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "خطا در دریافت تنظیمات هوش مصنوعی");
        }

        if (data.activeProvider === "chatgpt" || data.activeProvider === "gapgpt") {
          setActiveProvider(data.activeProvider);
          setInitialProvider(data.activeProvider);
        }
      } catch (error) {
        console.error("Fetch AI Provider Error:", error);
        setErrorMessage("تنظیمات هوش مصنوعی دریافت نشد.");
      } finally {
        setLoading(false);
      }
    };

    fetchAiProvider();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccessMessage("");
      setErrorMessage("");

      const res = await fetch("/api/admin/ai-provider", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activeProvider,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "خطا در ذخیره تنظیمات");
      }

      setInitialProvider(activeProvider);
      setSuccessMessage("سرویس هوش مصنوعی با موفقیت ذخیره شد.");
    } catch (error) {
      console.error("Save AI Provider Error:", error);
      setErrorMessage("ذخیره تنظیمات انجام نشد.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div dir="rtl" className="flex min-h-[300px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 size={18} className="animate-spin" />
          <span>در حال دریافت تنظیمات...</span>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <Bot size={18} />
              <span>داشبورد / هوش مصنوعی</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              تنظیمات هوش مصنوعی
            </h1>

            <p className="mt-2 text-sm leading-7 text-gray-500">
              از این بخش می‌توانید مشخص کنید پاسخ‌های هوش مصنوعی سایت از کدام
              سرویس دریافت شود.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-xl bg-[#efeadc] px-4 py-3 text-sm font-medium text-[#8a6d1d]">
            <ShieldCheck size={18} />
            <span>
              سرویس فعال:{" "}
              {activeProvider === "chatgpt" ? "ChatGPT" : "GapGPT"}
            </span>
          </div>
        </div>
      </div>

      {(successMessage || errorMessage) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            successMessage
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {successMessage || errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {providers.map((provider) => {
          const isActive = activeProvider === provider.id;

          return (
            <button
              key={provider.id}
              type="button"
              onClick={() => {
                setActiveProvider(provider.id);
                setSuccessMessage("");
                setErrorMessage("");
              }}
              className={`group rounded-2xl border p-6 text-right transition-all ${
                isActive
                  ? "border-[#b89b2d] bg-[#fbf8ee] shadow-sm"
                  : "border-gray-200 bg-white hover:border-[#c7b56d]"
              }`}
            >
              <div className="mb-5 flex items-center justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${
                    isActive
                      ? "bg-[#e8dfc3] text-[#8a6d1d]"
                      : "bg-gray-100 text-gray-500 group-hover:bg-[#f3eedf]"
                  }`}
                >
                  <Sparkles size={23} />
                </div>

                {isActive && (
                  <div className="flex items-center gap-1 rounded-full bg-[#e8dfc3] px-3 py-1 text-xs font-medium text-[#8a6d1d]">
                    <CheckCircle2 size={15} />
                    <span>فعال</span>
                  </div>
                )}
              </div>

              <h2 className="text-lg font-bold text-gray-900">
                {provider.title}
              </h2>

              <p className="mt-2 text-sm leading-7 text-gray-500">
                {provider.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              ذخیره سرویس انتخاب‌شده
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              بعد از ذخیره، تمام درخواست‌های هوش مصنوعی سایت از سرویس انتخاب‌شده
              ارسال می‌شود.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasChanged}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#b89b2d] px-6 text-sm font-bold text-white transition hover:bg-[#9f8426] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}

            {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>
        </div>
      </div>
    </div>
  );
}