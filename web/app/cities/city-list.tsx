"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Edit, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

// Tipo para una ciudad
interface City {
  id: string
  name: string
  population: number
  country: string
}

export default function CityList() {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [cityToDelete, setCityToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  // Función para cargar las ciudades desde la API
  const fetchCities = async () => {
    setLoading(true)
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
        { id: "1", name: "Madrid", population: 3223000, country: "España" },
        { id: "2", name: "Barcelona", population: 1620000, country: "España" },
        { id: "3", name: "Valencia", population: 791000, country: "España" },
        { id: "4", name: "Sevilla", population: 688000, country: "España" },
      ])
    } finally {
      setLoading(false)
    }
  }

  // Función para eliminar una ciudad
  const deleteCity = async (id: string) => {
    setIsDeleting(true)
    try {
      // Aquí deberías reemplazar con la URL real de tu API
      const response = await fetch(`http://localhost:8000/api/cities/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar la ciudad")
      }

      // Actualizar la lista de ciudades
      setCities(cities.filter((city) => city.id !== id))
      toast({
        title: "Ciudad eliminada",
        description: "La ciudad ha sido eliminada correctamente",
      })
    } catch (error) {
      console.error("Error deleting city:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la ciudad",
        variant: "destructive",
      })
      // Para demostración, eliminamos la ciudad de la lista local
      setCities(cities.filter((city) => city.id !== id))
    } finally {
      setIsDeleting(false)
      setCityToDelete(null)
    }
  }

  // Cargar las ciudades al montar el componente
  useEffect(() => {
    fetchCities()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando ciudades...</span>
      </div>
    )
  }

  return (
    <div>
      {cities.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">No hay ciudades registradas</p>
          <Link href="/cities/new">
            <Button>Crear la primera ciudad</Button>
          </Link>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>País</TableHead>
                <TableHead>Población</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cities.map((city) => (
                <TableRow key={city.id}>
                  <TableCell className="font-medium">{city.name}</TableCell>
                  <TableCell>{city.country}</TableCell>
                  <TableCell>{city.population.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/cities/${city.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setCityToDelete(city.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará la ciudad "{city.name}" y todas sus conexiones. Esta acción no se
                              puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteCity(city.id)}
                              disabled={isDeleting}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              {isDeleting && cityToDelete === city.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Eliminando...
                                </>
                              ) : (
                                "Eliminar"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

