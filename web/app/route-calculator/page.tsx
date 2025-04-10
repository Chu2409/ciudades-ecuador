import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import RouteCalculatorForm from "./route-calculator-form"

export default function RouteCalculatorPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Button>
        </Link>
        <h1 className="text-3xl font-bold ml-4">Calculador de Rutas</h1>
      </div>

      <p className="text-muted-foreground mb-8">
        Calcula la mejor ruta y distancia entre dos ciudades utilizando diferentes algoritmos
      </p>

        <RouteCalculatorForm />
    </div>
  )
}

