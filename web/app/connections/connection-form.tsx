"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import useConnectionStore from "@/store/connection-store";
import { City, getCities } from "@/actions/cities";
import { createConnection, updateConnection } from "@/actions/connections";

interface ConnectionData {
  city1: string;
  city2: string;
  distance: number;
}

export default function ConnectionForm() {
  const { connection } = useConnectionStore();

  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [formData, setFormData] = useState<ConnectionData>({
    city1: connection ? connection.city1 : "",
    city2: connection ? connection.city2 : "",
    distance: connection ? connection.distance : 0,
  });

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

  // Cargar la lista de ciudades
  useEffect(() => {
    fetchCities();
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "distance" ? Number.parseInt(value) || 0 : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      connection
        ? await updateConnection(formData)
        : await createConnection(formData);

      toast({
        title: connection ? "Conexión actualizada" : "Conexión creada",
        description: connection
          ? "La conexión ha sido actualizada correctamente"
          : "La conexión ha sido creada correctamente",
      });

      // Redirigir a la lista de conexiones
      router.push("/connections");
      router.refresh();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: `No se pudo ${
          connection ? "actualizar" : "crear"
        } la conexión`,
        variant: "destructive",
      });

      // Para demostración, simulamos éxito
      setTimeout(() => {
        router.push("/connections");
        router.refresh();
      }, 1000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando datos de la conexión...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="sourceCity">Ciudad de Origen</Label>
              <Select
                value={formData.city1}
                onValueChange={(value) => handleSelectChange("city1", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una ciudad" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.nombre} value={city.nombre}>
                      {city.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="targetCity">Ciudad de Destino</Label>
              <Select
                value={formData.city2}
                onValueChange={(value) => handleSelectChange("city2", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una ciudad" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem
                      key={city.nombre}
                      value={city.nombre}
                      disabled={city.nombre === formData.city1}
                    >
                      {city.nombre}
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

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/connections")}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {connection ? "Actualizando..." : "Creando..."}
                  </>
                ) : connection ? (
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
  );
}
