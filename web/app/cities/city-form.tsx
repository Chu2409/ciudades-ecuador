"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface CityFormProps {
  cityId?: string
}

interface CityData {
  name: string
  population: number
  country: string
}

export default function CityForm({ cityId }: CityFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(cityId ? true : false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<CityData>({
    name: "",
    population: 0,
    country: "",
  })

  // Cargar datos de la ciudad si estamos en modo edición
  useEffect(() => {
    if (cityId) {
      const fetchCity = async () => {
        try {
          // Aquí deberías reemplazar con la URL real de tu API
          const response = await fetch(`http://localhost:8000/api/cities/${cityId}`)
          if (!response.ok) {
            throw new Error("Error al cargar los datos de la ciudad")
          }
          const data = await response.json()
          setFormData(data)
        } catch (error) {
          console.error("Error fetching city:", error)
          toast({
            title: "Error",
            description: "No se pudieron cargar los datos de la ciudad. Usando datos de ejemplo.",
            variant: "destructive",
          })
          // Datos de ejemplo para demostración
          setFormData({
            name: "Madrid",
            population: 3223000,
            country: "España",
          })
        } finally {
          setLoading(false)
        }
      }

      fetchCity()
    }
  }, [cityId, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "population" ? Number.parseInt(value) || 0 : value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // URL y método dependen de si estamos creando o editando
      const url = cityId ? `http://localhost:8000/api/cities/${cityId}` : "http://localhost:8000/api/cities"

      const method = cityId ? "PUT" : "POST"

      // Aquí deberías reemplazar con la URL real de tu API
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(`Error al ${cityId ? "actualizar" : "crear"} la ciudad`)
      }

      toast({
        title: cityId ? "Ciudad actualizada" : "Ciudad creada",
        description: cityId ? "La ciudad ha sido actualizada correctamente" : "La ciudad ha sido creada correctamente",
      })

      // Redirigir a la lista de ciudades
      router.push("/cities")
      router.refresh()
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: `No se pudo ${cityId ? "actualizar" : "crear"} la ciudad`,
        variant: "destructive",
      })

      // Para demostración, simulamos éxito
      setTimeout(() => {
        router.push("/cities")
        router.refresh()
      }, 1000)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando datos de la ciudad...</span>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="name">Nombre de la ciudad</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Madrid"
                required
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Ej: España"
                required
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="population">Población</Label>
              <Input
                id="population"
                name="population"
                type="number"
                value={formData.population || ""}
                onChange={handleChange}
                placeholder="Ej: 3223000"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.push("/cities")} disabled={submitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {cityId ? "Actualizando..." : "Creando..."}
                  </>
                ) : cityId ? (
                  "Actualizar Ciudad"
                ) : (
                  "Crear Ciudad"
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

