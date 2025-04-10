import axiosClient from "@/config/axios";

export const calculateDijkstra = async (city1: string, city2: string) => {
  const res = await axiosClient.get<{status: string, image_url: string}>('/ruta/dijkstra', {
    params: {
      origen: city1,
      destino: city2,
    },
  })

  if (res.status !== 200) {
    throw new Error('Error al obtener el grafo');
  }

  return res.data.image_url;
}

export const calculateAStar = async (city1: string, city2: string) => {
  const res = await axiosClient.get<{status: string, image_url: string}>('/ruta/astar', {
    params: {
      origen: city1,
      destino: city2,
    },
  })

  if (res.status !== 200) {
    throw new Error('Error al obtener el grafo');
  }

  return res.data.image_url;
}

export const calculateVoraz = async (city1: string, city2: string) => {
  const res = await axiosClient.get<{status: string, image_url: string}>('/ruta/voraz', {
    params: {
      origen: city1,
      destino: city2,
    },
  })

  if (res.status !== 200) {
    throw new Error('Error al obtener el grafo');
  }

  return res.data.image_url;
}