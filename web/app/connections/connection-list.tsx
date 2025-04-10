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
import { Connection, deleteConnection, getConnections } from "@/actions/connections"
import useConnectionStore from "@/store/connection-store"
import { useRouter } from "next/navigation"

export default function ConnectionList() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [connectionToDelete, setConnectionToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const router = useRouter()

  const {setConnection} = useConnectionStore()

  // Función para cargar las conexiones desde la API
  const fetchConnections = async () => {
    setLoading(true)
    try {
      const response = await getConnections();

      setConnections(response)
    } catch (error) {
      console.error("Error fetching connections:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las conexiones. Usando datos de ejemplo.",
        variant: "destructive",
      })

    } finally {
      setLoading(false)
    }
  }

  // Función para eliminar una conexión
  const delConnection = async (city1: string, city2: string) => {
    setIsDeleting(true)
    try {
      await deleteConnection(city1, city2)
      toast({
        title: "Conexión eliminada",
        description: "La conexión ha sido eliminada correctamente",
      })

      await fetchConnections() // Recargar las conexiones después de eliminar
    } catch (error) {
      console.error("Error deleting connection:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la conexión",
        variant: "destructive",
      })
      // Para demostración, eliminamos la conexión de la lista local
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

  const onEdit = (connection: Connection) => {
    setConnection(connection)

    router.push("/connections/form")
    router.refresh()
  }


  return (
    <div>
      {connections.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">No hay conexiones registradas</p>
          <Link href="/connections/form">
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
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connections.map((connection) => (
                <TableRow key={`${connection.city1}-${connection.city2}`}>
                  <TableCell className="font-medium">{connection.city1}</TableCell>
                  <TableCell>{connection.city2}</TableCell>
                  <TableCell>{connection.distance}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEdit(connection)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            // onClick={() => setConnectionToDelete(connection.)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará la conexión entre "{connection.city1}" y "
                              {connection.city2}". Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => delConnection(connection.city1, connection.city2)}
                              disabled={isDeleting}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              
                                Eliminar
                            
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

