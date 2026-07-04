"use client"

export default function ReplayPage() {
    return (
        <div className="w-full h-screen">
            <iframe
                src="/replay/index.html"
                className="w-full h-full border-0"
                title="HIRMAND Replay"
                allow="fullscreen"
            />
        </div>
    )
}