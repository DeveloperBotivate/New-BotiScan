import { useState } from "react"
import { Phone, Mail, MapPin, Globe, User, Building2, Briefcase, Image, X } from "lucide-react"
import type { ContactData } from "../lib/supabase"

const inputCls =
  "w-full px-4 sm:px-5 py-3 sm:py-4 border-2 border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 hover:border-indigo-200"
const labelCls = "flex items-center text-sm font-bold text-gray-800 mb-2"
const iconCls = "h-5 w-5 mr-2 text-indigo-600"

// Shrink the logo so it stays small in the database and inside the PDF.
function resizeImage(file: File, max = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const img = new window.Image()
      img.onerror = () => reject(new Error("Invalid image"))
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const canvas = document.createElement("canvas")
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL("image/png"))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

interface Props {
  initial: ContactData
  submitLabel: string
  busy?: boolean
  onSubmit: (data: ContactData) => void
  onCancel?: () => void
  cancelLabel?: string
}

export default function ContactForm({ initial, submitLabel, busy, onSubmit, onCancel, cancelLabel = "Cancel" }: Props) {
  const [data, setData] = useState<ContactData>(initial)

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const logo = await resizeImage(file)
      setData(prev => ({ ...prev, logo }))
    } catch {
      alert("Could not read that image. Please try another file.")
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(data)
  }

  return (
    <form onSubmit={submit} className="space-y-5 sm:space-y-6">
      <div>
        <label className={labelCls}><User className={iconCls} />Person Name *</label>
        <input name="personName" value={data.personName} onChange={change} className={inputCls} placeholder="Enter person name" required />
      </div>
      <div>
        <label className={labelCls}><Building2 className={iconCls} />Company Name *</label>
        <input name="companyName" value={data.companyName} onChange={change} className={inputCls} placeholder="Enter company name" required />
      </div>
      <div>
        <label className={labelCls}><Briefcase className={iconCls} />Designation</label>
        <input name="designation" value={data.designation} onChange={change} className={inputCls} placeholder="Enter designation" />
      </div>
      <div>
        <label className={labelCls}><Phone className={iconCls} />Phone No *</label>
        <input type="tel" name="phoneNo" value={data.phoneNo} onChange={change} className={inputCls} placeholder="Enter phone number" required />
      </div>
      <div>
        <label className={labelCls}><Mail className={iconCls} />Email *</label>
        <input type="email" name="email" value={data.email} onChange={change} className={inputCls} placeholder="Enter email address" required />
      </div>
      <div>
        <label className={labelCls}><Globe className={iconCls} />Any Link</label>
        <input type="url" name="anyLink" value={data.anyLink} onChange={change} className={inputCls} placeholder="https://..." />
      </div>
      <div>
        <label className={labelCls}><MapPin className={iconCls} />Address</label>
        <textarea name="address" value={data.address} onChange={change} className={`${inputCls} resize-none`} placeholder="Enter address" rows={3} />
      </div>

      <div>
        <label className={labelCls}><Image className={iconCls} />Logo</label>
        {!data.logo ? (
          <>
            <input type="file" accept="image/*" onChange={upload} className="hidden" id="logo-upload" />
            <label
              htmlFor="logo-upload"
              className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-indigo-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all bg-indigo-50/40"
            >
              <div className="text-center">
                <Image className="h-12 w-12 text-indigo-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-700">Click to upload logo</p>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG</p>
              </div>
            </label>
          </>
        ) : (
          <div className="relative inline-block">
            <img src={data.logo} alt="Logo preview" className="h-32 w-32 object-contain border-2 border-indigo-200 rounded-xl p-2 bg-white shadow-lg" />
            <button
              type="button"
              onClick={() => setData(prev => ({ ...prev, logo: "" }))}
              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg"
              aria-label="Remove logo"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <button
          type="submit"
          disabled={busy}
          className="flex-1 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 disabled:opacity-60 text-white font-bold py-3 sm:py-4 px-6 rounded-xl shadow-xl text-base sm:text-lg"
        >
          {busy ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 sm:py-4 px-6 rounded-xl shadow text-base sm:text-lg"
          >
            {cancelLabel}
          </button>
        )}
      </div>
    </form>
  )
}
