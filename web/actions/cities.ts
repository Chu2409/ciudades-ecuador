import axiosClient from "@/config/axios"
import { ApiResponse } from "@/interfaces/api-response";

export interface City {
  nombre: string;
  lat: number;
  lon: number;
}

export const getCities = async () => {
  const res = await axiosClient.get<ApiResponse<City[]>>('/ciudades')


  if (res.status !== 200) {
    throw new Error('Error al obtener el grafo');
  }

  return res.data.data;
}

export const deleteCity = async (name: string) => {
  const res = await axiosClient.delete(`/ciudades/${name}`)

  if (res.status !== 200) {
    throw new Error('Error al eliminar la ciudad');
  }
}


export const createCity = async (city: string) => {
  const res = await axiosClient.post('/ciudades', {
    name: city,
  })

  if (res.status !== 200) {
    throw new Error('Error al crear la ciudad');
  }

}