import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import CityForm from "../../city-form"

export default function EditCityPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-6">
        <Link href="/cities">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Volver a la lista
          </Button>
        </Link>
        <h1 className="text-3xl font-bold ml-4">Editar Ciudad</h1>
      </div>

      <div className="max-w-2xl mx-auto">
        <CityForm cityId={params.id} />
      </div>
    </div>
  )
}

