"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Linkedin, Calendar, Eye } from "lucide-react"

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
  author?: {
    _id: string
    name: string
    email: string
  }
}

interface Category {
  _id: string
  name: string
  slug: string
}

// Client component that receives server-fetched data
export default function BlogPostClientPage({
  post,
  relatedPosts,
  recentPosts,
  categories,
}: {
  post: Post
  relatedPosts: Post[]
  recentPosts: Post[]
  categories: Category[]
}) {
  // Format Persian date
  const formatPersianDate = (date: string) => {
    return new Date(date).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Share post function
  const sharePost = (platform: string) => {
    const url = encodeURIComponent(`https://hirmandtrade.ir/blog/${post.slug}`)
    const title = encodeURIComponent(post.title)

    let shareUrl = ""

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`
        break
      default:
        return
    }

    window.open(shareUrl, "_blank", "width=600,height=400")
  }

  return (
    <div className="min-h-screen bg-[#181818] text-[rgba(255,255,255,0.69)]">
      <style jsx global>{`
        body {
          background-color: #181818;
          color: rgba(255, 255, 255, 0.69);
        }
        
        .blog-content h1, .blog-content h2, .blog-content h3, .blog-content h4, .blog-content h5, .blog-content h6 {
          color: #ffd700;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          font-weight: 700;
        }
        
        .blog-content h1 {
          font-size: 2rem;
        }
        
        .blog-content h2 {
          font-size: 1.75rem;
        }
        
        .blog-content h3 {
          font-size: 1.5rem;
        }
        
        .blog-content p {
          margin-bottom: 1.25em;
          line-height: 1.8;
        }
        
        .blog-content a {
          color: #ffd700;
          text-decoration: underline;
        }
        
        .blog-content ul, .blog-content ol {
          margin-bottom: 1.25em;
          padding-right: 1.5em;
        }
        
        .blog-content li {
          margin-bottom: 0.5em;
        }
        
        .blog-content blockquote {
          border-right: 4px solid #ffd700;
          padding: 0.5em 1em;
          margin: 1.5em 0;
          background: rgba(255, 215, 0, 0.05);
        }
        
        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
          margin: 1.5em 0;
        }
        
        .blog-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5em 0;
        }
        
        .blog-content th, .blog-content td {
          border: 1px solid rgba(255, 215, 0, 0.2);
          padding: 0.5em;
        }
        
        .blog-content th {
          background: rgba(255, 215, 0, 0.1);
        }
      `}</style>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <article className="border border-[rgba(255,215,0,0.1)] bg-[rgba(26,26,26,0.8)] backdrop-blur-md rounded-lg shadow-md overflow-hidden">
              {/* Featured Image */}
              <div className="relative h-64 md:h-96 w-full">
                <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" priority />
              </div>

              <div className="p-6">
                {/* Category */}
                <Link href={`/blog/category/${post.categoryId.slug}`}>
                  <span className="text-sm text-[#ffd700] mb-2 inline-block">{post.categoryId.name}</span>
                </Link>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">{post.title}</h1>

                {/* Meta information */}
                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-400">
                  {post.author && (
                    <div className="flex items-center">
                      <span className="ml-1">نویسنده:</span>
                      <span>{post.author.name}</span>
                    </div>
                  )}

                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 ml-1" />
                    <span>{formatPersianDate(post.publishedAt || post.createdAt)}</span>
                  </div>

                  <div className="flex items-center">
                    <Eye className="h-4 w-4 ml-1" />
                    <span>{post.viewCount.toLocaleString("fa-IR")} بازدید</span>
                  </div>
                </div>

                {/* Social sharing */}
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-sm">اشتراک‌گذاری:</span>
                  <button
                    onClick={() => sharePost("facebook")}
                    className="p-2 rounded-full bg-[rgba(255,215,0,0.1)] text-[#ffd700] hover:bg-[rgba(255,215,0,0.2)] transition-colors"
                    aria-label="اشتراک‌گذاری در فیسبوک"
                  >
                    <Facebook className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => sharePost("twitter")}
                    className="p-2 rounded-full bg-[rgba(255,215,0,0.1)] text-[#ffd700] hover:bg-[rgba(255,215,0,0.2)] transition-colors"
                    aria-label="اشتراک‌گذاری در توییتر"
                  >
                    <Twitter className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => sharePost("linkedin")}
                    className="p-2 rounded-full bg-[rgba(255,215,0,0.1)] text-[#ffd700] hover:bg-[rgba(255,215,0,0.2)] transition-colors"
                    aria-label="اشتراک‌گذاری در لینکدین"
                  >
                    <Linkedin className="h-4 w-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4 text-[#ffd700]">مقالات مرتبط</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <div
                      key={relatedPost._id}
                      className="border border-[rgba(255,215,0,0.1)] bg-[rgba(26,26,26,0.8)] backdrop-blur-md rounded-lg shadow-md overflow-hidden transition-all duration-400 hover:transform hover:-translate-y-2 hover:border-[rgba(255,215,0,0.3)] hover:shadow-[0_6px_30px_rgba(255,215,0,0.15)]"
                    >
                      <Link href={`/blog/${relatedPost.slug}`}>
                        <div className="relative h-36 w-full">
                          <Image
                            src={relatedPost.image || "/placeholder.svg"}
                            alt={relatedPost.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </Link>
                      <div className="p-4">
                        <Link href={`/blog/category/${relatedPost.categoryId.slug}`}>
                          <span className="text-sm text-[#ffd700] mb-2 inline-block">
                            {relatedPost.categoryId.name}
                          </span>
                        </Link>
                        <Link href={`/blog/${relatedPost.slug}`}>
                          <h3 className="text-lg font-bold mb-2 hover:text-[#ffd700] transition-colors line-clamp-2">
                            {relatedPost.title}
                          </h3>
                        </Link>
                        <div className="text-xs text-gray-500">
                          {formatPersianDate(relatedPost.publishedAt || relatedPost.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            {/* Categories Sidebar */}
            <div className="border border-[rgba(255,215,0,0.1)] bg-[rgba(26,26,26,0.8)] backdrop-blur-md rounded-lg shadow-md p-4 mb-6 sticky top-20 z-50">
              <h3 className="text-lg font-bold mb-4 border-b border-[rgba(255,215,0,0.1)] pb-2 text-[#ffd700]">
                دسته‌بندی‌ها
              </h3>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category._id}>
                    <Link
                      href={`/blog/category/${category.slug}`}
                      className="text-[rgba(255,255,255,0.69)] hover:text-[#ffd700] transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent Posts Sidebar */}
            <div className="border border-[rgba(255,215,0,0.1)] bg-[rgba(26,26,26,0.8)] backdrop-blur-md rounded-lg shadow-md p-4">
              <h3 className="text-lg font-bold mb-4 border-b border-[rgba(255,215,0,0.1)] pb-2 text-[#ffd700]">
                آخرین مقالات
              </h3>
              <ul className="space-y-4">
                {recentPosts.map((recentPost) => (
                  <li key={recentPost._id} className="flex items-start space-x-2 space-x-reverse">
                    <Link href={`/blog/${recentPost.slug}`} className="flex-shrink-0 ml-2">
                      <div className="relative h-16 w-16">
                        <Image
                          src={recentPost.image || "/placeholder.svg"}
                          alt={recentPost.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    </Link>
                    <div>
                      <Link href={`/blog/${recentPost.slug}`}>
                        <h4 className="font-medium hover:text-[#ffd700] transition-colors line-clamp-2">
                          {recentPost.title}
                        </h4>
                      </Link>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatPersianDate(recentPost.publishedAt || recentPost.createdAt)}
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
