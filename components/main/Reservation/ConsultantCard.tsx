"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/main/ui/button"
import { Star, Users, Calendar, Clock } from "lucide-react"

interface ConsultantCardProps {
  consultant: any
  selected: boolean
  onSelect: () => void
  type: "online" | "offline"
}

export default function ConsultantCard({ consultant, selected, onSelect, type }: ConsultantCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Count available days
  const availableDays = consultant.schedule ? Object.keys(consultant.schedule).length : 0

  return (
    <div
      className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
        selected
          ? "ring-2 ring-amber-500 bg-gradient-to-b from-[#1d1d1d] to-[#252525]"
          : "bg-[#1d1d1d] hover:bg-[#252525] border border-gray-800 hover:border-gray-700"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {selected && (
        <div className="absolute top-0 right-0 bg-amber-500 text-black font-medium py-1 px-3 text-xs rounded-bl-lg z-10">
          انتخاب شده
        </div>
      )}

      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={consultant.image || "/placeholder.svg?height=200&width=400&query=consultant"}
          alt={consultant.name}
          fill
          className={`object-cover transition-transform duration-500 ${isHovered ? "scale-110" : "scale-100"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1d] to-transparent"></div>

        <div className="absolute bottom-3 left-3 bg-amber-500 text-black font-medium py-1 px-2 rounded-md text-xs flex items-center">
          <Star className="h-3 w-3 ml-1 fill-black" />
          {consultant.rating} {/* ({consultant.reviewCount}) */}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-white mb-1">{consultant.name}</h3>
        <p className="text-amber-400 text-sm mb-2">{consultant.specialty}</p>
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{consultant.bio}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          <div className="bg-[#252525] text-xs text-gray-300 py-1 px-2 rounded-md flex items-center">
            <Calendar className="h-3 w-3 mr-1 text-amber-400" />
            {availableDays} روز فعال
          </div>

          {type === "offline" && consultant.offlineAvailable && (
            <div className="bg-[#252525] text-xs text-gray-300 py-1 px-2 rounded-md flex items-center">
              <Users className="h-3 w-3 mr-1 text-amber-400" />
              مشاوره حضوری
            </div>
          )}

          {Object.keys(consultant.schedule || {}).includes("پنجشنبه") && (
            <div className="bg-[#252525] text-xs text-gray-300 py-1 px-2 rounded-md flex items-center">
              <Clock className="h-3 w-3 mr-1 text-amber-400" />
              پنجشنبه‌ها فعال
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs text-amber-400">{consultant.rating}</span>
            {/* <span className="text-xs text-gray-400">({consultant.reviewCount} نظر)</span> */}
          </div>
          <div className="text-sm font-medium text-white">{consultant.fee?.toLocaleString()} تومان</div>
        </div>

        <Button
          onClick={onSelect}
          className={`w-full ${
            selected
              ? "bg-gradient-to-r from-amber-600 to-yellow-700 text-black"
              : "bg-gradient-to-r from-amber-500 to-yellow-600 text-black hover:from-amber-600 hover:to-yellow-700"
          }`}
          size="sm"
        >
          {selected ? "انتخاب شده" : "انتخاب و رزرو"}
        </Button>
      </div>
    </div>
  )
}
