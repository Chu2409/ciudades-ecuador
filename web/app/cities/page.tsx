import { Suspense } from "react"
import Link from "next/link"
import { Plus, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import CityList from "./city-list"

export default function CitiesPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-bold ml-4">Gestión de Ciudades</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Administra las ciudades en el sistema</p>
        <Link href="/cities/new">
          <Button className="gap-1">
            <Plus className="h-4 w-4" />
            Nueva Ciudad
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Cargando ciudades...</div>}>
        <CityList />
      </Suspense>
    </div>
  )
}

