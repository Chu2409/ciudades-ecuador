'use client'

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import ConnectionForm from "../connection-form"
import useConnectionStore from "@/store/connection-store"

export default function NewConnectionPage() {
  const {connection} = useConnectionStore()

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-6">
        <Link href="/connections">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Volver a la lista
          </Button>
        </Link>
        <h1 className="text-3xl font-bold ml-4">
          {connection ? "Editar Conexión" : "Nueva Conexión"}
        </h1>
      </div>

      <div className="max-w-2xl mx-auto">
        <ConnectionForm />
      </div>
    </div>
  )
}

