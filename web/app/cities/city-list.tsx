"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { getCities, deleteCity } from "@/actions/cities";

// Tipo para una ciudad
interface City {
  nombre: string;
  lat: number;
  lon: number;
}

export default function CityList() {
  const [cities, setCities] = useState<City[]>([]);
  const [cityToDelete, setCityToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);


  async function fetchCities() {
    setLoading(true);
    try {
      const response = await getCities();

      setCities(response);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCities();
  }, []);

  const delCity = async (name: string) => {
    setIsDeleting(true);
    try {
      // Aquí deberías reemplazar con la URL real de tu API
      await deleteCity(name);
      toast({
        title: "Ciudad eliminada",
        description: "La ciudad ha sido eliminada correctamente",
      });

      await fetchCities()
    } catch (error) {
      console.error("Error deleting city:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la ciudad",
        variant: "destructive",
      });
      // Para demostración, eliminamos la ciudad de la lista local
    } finally {
      setIsDeleting(false);
      setCityToDelete(null);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando ciudades...</span>
      </div>
    );
  }

  return (
    <div>
      {cities.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">
            No hay ciudades registradas
          </p>
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
                <TableHead>Latitud</TableHead>
                <TableHead>Longitud</TableHead>
                <TableHead>Maps</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cities.map((city) => (
                <TableRow key={city.nombre}>
                  <TableCell className="font-medium">{city.nombre}</TableCell>
                  <TableCell>{city.lat}</TableCell>
                  <TableCell>{city.lon}</TableCell>
                  <TableCell>
                    <Link
                      href={`https://www.google.com/maps/search/?api=1&query=${city.lat},${city.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Ver en Maps
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setCityToDelete(city.nombre)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará la ciudad "{city.nombre}" y
                              todas sus conexiones. Esta acción no se puede
                              deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => delCity(city.nombre)}
                              disabled={isDeleting}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              {isDeleting && cityToDelete === city.nombre ? (
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
  );
}
