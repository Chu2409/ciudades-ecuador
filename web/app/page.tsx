import { Suspense } from "react"
import Link from "next/link"
import { MapPin, Network, ArrowRight, Route } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-6">Gestor de Ciudades y Conexiones</h1>
      <p className="text-lg text-muted-foreground mb-10">
        Administra ciudades y sus conexiones en un sistema de grafos
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/cities">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Gestión de Ciudades
              </CardTitle>
              <CardDescription>Crear, editar, visualizar y eliminar ciudades</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Administra la información de las ciudades en el sistema</p>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/connections">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Gestión de Conexiones
              </CardTitle>
              <CardDescription>Crear, editar, visualizar y eliminar conexiones entre ciudades</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Define las relaciones y distancias entre las ciudades</p>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/route-calculator">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Calculador de Rutas
              </CardTitle>
              <CardDescription>Calcula la mejor ruta entre ciudades con diferentes algoritmos</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Encuentra el camino óptimo entre dos ciudades</p>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Visualización del Grafo</CardTitle>
            <CardDescription>Vista general de las ciudades y sus conexiones</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={<div className="h-[400px] flex items-center justify-center">Cargando visualización...</div>}
            >
              <div className="h-[400px] bg-slate-100 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">La visualización del grafo aparecerá aquí</p>
              </div>
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

