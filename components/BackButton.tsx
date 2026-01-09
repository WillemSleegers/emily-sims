import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const BackButton = () => {
  return (
    <Button variant="ghost" size="sm" asChild>
      <Link href="/" className="gap-1">
        <ChevronLeft className="h-4 w-4" />
        Back
      </Link>
    </Button>
  )
}
