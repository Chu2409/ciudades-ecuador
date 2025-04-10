"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { City, getCities } from "@/actions/cities";
import {
  calculateAStar,
  calculateDijkstra,
  calculateVoraz,
} from "@/actions/algoritmos";
import { Checkbox } from "@/components/ui/checkbox";

const algorithms = [
  { id: "dijkstra", name: "Dijkstra" },
  { id: "a-star", name: "A*" },
  { id: "voraz", name: "Voraz" },
];

export default function RouteCalculatorForm() {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState("");

  const [cities, setCities] = useState<City[]>([]);
  const [sourceCity, setSourceCity] = useState("");
  const [targetCity, setTargetCity] = useState("");
  const [algorithm, setAlgorithm] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCities, setLoadingCities] = useState(true);
  const [showDistances, setShowDistances] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(false);


  async function fetchCities() {
    setLoadingCities(true);
    try {
      const response = await getCities();

      setCities(response);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoadingCities(false);
    }
  }

  // Cargar la lista de ciudades
  useEffect(() => {
    fetchCities();
  }, [toast]);

  const calculateRoute = async () => {
    if (!sourceCity || !targetCity || !algorithm) {
      // toast({
      //   title: "Campos incompletos",
      //   description:
      //     "Por favor, selecciona ciudad de origen, destino y algoritmo",
      //   variant: "destructive",
      // });
      return;
    }

    setLoading(true);

    try {
      if (algorithm === "dijkstra") {
        const imageUrl = await calculateDijkstra(sourceCity, targetCity, showDistances, showCoordinates);
        setImageUrl(imageUrl);
      } else if (algorithm === "a-star") {
        const imageUrl = await calculateAStar(sourceCity, targetCity, showDistances, showCoordinates);
        setImageUrl(imageUrl);
      } else if (algorithm === "voraz") {
        const imageUrl = await calculateVoraz(sourceCity, targetCity, showDistances, showCoordinates);
        setImageUrl(imageUrl);
      }
    } catch (error) {
      console.error("Error calculating route:", error);
      toast({
        title: "Error",
        description:
          "No se pudo calcular la ruta. Usando resultado de ejemplo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateRoute();
  }, [showDistances, showCoordinates]);
  

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-3">
            <div className="flex gap-3 w-full">
              <div className="w-full">
                <Label htmlFor="sourceCity">Ciudad de Origen</Label>
                <Select
                  value={sourceCity}
                  onValueChange={setSourceCity}
                  disabled={loadingCities}
                >
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
                        <SelectItem
                          key={city.nombre}
                          value={city.nombre}
                          disabled={city.nombre === targetCity}
                        >
                          {city.nombre}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full">
                <Label htmlFor="targetCity">Ciudad de Destino</Label>
                <Select
                  value={targetCity}
                  onValueChange={setTargetCity}
                  disabled={loadingCities}
                >
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
                        <SelectItem
                          key={city.nombre}
                          value={city.nombre}
                          disabled={city.nombre === sourceCity}
                        >
                          {city.nombre}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
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
        </CardContent>
      </Card>

      {imageUrl && imageUrl != "" && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">
              Resultado del cálculo
            </h3>

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

            <div className="mb-6 overflow-hidden rounded-md border">
              <Image
                src={`py/${imageUrl}` || "/placeholder.svg"}
                alt="Visualización de la ruta"
                width={600}
                height={400}
                className="w-full object-cover"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
