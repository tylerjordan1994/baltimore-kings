"use client"

import { Render, type Data } from "@measured/puck"
import { puckConfig } from "@/lib/puck/config"

/** Client wrapper around Puck's <Render>. Data is already token-hydrated server-side. */
export function PageRenderer({ data }: { data: Data }) {
  return <Render config={puckConfig} data={data} />
}
