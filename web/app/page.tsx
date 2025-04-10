"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Network, ArrowRight, Route } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getGrafo } from "@/actions/grafo";
import { Checkbox } from "@/components/ui/checkbox";

export default function Home() {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDistances, setShowDistances] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(false);

  async function fetchGrafoData({
    showDistances,
    showCoordinates,
  }: {
    showDistances: boolean;
    showCoordinates: boolean;
  }) {
    try {
      setLoading(true);
      const response = await getGrafo({ showDistances, showCoordinates });

      setImageUrl(response);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGrafoData({ showDistances, showCoordinates });
  }, [showDistances, showCoordinates]);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-6">
        Gestor de Ciudades y Conexiones
      </h1>
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
              <CardDescription>
                Crear, editar, visualizar y eliminar ciudades
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Administra la información de las ciudades en el sistema
              </p>
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
              <CardDescription>
                Crear, editar, visualizar y eliminar conexiones entre ciudades
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Define las relaciones y distancias entre las ciudades
              </p>
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
              <CardDescription>
                Calcula la mejor ruta entre ciudades con diferentes algoritmos
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Encuentra el camino óptimo entre dos ciudades
              </p>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-10">
        <Card>
          <CardHeader className="flex flex-col gap-4">
            <div className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Visualización del Grafo</CardTitle>
                <CardDescription>
                  Vista general de las ciudades y sus conexiones
                </CardDescription>
              </div>

              <Button
                variant="outline"
                className=" right-4 top-4"
                onClick={() => {
                  fetchGrafoData({ showDistances, showCoordinates });
                }}
                disabled={loading}
              >
                Refrescar
              </Button>
            </div>

            <div className="flex flex-row gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={showDistances}
                  onCheckedChange={() => setShowDistances(!showDistances)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Ver distancias
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={showCoordinates}
                  onCheckedChange={() => setShowCoordinates(!showCoordinates)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Ver coordenadas
                </label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="h-[400px] flex items-center justify-center">
                  Cargando visualización...
                </div>
              }
            >
              <div className=" rounded-md flex items-center justify-center">
                {loading ? (
                  <div className="h-[500px] flex items-center justify-center">
                    Cargando grafo...
                  </div>
                ) : (
                  <img
                  key={Date.now()}
                    src={`py/${imageUrl}`}
                    alt="Grafo"
                    className="rounded-md object-contain w-full h-full"
                  />
                )}
              </div>
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
