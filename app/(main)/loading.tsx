export default function Loading() {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="w-16 h-16 border-t-transparent border-solid rounded-full animate-spin border-blue-500 border-8"></div>
        <div className="text-blue-500 text-lg font-semibold">در حال بارگذاری...</div>
      </div>
    </div>
  )
}
