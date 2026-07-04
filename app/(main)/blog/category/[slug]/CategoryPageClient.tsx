"use client"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Define types
interface Post {
  _id: string
  title: string
  slug: string
  content: string
  categoryId: {
    _id: string
    name: string
    slug: string
  }
  image: string
  status: string
  viewCount: number
  createdAt: string
  publishedAt?: string
}

interface Category {
  _id: string
  name: string
  slug: string
}

// Client component that receives server-fetched data
export default function CategoryPageClient({
  category,
  posts,
  categories,
  popularPosts,
  currentPage,
  totalPages,
}: {
  category: Category
  posts: Post[]
  categories: Category[]
  popularPosts: Post[]
  currentPage: number
  totalPages: number
}) {
  // Format Persian date
  const formatPersianDate = (date: string) => {
    return new Date(date).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-[#181818] text-[rgba(255,255,255,0.69)]">
      <style jsx global>{`
        body {
          background-color: #181818;
          color: rgba(255, 255, 255, 0.69);
        }
      `}</style>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-[2px] w-[100px] bg-gradient-to-r from-transparent to-[#FFD700]"></div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#ffd700] via-white to-[#ffd700] bg-clip-text text-transparent bg-[length:200%] animate-[shimmer_3s_linear_infinite]">
            {category.name}
          </h1>
          <div className="h-[2px] w-[100px] bg-gradient-to-l from-transparent to-[#FFD700]"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post: Post) => (
                  <div
                    key={post._id}
                    className="border border-[rgba(255,215,0,0.1)] bg-[rgba(26,26,26,0.8)] backdrop-blur-md rounded-lg shadow-md overflow-hidden transition-all duration-400 hover:transform hover:-translate-y-2 hover:border-[rgba(255,215,0,0.3)] hover:shadow-[0_6px_30px_rgba(255,215,0,0.15)]"
                  >
                    <Link href={`/blog/${post.slug}`}>
                      <div className="relative h-48 w-full">
                        <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link href={`/blog/category/${post.categoryId.slug}`}>
                        <span className="text-sm text-[#ffd700] mb-2 inline-block">{post.categoryId.name}</span>
                      </Link>
                      <Link href={`/blog/${post.slug}`}>
                        <h2 className="text-xl font-bold mb-2 hover:text-[#ffd700] transition-colors">{post.title}</h2>
                      </Link>
                      <div className="text-sm text-gray-500 mb-3">
                        {formatPersianDate(post.publishedAt || post.createdAt)}
                      </div>
                      <div
                        className="text-[rgba(255,255,255,0.69)] line-clamp-3"
                        dangerouslySetInnerHTML={{
                          __html: post.content.replace(/<[^>]*>/g, " ").substring(0, 150) + "...",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-[rgba(255,215,0,0.1)] bg-[rgba(26,26,26,0.8)] backdrop-blur-md rounded-lg shadow-md p-8 text-center">
                <p className="text-xl">هیچ مقاله‌ای در این دسته‌بندی یافت نشد.</p>
                <Link href="/blog" className="mt-4 inline-block text-[#ffd700] hover:underline">
                  بازگشت به صفحه اصلی وبلاگ
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-1">
                  <div>
                    <Link
                      href={currentPage > 1 ? `/blog/category/${category.slug}?page=${currentPage - 1}` : "#"}
                      className={`flex h-10 px-4 items-center justify-center rounded-md bg-[rgba(26,26,26,0.8)] text-[rgba(255,255,255,0.69)] hover:bg-[rgba(255,215,0,0.2)] hover:text-[#ffd700] ${
                        currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                      }`}
                      aria-label="صفحه قبلی"
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">صفحه قبلی</span>
                    </Link>
                  </div>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <div key={i}>
                      <Link
                        href={`/blog/category/${category.slug}?page=${i + 1}`}
                        className={`flex h-10 w-10 items-center justify-center rounded-md ${
                          currentPage === i + 1
                            ? "bg-[#ffd700] text-[#212121] font-medium"
                            : "bg-[rgba(26,26,26,0.8)] text-[rgba(255,255,255,0.69)] hover:bg-[rgba(255,215,0,0.2)] hover:text-[#ffd700]"
                        }`}
                        aria-label={`صفحه ${i + 1}`}
                        aria-current={currentPage === i + 1 ? "page" : undefined}
                      >
                        {i + 1}
                      </Link>
                    </div>
                  ))}

                  <div>
                    <Link
                      href={currentPage < totalPages ? `/blog/category/${category.slug}?page=${currentPage + 1}` : "#"}
                      className={`flex h-10 px-4 items-center justify-center rounded-md bg-[rgba(26,26,26,0.8)] text-[rgba(255,255,255,0.69)] hover:bg-[rgba(255,215,0,0.2)] hover:text-[#ffd700] ${
                        currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
                      }`}
                      aria-label="صفحه بعدی"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">صفحه بعدی</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="border border-[rgba(255,215,0,0.1)] bg-[rgba(26,26,26,0.8)] backdrop-blur-md rounded-lg shadow-md p-4 mb-6 sticky top-20">
              <h3 className="text-lg font-bold mb-4 border-b border-[rgba(255,215,0,0.1)] pb-2 text-[#ffd700]">
                دسته‌بندی‌ها
              </h3>
              <ul className="space-y-2">
                {categories.map((cat: Category) => (
                  <li key={cat._id}>
                    <Link
                      href={`/blog/category/${cat.slug}`}
                      className={`text-[rgba(255,255,255,0.69)] hover:text-[#ffd700] transition-colors ${
                        cat._id === category._id ? "text-[#ffd700] font-medium" : ""
                      }`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-[rgba(255,215,0,0.1)] bg-[rgba(26,26,26,0.8)] backdrop-blur-md rounded-lg shadow-md p-4">
              <h3 className="text-lg font-bold mb-4 border-b border-[rgba(255,215,0,0.1)] pb-2 text-[#ffd700]">
                محبوب‌ترین مقالات
              </h3>
              <ul className="space-y-4">
                {popularPosts.map((post: Post) => (
                  <li key={post._id} className="flex items-start space-x-2 space-x-reverse">
                    <Link href={`/blog/${post.slug}`} className="flex-shrink-0 ml-2">
                      <div className="relative h-16 w-16">
                        <Image
                          src={post.image || "/placeholder.svg"}
                          alt={post.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    </Link>
                    <div>
                      <Link href={`/blog/${post.slug}`}>
                        <h4 className="font-medium hover:text-[#ffd700] transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                      </Link>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatPersianDate(post.publishedAt || post.createdAt)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
