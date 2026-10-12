import { useEffect, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Phone, Mail, MapPin, Globe, Download, QrCode, Building2, Briefcase, UserPlus, Pencil, Copy, Check } from "lucide-react"
import ContactForm from "./components/ContactForm"
import { downloadQrPdf } from "./lib/pdf"
import {
  ContactData, emptyContact, createContact, getContact, getContactForEdit, updateContact,
  contactUrl, editUrl, vcfUrl, loadSaved, saveLocal, listContacts, AdminRecord,
} from "./lib/supabase"

const card = "bg-white rounded-3xl shadow-2xl border-2 border-indigo-100"
const primaryBtn =
  "inline-flex items-center justify-center bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-800 text-white font-bold py-4 px-10 rounded-2xl shadow-2xl text-base sm:text-lg"

function Shell({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8 bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-indigo-100">
          <a href="/" className="block">
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 tracking-tight">
              Botiscan
            </h1>
          </a>
          <p className="text-gray-600 text-base sm:text-lg">{subtitle ?? "Generate Professional QR Codes for Contact Information"}</p>
        </div>
        {children}
        <footer className="mt-8 text-center py-5 bg-white rounded-2xl shadow-xl border-2 border-indigo-100">
          <p className="text-sm sm:text-base text-gray-600 font-medium">
            Powered by{" "}
            <a href="https://www.botivate.in" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold">
              Botivate.in
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}

function ContactDetails({ d }: { d: ContactData }) {
  const row = "flex items-center bg-white p-3 rounded-lg shadow-sm"
  const ic = "h-5 w-5 text-indigo-600 mr-3 flex-shrink-0"
  const tx = "text-sm sm:text-base text-gray-700 font-medium break-all"
  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 sm:p-8 rounded-2xl border-2 border-indigo-100 shadow-lg">
      <div className="flex items-center gap-4 mb-4 sm:mb-6">
        {d.logo && <img src={d.logo} alt="" className="h-16 w-16 object-contain rounded-xl bg-white p-1 shadow" />}
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 text-left">{d.personName}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-left">
        <div className={row}><Building2 className={ic} /><span className={tx}>{d.companyName}</span></div>
        {d.designation && <div className={row}><Briefcase className={ic} /><span className={tx}>{d.designation}</span></div>}
        <a href={`tel:${d.phoneNo}`} className={row}><Phone className={ic} /><span className={tx}>{d.phoneNo}</span></a>
        <a href={`mailto:${d.email}`} className={row}><Mail className={ic} /><span className={tx}>{d.email}</span></a>
        {d.anyLink && (
          <a href={d.anyLink} target="_blank" rel="noopener noreferrer" className={`${row} sm:col-span-2`}>
            <Globe className={ic} /><span className={tx}>{d.anyLink}</span>
          </a>
        )}
        {d.address && <div className={`${row} sm:col-span-2 items-start`}><MapPin className={`${ic} mt-1`} /><span className={tx}>{d.address}</span></div>}
      </div>
    </div>
  )
}

// Scanned page: /?c=<id>
function ViewPage({ id }: { id: string }) {
  const [data, setData] = useState<ContactData | null>(null)
  const [state, setState] = useState<"loading" | "ok" | "missing" | "error">("loading")

  useEffect(() => {
    getContact(id)
      .then(c => { setData(c); setState(c ? "ok" : "missing") })
      .catch(() => setState("error"))
  }, [id])

  return (
    <Shell subtitle="Save this contact to your phone">
      <div className={`${card} p-6 sm:p-8 text-center`}>
        {state === "loading" && <p className="text-gray-600">Loading...</p>}
        {state === "missing" && <p className="text-gray-700 font-semibold">This contact was not found.</p>}
        {state === "error" && <p className="text-red-600 font-semibold">Could not load contact. Please try again.</p>}
        {state === "ok" && data && (
          <div className="space-y-6">
            <ContactDetails d={data} />
            <a href={vcfUrl(id)} className={`${primaryBtn} w-full sm:w-auto`}>
              <UserPlus className="h-6 w-6 mr-3" />
              Save Contact
            </a>
          </div>
        )}
      </div>
    </Shell>
  )
}

