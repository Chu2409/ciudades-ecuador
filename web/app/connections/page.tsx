'use client'
import { Suspense } from "react"
import Link from "next/link"
import { Plus, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import ConnectionList from "./connection-list"
import useConnectionStore from "@/store/connection-store"
import { useRouter } from "next/navigation"

export default function ConnectionsPage() {
  
  const { setConnection } = useConnectionStore()
  const router = useRouter()
  const onClick = () => {
    setConnection(undefined)
    router.push("/connections/form")
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-bold ml-4">Gestión de Conexiones</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Administra las conexiones entre ciudades</p>
          <Button className="gap-1" onClick={onClick}>
            <Plus className="h-4 w-4" />
            Nueva Conexión
          </Button>
      </div>

      <Suspense fallback={<div>Cargando conexiones...</div>}>
        <ConnectionList />
      </Suspense>
    </div>
  )
}

