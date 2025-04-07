"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface ConnectionFormProps {
  connectionId?: string
}

interface ConnectionData {
  sourceCity: string
  targetCity: string
  distance: number
  travelTime: number
}

interface City {
  id: string
  name: string
}

export default function ConnectionForm({ connectionId }: ConnectionFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(connectionId ? true : false)
  const [submitting, setSubmitting] = useState(false)
  const [cities, setCities] = useState<City[]>([])
  const [formData, setFormData] = useState<ConnectionData>({
    sourceCity: "",
    targetCity: "",
    distance: 0,
    travelTime: 0,
  })

  // Cargar la lista de ciudades
  useEffect(() => {
    const fetchCities = async () => {
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
        ])
      }
    }

    fetchCities()
  }, [toast])

  // Cargar datos de la conexión si estamos en modo edición
  useEffect(() => {
    if (connectionId) {
      const fetchConnection = async () => {
        try {
          // Aquí deberías reemplazar con la URL real de tu API
          const response = await fetch(`http://localhost:8000/api/connections/${connectionId}`)
          if (!response.ok) {
            throw new Error("Error al cargar los datos de la conexión")
          }
          const data = await response.json()
          setFormData(data)
        } catch (error) {
          console.error("Error fetching connection:", error)
          toast({
            title: "Error",
            description: "No se pudieron cargar los datos de la conexión. Usando datos de ejemplo.",
            variant: "destructive",
          })
          // Datos de ejemplo para demostración
          setFormData({
            sourceCity: "Madrid",
            targetCity: "Barcelona",
            distance: 621,
            travelTime: 180,
          })
        } finally {
          setLoading(false)
        }
      }

      fetchConnection()
    } else {
      setLoading(false)
    }
  }, [connectionId, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "distance" || name === "travelTime" ? Number.parseInt(value) || 0 : value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // URL y método dependen de si estamos creando o editando
      const url = connectionId
        ? `http://localhost:8000/api/connections/${connectionId}`
        : "http://localhost:8000/api/connections"

      const method = connectionId ? "PUT" : "POST"

      // Aquí deberías reemplazar con la URL real de tu API
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(`Error al ${connectionId ? "actualizar" : "crear"} la conexión`)
      }

      toast({
        title: connectionId ? "Conexión actualizada" : "Conexión creada",
        description: connectionId
          ? "La conexión ha sido actualizada correctamente"
          : "La conexión ha sido creada correctamente",
      })

      // Redirigir a la lista de conexiones
      router.push("/connections")
      router.refresh()
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: `No se pudo ${connectionId ? "actualizar" : "crear"} la conexión`,
        variant: "destructive",
      })

      // Para demostración, simulamos éxito
      setTimeout(() => {
        router.push("/connections")
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
        <span className="ml-2">Cargando datos de la conexión...</span>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="sourceCity">Ciudad de Origen</Label>
              <Select
                value={formData.sourceCity}
                onValueChange={(value) => handleSelectChange("sourceCity", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una ciudad" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="targetCity">Ciudad de Destino</Label>
              <Select
                value={formData.targetCity}
                onValueChange={(value) => handleSelectChange("targetCity", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una ciudad" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.name} disabled={city.name === formData.sourceCity}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="distance">Distancia (km)</Label>
              <Input
                id="distance"
                name="distance"
                type="number"
                value={formData.distance || ""}
                onChange={handleChange}
                placeholder="Ej: 621"
                required
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="travelTime">Tiempo de viaje (minutos)</Label>
              <Input
                id="travelTime"
                name="travelTime"
                type="number"
                value={formData.travelTime || ""}
                onChange={handleChange}
                placeholder="Ej: 180"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.push("/connections")} disabled={submitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {connectionId ? "Actualizando..." : "Creando..."}
                  </>
                ) : connectionId ? (
                  "Actualizar Conexión"
                ) : (
                  "Crear Conexión"
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

