import { createClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL as string
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, anon)

export interface ContactData {
  personName: string
  companyName: string
  designation: string
  phoneNo: string
  email: string
  anyLink: string
  address: string
  logo: string
}

export const emptyContact: ContactData = {
  personName: "", companyName: "", designation: "", phoneNo: "",
  email: "", anyLink: "", address: "", logo: "",
}

interface Row {
  person_name: string; company_name: string; designation: string; phone_no: string
  email: string; any_link: string; address: string; logo: string
}

const fromRow = (r: Row): ContactData => ({
  personName: r.person_name, companyName: r.company_name, designation: r.designation,
  phoneNo: r.phone_no, email: r.email, anyLink: r.any_link, address: r.address, logo: r.logo,
})

const toRow = (d: ContactData): Row => ({
  person_name: d.personName.trim(), company_name: d.companyName.trim(), designation: d.designation.trim(),
  phone_no: d.phoneNo.trim(), email: d.email.trim(), any_link: d.anyLink.trim(),
  address: d.address.trim(), logo: d.logo,
})

export async function createContact(d: ContactData): Promise<{ id: string; edit_key: string }> {
  const { data, error } = await supabase.rpc("create_contact", { p: toRow(d) })
  if (error) throw error
  return data
}

export async function getContact(id: string): Promise<ContactData | null> {
  const { data, error } = await supabase.rpc("get_contact", { p_id: id })
  if (error) throw error
  return data ? fromRow(data) : null
}

export async function getContactForEdit(id: string, key: string): Promise<ContactData | null> {
  const { data, error } = await supabase.rpc("get_contact_for_edit", { p_id: id, p_key: key })
  if (error) throw error
  return data ? fromRow(data) : null
}

export async function updateContact(id: string, key: string, d: ContactData): Promise<boolean> {
  const { data, error } = await supabase.rpc("update_contact", { p_id: id, p_key: key, p: toRow(d) })
  if (error) throw error
  return data === true
}

// URL stored inside the QR. Never changes for a given contact.
export const contactUrl = (id: string) =>
  `${(import.meta.env.VITE_PUBLIC_URL as string | undefined)?.replace(/\/$/, "") || window.location.origin}/?c=${id}`

export const editUrl = (id: string, key: string) =>
  `${window.location.origin}/?edit=${id}&key=${key}`

// Endpoint that returns the .vcf (Supabase Edge Function "vcard").
export const vcfUrl = (id: string) => `${url}/functions/v1/vcard?id=${id}`

// Contacts created on this device, so they can be edited later from the home page.
export interface SavedContact { id: string; key: string; name: string }
const LS = "botiscan.contacts"
export const loadSaved = (): SavedContact[] => {
  try { return JSON.parse(localStorage.getItem(LS) || "[]") } catch { return [] }
}
export const saveLocal = (c: SavedContact) => {
  try {
    const all = loadSaved().filter(x => x.id !== c.id)
    localStorage.setItem(LS, JSON.stringify([c, ...all]))
  } catch { /* storage unavailable */ }
}

export interface AdminRecord extends ContactData { id: string; editKey: string; createdAt: string }

// Admin: all records, protected by the passcode stored in the admin_config table.
export async function listContacts(pass: string): Promise<AdminRecord[]> {
  const { data, error } = await supabase.rpc("list_contacts", { p_pass: pass })
  if (error) throw error
  return (data as (Row & { id: string; edit_key: string; created_at: string })[]).map(r => ({
    ...fromRow(r), id: r.id, editKey: r.edit_key, createdAt: r.created_at,
  }))
}
