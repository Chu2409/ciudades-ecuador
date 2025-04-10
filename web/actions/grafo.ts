import axiosClient from "@/config/axios"

export const getGrafo = async ({showDistances, showCoordinates}: {showDistances: boolean, showCoordinates: boolean}): Promise<string> => {
  const res = await axiosClient.get<{status: string, image_url: string}>('/grafo', {
    params: {
      show_distances: showDistances,
      show_coordinates: showCoordinates
    }
  })


  if (res.status !== 200) {
    throw new Error('Error al obtener el grafo');
  }

  return res.data.image_url;
}