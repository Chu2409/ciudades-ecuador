import axiosClient from "@/config/axios"
import { ApiResponse } from "@/interfaces/api-response";

export interface Connection {
  city1: string
  city2: string
  distance: number
}

export const getConnections = async () => {
  const res = await axiosClient.get<ApiResponse<Connection[]>>('/conexiones')


  if (res.status !== 200) {
    throw new Error('Error al obtener el grafo');
  }

  return res.data.data;
}

export const deleteConnection = async (city1: string, city2: string) => {
  const res = await axiosClient.delete(`/conexiones`, {
    params: {
      city1,
      city2
    }
  })

  if (res.status !== 200) {
    throw new Error('Error al eliminar la ciudad');
  }
}

export const createConnection = async (connection: Connection) => {
  const res = await axiosClient.post('/conexiones', {
    city1: connection.city1,
    city2: connection.city2,
    distance: connection.distance
  })

  if (res.status !== 200) {
    throw new Error('Error al crear la ciudad');
  }
}

export const updateConnection = async (connection: Connection) => {
  const res = await axiosClient.put(`/conexiones`, {
    city1: connection.city1,
    city2: connection.city2,
    distance: connection.distance
  })

  if (res.status !== 200) {
    throw new Error('Error al actualizar la ciudad');
  }
}