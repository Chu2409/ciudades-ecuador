"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Loader2, Route } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface City {
  id: string
  name: string
}

interface RouteResult {
  imageUrl: string
  distance: number
  path: string[]
  executionTime: number
}

const algorithms = [
  { id: "dijkstra", name: "Dijkstra" },
  { id: "bellman-ford", name: "Bellman-Ford" },
  { id: "a-star", name: "A*" },
]

export default function RouteCalculatorForm() {
  const { toast } = useToast()
  const [cities, setCities] = useState<City[]>([])
  const [sourceCity, setSourceCity] = useState("")
  const [targetCity, setTargetCity] = useState("")
  const [algorithm, setAlgorithm] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingCities, setLoadingCities] = useState(true)
  const [result, setResult] = useState<RouteResult | null>(null)

  // Cargar la lista de ciudades
  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true)
      try {
        // Aquí deberías reemplazar con la URL real de tu API
        const response = await fetch("http://localhost:8000/api/cities")
        if (!response.ok) {
          throw new Error("Error al cargar las ciudades")
        }
        const data = await response.json()
        setCities(data)
      } catch (error) {
        console.error("Error fetching cities:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las ciudades. Usando datos de ejemplo.",
          variant: "destructive",
        })
        // Datos de ejemplo para demostración
        setCities([
          { id: "1", name: "Madrid" },
          { id: "2", name: "Barcelona" },
          { id: "3", name: "Valencia" },
          { id: "4", name: "Sevilla" },
          { id: "5", name: "Bilbao" },
        ])
      } finally {
        setLoadingCities(false)
      }
    }

    fetchCities()
  }, [toast])

  const calculateRoute = async () => {
    if (!sourceCity || !targetCity || !algorithm) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, selecciona ciudad de origen, destino y algoritmo",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      // Aquí deberías reemplazar con la URL real de tu API
      const response = await fetch("http://localhost:8000/api/calculate-route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceCity,
          targetCity,
          algorithm,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al calcular la ruta")
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Error calculating route:", error)
      toast({
        title: "Error",
        description: "No se pudo calcular la ruta. Usando resultado de ejemplo.",
        variant: "destructive",
      })

      // Datos de ejemplo para demostración
      setResult({
        imageUrl: "/placeholder.svg?height=400&width=600",
        distance: 621,
        path: ["Madrid", "Zaragoza", "Barcelona"],
        executionTime: 0.0023,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="sourceCity">Ciudad de Origen</Label>
              <Select value={sourceCity} onValueChange={setSourceCity} disabled={loadingCities}>
                <SelectTrigger id="sourceCity">
                  <SelectValue placeholder="Selecciona ciudad de origen" />
                </SelectTrigger>
                <SelectContent>
                  {loadingCities ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Cargando...
                    </div>
                  ) : (
                    cities.map((city) => (
                      <SelectItem key={city.id} value={city.name} disabled={city.name === targetCity}>
                        {city.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="targetCity">Ciudad de Destino</Label>
              <Select value={targetCity} onValueChange={setTargetCity} disabled={loadingCities}>
                <SelectTrigger id="targetCity">
                  <SelectValue placeholder="Selecciona ciudad de destino" />
                </SelectTrigger>
                <SelectContent>
                  {loadingCities ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Cargando...
                    </div>
                  ) : (
                    cities.map((city) => (
                      <SelectItem key={city.id} value={city.name} disabled={city.name === sourceCity}>
                        {city.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="algorithm">Algoritmo</Label>
              <Select value={algorithm} onValueChange={setAlgorithm}>
                <SelectTrigger id="algorithm">
                  <SelectValue placeholder="Selecciona un algoritmo" />
                </SelectTrigger>
                <SelectContent>
                  {algorithms.map((algo) => (
                    <SelectItem key={algo.id} value={algo.id}>
                      {algo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={calculateRoute}
              disabled={loading || !sourceCity || !targetCity || !algorithm}
              className="mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <Route className="mr-2 h-4 w-4" />
                  Calcular Ruta
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Resultado del cálculo</h3>

            <div className="mb-6 overflow-hidden rounded-md border">
              <Image
                src={result.imageUrl || "/placeholder.svg"}
                alt="Visualización de la ruta"
                width={600}
                height={400}
                className="w-full object-cover"
              />
            </div>

            <div className="grid gap-4">
              <div>
                <p className="text-sm font-medium">Distancia total:</p>
                <p className="text-lg font-bold">{result.distance} km</p>
              </div>

              <div>
                <p className="text-sm font-medium">Ruta:</p>
                <p className="text-md">{result.path.join(" → ")}</p>
              </div>

              <div>
                <p className="text-sm font-medium">Tiempo de ejecución:</p>
                <p className="text-sm text-muted-foreground">{result.executionTime.toFixed(4)} segundos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

