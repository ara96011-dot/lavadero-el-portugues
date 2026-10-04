// @ts-nocheck
"use client"
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = url && key ? createClient(url, key) : null

const SERVICIOS = [
  { id: 'basico', nombre: 'Lavado Básico', precio: 8000 },
  { id: 'completo', nombre: 'Lavado Completo', precio: 12000 },
  { id: 'premium', nombre: 'Premium + Encerado', precio: 18000 },
]
