import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/chart/mode-toggle"
import { redirect } from "next/navigation"

export default function Header() {
  const handleOpenUserPanel = () => {
    redirect("https://hirmandtrade.ir/user")
  }
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">پلاس چارت</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleOpenUserPanel}>
            پـنـل کـاربـری
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