// Result screen shown after create/update.
function QrResult({ id, editKey, data, onNew }: { id: string; editKey: string; data: ContactData; onNew?: () => void }) {
  const [copied, setCopied] = useState(false)
  const url = contactUrl(id)
  const edit = editUrl(id, editKey)

  const copyEdit = async () => {
    try { await navigator.clipboard.writeText(edit); setCopied(true); setTimeout(() => setCopied(false), 2000) }
    catch { window.prompt("Copy your private edit link:", edit) }
  }

  return (
    <div className={`${card} overflow-hidden`}>
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white text-center p-6 sm:p-8">
        <h2 className="flex items-center justify-center gap-3 text-2xl sm:text-3xl font-bold mb-2">
          <QrCode className="h-8 w-8" /> Your QR Code is Ready!
        </h2>
        <p className="text-indigo-100">This QR never changes. Edit details any time and scans show the latest.</p>
      </div>
      <div className="p-6 sm:p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-white p-6 rounded-3xl shadow-2xl border-4 border-indigo-100">
            <QRCodeSVG
              value={url} size={260} level="H" marginSize={2}
              imageSettings={data.logo ? { src: data.logo, height: 56, width: 56, excavate: true } : undefined}
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 break-all">{url}</p>
        <ContactDetails d={data} />
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 text-left text-sm text-amber-900">
          <p className="font-bold mb-1">Keep your private edit link</p>
          <p className="break-all mb-3">{edit}</p>
          <button onClick={copyEdit} className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy edit link"}
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => downloadQrPdf(url, data.personName, data.logo).catch(() => alert("PDF generation failed."))} className={primaryBtn}>
            <Download className="h-6 w-6 mr-3" /> Download QR Code PDF
          </button>
          <a href={edit} className="inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-8 rounded-2xl shadow text-base sm:text-lg">
            <Pencil className="h-5 w-5 mr-2" /> Edit details
          </a>
          {onNew && (
            <button onClick={onNew} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-8 rounded-2xl shadow text-base sm:text-lg">
              Create another
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Home: create a new contact + list of contacts created on this device
function CreatePage() {
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ id: string; key: string; data: ContactData } | null>(null)
  const [saved, setSaved] = useState(loadSaved())

  const submit = async (data: ContactData) => {
    setBusy(true)
    try {
      const { id, edit_key } = await createContact(data)
      saveLocal({ id, key: edit_key, name: data.personName })
      setSaved(loadSaved())
      setResult({ id, key: edit_key, data })
    } catch (e) {
      console.error(e)
      alert("Could not save. Check your Supabase setup and try again.")
    } finally {
      setBusy(false)
    }
  }

  if (result) return <Shell><QrResult id={result.id} editKey={result.key} data={result.data} onNew={() => setResult(null)} /></Shell>

  return (
    <Shell>
      <div className="text-right mb-4">
        <a href="/?admin" className="text-sm font-semibold text-indigo-600 hover:underline">All records (admin) →</a>
      </div>
      {saved.length > 0 && (
        <div className={`${card} p-6 mb-8`}>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your contacts</h2>
          <ul className="divide-y divide-indigo-100">
            {saved.map(c => (
              <li key={c.id} className="flex items-center justify-between py-3 gap-3">
                <span className="font-medium text-gray-700 break-all">{c.name}</span>
                <span className="flex gap-2 flex-shrink-0">
                  <a href={`/?c=${c.id}`} className="text-sm font-semibold text-indigo-600 hover:underline">View</a>
                  <a href={`/?edit=${c.id}&key=${c.key}`} className="text-sm font-semibold text-indigo-600 hover:underline">Edit</a>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className={`${card} p-6 sm:p-8 lg:p-10`}>
        <h2 className="text-2xl sm:text-3xl font-bold text-indigo-700 mb-6 sm:mb-8 text-center">Contact Information</h2>
        <ContactForm initial={emptyContact} submitLabel="Generate QR Code" busy={busy} onSubmit={submit} />
      </div>
    </Shell>
  )
}

// Edit: /?edit=<id>&key=<edit_key>
function EditPage({ id, editKey }: { id: string; editKey: string }) {
  const [initial, setInitial] = useState<ContactData | null>(null)
  const [state, setState] = useState<"loading" | "ok" | "denied" | "error">("loading")
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<ContactData | null>(null)

  useEffect(() => {
    getContactForEdit(id, editKey)
      .then(c => { setInitial(c); setState(c ? "ok" : "denied") })
      .catch(() => setState("error"))
  }, [id, editKey])

  const submit = async (data: ContactData) => {
    setBusy(true)
    try {
      if (!(await updateContact(id, editKey, data))) throw new Error("not updated")
      saveLocal({ id, key: editKey, name: data.personName })
      setDone(data)
    } catch (e) {
      console.error(e)
      alert("Could not update. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  if (done) return <Shell subtitle="Details updated"><QrResult id={id} editKey={editKey} data={done} /></Shell>

  return (
    <Shell subtitle="Edit your contact details">
      <div className={`${card} p-6 sm:p-8 lg:p-10`}>
        {state === "loading" && <p className="text-center text-gray-600">Loading...</p>}
        {state === "denied" && <p className="text-center text-gray-700 font-semibold">Invalid edit link.</p>}
        {state === "error" && <p className="text-center text-red-600 font-semibold">Could not load contact. Please try again.</p>}
        {state === "ok" && initial && (
          <ContactForm initial={initial} submitLabel="Update Details" busy={busy} onSubmit={submit} onCancel={() => { window.location.href = "/" }} cancelLabel="Back" />
        )}
      </div>
    </Shell>
  )
}

// Admin: every record in the database, with QR download. /?admin
function AdminPage() {
  const [pass, setPass] = useState(() => { try { return sessionStorage.getItem("botiscan.pass") || "" } catch { return "" } })
  const [rows, setRows] = useState<AdminRecord[] | null>(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [search, setSearch] = useState("")

  const load = async (p: string) => {
    setBusy(true); setError("")
    try {
      setRows(await listContacts(p))
      try { sessionStorage.setItem("botiscan.pass", p) } catch { /* ignore */ }
    } catch {
      setRows(null); setError("Wrong passcode or could not load records.")
    } finally { setBusy(false) }
  }

  useEffect(() => { if (pass) load(pass) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const q = search.trim().toLowerCase()
  const shown = (rows ?? []).filter(r => !q || [r.personName, r.companyName, r.phoneNo, r.email].some(v => v.toLowerCase().includes(q)))
  const link = "text-sm font-semibold text-indigo-600 hover:underline"

  return (
    <Shell subtitle="All records">
      {!rows ? (
        <form onSubmit={e => { e.preventDefault(); load(pass) }} className={`${card} p-6 sm:p-8 max-w-md mx-auto space-y-4`}>
          <h2 className="text-xl font-bold text-gray-800">Admin passcode</h2>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Enter passcode"
            className="w-full px-4 py-3 border-2 border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
          {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}
          <button disabled={busy} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl">
            {busy ? "Loading..." : "Open records"}
          </button>
        </form>
      ) : (
        <div className={`${card} p-4 sm:p-6`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold text-gray-800">{shown.length} of {rows.length} records</h2>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, company, phone, email"
              className="px-4 py-2 border-2 border-indigo-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-72" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-500 border-b-2 border-indigo-100">
                  <th className="py-2 pr-3">Name</th><th className="pr-3">Company</th><th className="pr-3">Phone</th>
                  <th className="pr-3">Email</th><th className="pr-3">Created</th><th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-50">
                {shown.map(r => (
                  <tr key={r.id} className="align-middle">
                    <td className="py-3 pr-3 font-semibold text-gray-800">
                      <span className="flex items-center gap-2">
                        {r.logo && <img src={r.logo} alt="" className="h-8 w-8 object-contain rounded bg-white border" />}
                        {r.personName}
                      </span>
                    </td>
                    <td className="pr-3">{r.companyName}</td>
                    <td className="pr-3 whitespace-nowrap">{r.phoneNo}</td>
                    <td className="pr-3 break-all">{r.email}</td>
                    <td className="pr-3 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="whitespace-nowrap space-x-3">
                      <a href={`/?c=${r.id}`} target="_blank" rel="noreferrer" className={link}>View</a>
                      <a href={`/?edit=${r.id}&key=${r.editKey}`} className={link}>Edit</a>
                      <button onClick={() => downloadQrPdf(contactUrl(r.id), r.personName, r.logo).catch(() => alert("PDF generation failed."))} className={link}>
                        <Download className="inline h-4 w-4 mr-1" />QR PDF
                      </button>
                    </td>
                  </tr>
                ))}
                {shown.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-gray-500">No records</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Shell>
  )
}

function App() {
  const q = new URLSearchParams(window.location.search)
  if (q.has("admin")) return <AdminPage />
  const view = q.get("c")
  const edit = q.get("edit")
  const key = q.get("key")
  if (view) return <ViewPage id={view} />
  if (edit && key) return <EditPage id={edit} editKey={key} />
  return <CreatePage />
}

export default App
