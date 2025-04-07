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

// Tipo para una conexión
interface Connection {
  id: string
  sourceCity: string
  targetCity: string
  distance: number
  travelTime: number
}

export default function ConnectionList() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [connectionToDelete, setConnectionToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  // Función para cargar las conexiones desde la API
  const fetchConnections = async () => {
    setLoading(true)
    try {
      // Aquí deberías reemplazar con la URL real de tu API
      const response = await fetch("http://localhost:8000/api/connections")
      if (!response.ok) {
        throw new Error("Error al cargar las conexiones")
      }
      const data = await response.json()
      setConnections(data)
    } catch (error) {
      console.error("Error fetching connections:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las conexiones. Usando datos de ejemplo.",
        variant: "destructive",
      })
      // Datos de ejemplo para demostración
      setConnections([
        { id: "1", sourceCity: "Madrid", targetCity: "Barcelona", distance: 621, travelTime: 180 },
        { id: "2", sourceCity: "Barcelona", targetCity: "Valencia", distance: 351, travelTime: 120 },
        { id: "3", sourceCity: "Madrid", targetCity: "Valencia", distance: 357, travelTime: 105 },
        { id: "4", sourceCity: "Madrid", targetCity: "Sevilla", distance: 534, travelTime: 150 },
      ])
    } finally {
      setLoading(false)
    }
  }

  // Función para eliminar una conexión
  const deleteConnection = async (id: string) => {
    setIsDeleting(true)
    try {
      // Aquí deberías reemplazar con la URL real de tu API
      const response = await fetch(`http://localhost:8000/api/connections/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar la conexión")
      }

      // Actualizar la lista de conexiones
      setConnections(connections.filter((connection) => connection.id !== id))
      toast({
        title: "Conexión eliminada",
        description: "La conexión ha sido eliminada correctamente",
      })
    } catch (error) {
      console.error("Error deleting connection:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la conexión",
        variant: "destructive",
      })
      // Para demostración, eliminamos la conexión de la lista local
      setConnections(connections.filter((connection) => connection.id !== id))
    } finally {
      setIsDeleting(false)
      setConnectionToDelete(null)
    }
  }

  // Cargar las conexiones al montar el componente
  useEffect(() => {
    fetchConnections()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando conexiones...</span>
      </div>
    )
  }

  return (
    <div>
      {connections.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">No hay conexiones registradas</p>
          <Link href="/connections/new">
            <Button>Crear la primera conexión</Button>
          </Link>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ciudad Origen</TableHead>
                <TableHead>Ciudad Destino</TableHead>
                <TableHead>Distancia (km)</TableHead>
                <TableHead>Tiempo (min)</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connections.map((connection) => (
                <TableRow key={connection.id}>
                  <TableCell className="font-medium">{connection.sourceCity}</TableCell>
                  <TableCell>{connection.targetCity}</TableCell>
                  <TableCell>{connection.distance}</TableCell>
                  <TableCell>{connection.travelTime}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/connections/${connection.id}/edit`}>
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
                            onClick={() => setConnectionToDelete(connection.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará la conexión entre "{connection.sourceCity}" y "
                              {connection.targetCity}". Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteConnection(connection.id)}
                              disabled={isDeleting}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              {isDeleting && connectionToDelete === connection.id ? (
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

