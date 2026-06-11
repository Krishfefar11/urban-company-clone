import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import {
  FiUser, FiMapPin, FiTool, FiFileText, FiCheck, FiChevronRight,
  FiChevronLeft, FiUpload, FiArrowRight, FiAlertCircle, FiDollarSign,
  FiShield, FiTrendingUp,
} from 'react-icons/fi'
import { applyAsProfessional } from '../../api/professionals.js'

const SERVICES = ['Home Cleaning','AC Repair','Plumbing','Beauty & Spa','Electrician','Painting','Pest Control','Carpentry','Appliance Repair']
const CITIES   = ['Ahmedabad','Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Pune','Kolkata','Surat','Vadodara']
const STEPS    = ['Personal Info', 'Skills & City', 'Availability', 'Documents']
const DAYS     = [
  { key: 'mon', label: 'Mon' }, { key: 'tue', label: 'Tue' }, { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' }, { key: 'fri', label: 'Fri' }, { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
]

const PERKS = [
  { icon: FiDollarSign, title: 'Earn on your terms',  sub: 'Set your own schedule, work when you want', bg: 'bg-brand-50',    color: 'text-brand'     },
  { icon: FiShield,     title: 'UC backs you',         sub: 'Insurance cover + legal support included',  bg: 'bg-blue-50',     color: 'text-blue-600'  },
  { icon: FiTrendingUp, title: 'Grow your business',   sub: 'Training, tools & 12M+ customer base',     bg: 'bg-purple-50',   color: 'text-purple-600' },
]

const ProRegister = () => {
  const navigate   = useNavigate()
  const [step,      setStep]      = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    name: '', email: '', phone: '', bio: '', experience: '',
    services: [], city: '', areas: '',
    days: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false },
    startTime: '08:00', endTime: '20:00',
    idProof: null, addressProof: null, certificate: null,
  })

  const update    = (field, val) => setForm(f => ({ ...f, [field]: val }))
  const toggleSvc = s => update('services',
    form.services.includes(s) ? form.services.filter(x => x !== s) : [...form.services, s])
  const toggleDay = d => update('days', { ...form.days, [d]: !form.days[d] })

  const canNext = () => {
    if (step === 0) return form.name && form.email && form.phone
    if (step === 1) return form.services.length > 0 && form.city
    if (step === 2) return true
    if (step === 3) return form.idProof
    return false
  }

  const mutation = useMutation({
    mutationFn: () => applyAsProfessional({
      name:         form.name,
      email:        form.email,
      phone:        form.phone,
      bio:          form.bio,
      experience:   Number(form.experience) || 0,
      services:     form.services,
      city:         form.city,
      areas:        form.areas.split(',').map(s => s.trim()).filter(Boolean),
      availability: { ...form.days, startTime: form.startTime, endTime: form.endTime },
    }),
    onSuccess: () => setSubmitted(true),
  })

  const loading = mutation.isPending

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 rounded-full bg-brand flex items-center justify-center mx-auto mb-6">
            <FiCheck size={36} strokeWidth={3} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Application submitted!</h1>
          <p className="text-neutral-500 text-sm leading-relaxed mb-8">
            Our team will review your application within <strong>24–48 hours</strong>. We'll notify you by email once verified.
          </p>
          <div className="bg-neutral-50 rounded-xl p-5 mb-6 text-left space-y-3">
            {[
              { step: '1', label: 'Background & ID verification', time: '24 hrs' },
              { step: '2', label: 'Skills assessment call',        time: '48 hrs' },
              { step: '3', label: 'Onboarding & first job',       time: '72 hrs' },
            ].map(s => (
              <div key={s.step} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{s.step}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">{s.label}</p>
                  <p className="text-xs text-neutral-400">~{s.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary w-full"
          >
            Back to home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-neutral-900 flex-col justify-between p-10">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">UC</span>
            </div>
            <div className="leading-tight">
              <p className="font-bold text-sm text-white">Urban</p>
              <p className="font-bold text-sm text-white -mt-0.5">Company</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-3 leading-snug">
            Join 50,000+<br />UC professionals
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed mb-10">
            Work when you want, earn what you deserve. India's largest home services platform is looking for skilled professionals.
          </p>

          <div className="space-y-5">
            {PERKS.map(p => (
              <div key={p.title} className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${p.bg} flex items-center justify-center flex-shrink-0`}>
                  <p.icon size={17} className={p.color} />
                </div>
                <div>
                  <p className="font-medium text-white text-sm">{p.title}</p>
                  <p className="text-neutral-400 text-xs mt-0.5">{p.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-neutral-500 text-xs">
          Average professional earns <span className="text-brand font-bold">₹35,000–₹80,000/month</span>
        </p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col">
        {/* Progress bar */}
        <div className="h-1 bg-neutral-100">
          <div
            className="h-full bg-brand transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 max-w-lg mx-auto w-full">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-brand uppercase tracking-wide">Step {step + 1} of {STEPS.length}</p>
            <p className="text-xs text-neutral-400">{STEPS[step]}</p>
          </div>

          <div className="flex gap-1.5 mb-8">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-brand' : 'bg-neutral-100'}`} />
            ))}
          </div>

          {/* Step 0: Personal Info */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-1">Tell us about yourself</h1>
                <p className="text-sm text-neutral-400">Basic info to set up your professional profile</p>
              </div>
              {[
                { name: 'name',       label: 'Full name',          type: 'text',   placeholder: 'Ravi Kumar',      id: 'reg-name',  autoComplete: 'name'     },
                { name: 'email',      label: 'Email address',      type: 'email',  placeholder: 'ravi@example.com', id: 'reg-email', autoComplete: 'email'    },
                { name: 'phone',      label: 'Mobile number',      type: 'tel',    placeholder: '+91 98765 43210',  id: 'reg-phone', autoComplete: 'tel'      },
                { name: 'experience', label: 'Years of experience', type: 'number', placeholder: '5',               id: 'reg-exp',   autoComplete: 'off'      },
              ].map(f => (
                <div key={f.name}>
                  <label htmlFor={f.id} className="label">{f.label}</label>
                  <input
                    id={f.id}
                    type={f.type}
                    value={form[f.name]}
                    onChange={e => update(f.name, e.target.value)}
                    placeholder={f.placeholder}
                    autoComplete={f.autoComplete}
                    className="input"
                  />
                </div>
              ))}
              <div>
                <label htmlFor="reg-bio" className="label">
                  Short bio <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                <textarea
                  id="reg-bio"
                  rows={3}
                  value={form.bio}
                  onChange={e => update('bio', e.target.value)}
                  placeholder="Describe your experience and specialities…"
                  className="input resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 1: Skills & City */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-1">Your skills & location</h1>
                <p className="text-sm text-neutral-400">Select the services you offer and where you work</p>
              </div>
              <div>
                <p className="label mb-2">Services you offer <span className="text-red-400">*</span></p>
                <div className="flex flex-wrap gap-2">
                  {SERVICES.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSvc(s)}
                      aria-pressed={form.services.includes(s)}
                      className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                        form.services.includes(s)
                          ? 'bg-neutral-900 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {form.services.includes(s) && <FiCheck size={12} className="inline mr-1.5" />}
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="reg-city" className="label">Primary city <span className="text-red-400">*</span></label>
                <select
                  id="reg-city"
                  value={form.city}
                  onChange={e => update('city', e.target.value)}
                  className="input"
                >
                  <option value="">Select your city</option>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="reg-areas" className="label">Areas / localities you cover</label>
                <input
                  id="reg-areas"
                  type="text"
                  value={form.areas}
                  onChange={e => update('areas', e.target.value)}
                  placeholder="e.g. Prahlad Nagar, Satellite, Bodakdev"
                  className="input"
                />
                <p className="text-xs text-neutral-400 mt-1.5">Separate multiple areas with commas</p>
              </div>
            </div>
          )}

          {/* Step 2: Availability */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-1">Set your availability</h1>
                <p className="text-sm text-neutral-400">Choose the days and hours you're available to work</p>
              </div>
              <div>
                <p className="label mb-2">Working days</p>
                <div className="flex gap-2 flex-wrap" role="group" aria-label="Select working days">
                  {DAYS.map(d => (
                    <button
                      key={d.key}
                      type="button"
                      aria-pressed={form.days[d.key]}
                      onClick={() => toggleDay(d.key)}
                      className={`w-14 h-14 rounded-xl text-xs font-semibold transition-all ${
                        form.days[d.key]
                          ? 'bg-neutral-900 text-white'
                          : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-neutral-400 mt-2">
                  {Object.values(form.days).filter(Boolean).length} days selected
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-start" className="label">Start time</label>
                  <input
                    id="reg-start"
                    type="time"
                    value={form.startTime}
                    onChange={e => update('startTime', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label htmlFor="reg-end" className="label">End time</label>
                  <input
                    id="reg-end"
                    type="time"
                    value={form.endTime}
                    onChange={e => update('endTime', e.target.value)}
                    className="input"
                  />
                </div>
              </div>
              <div className="bg-brand-50 rounded-xl p-4">
                <p className="text-sm font-medium text-brand mb-1">Your estimated working hours</p>
                <p className="text-xs text-neutral-600">
                  {Object.values(form.days).filter(Boolean).length} days/week ·{' '}
                  {Math.abs(parseInt(form.endTime) - parseInt(form.startTime))} hrs/day
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-1">Upload documents</h1>
                <p className="text-sm text-neutral-400">Required for background verification. All docs are encrypted & secure.</p>
              </div>
              {[
                { field: 'idProof',      label: 'Government ID',    sub: 'Aadhaar, PAN, Passport, or Voter ID',       required: true  },
                { field: 'addressProof', label: 'Address proof',     sub: 'Utility bill, bank statement (< 3 months)', required: false },
                { field: 'certificate',  label: 'Skill certificate', sub: 'Any relevant training or certification',    required: false },
              ].map(({ field, label, sub, required }) => (
                <div key={field}>
                  <p className="label">
                    {label} {required && <span className="text-red-400">*</span>}
                  </p>
                  <p className="text-xs text-neutral-400 mb-2">{sub}</p>
                  <label
                    className={`flex items-center gap-3 border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all ${
                      form[field] ? 'border-brand bg-brand-50' : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={e => update(field, e.target.files[0])}
                    />
                    {form[field] ? (
                      <>
                        <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center flex-shrink-0">
                          <FiCheck size={16} className="text-white" strokeWidth={3} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-brand">{form[field].name}</p>
                          <p className="text-xs text-neutral-400">{(form[field].size / 1024).toFixed(0)} KB · Click to replace</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                          <FiUpload size={15} className="text-neutral-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-700">Click to upload</p>
                          <p className="text-xs text-neutral-400">JPG, PNG or PDF · Max 5MB</p>
                        </div>
                      </>
                    )}
                  </label>
                </div>
              ))}
              <div className="flex items-start gap-2 text-xs text-neutral-400 bg-neutral-50 rounded-xl p-3.5">
                <FiFileText size={14} className="flex-shrink-0 mt-0.5 text-neutral-300" />
                <p>By submitting, you agree to our Professional Partner Terms. Your documents are encrypted and used only for verification.</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          {mutation.isError && (
            <div className="error-banner mt-4 flex items-center gap-2" role="alert">
              <FiAlertCircle size={14} className="flex-shrink-0 text-red-500" />
              {mutation.error?.message || 'Submission failed. Please try again.'}
            </div>
          )}

          <div className="flex items-center gap-3 mt-6">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="btn btn-outline flex items-center gap-1.5"
              >
                <FiChevronLeft size={15} /> Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
                className="btn btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                Continue <FiChevronRight size={15} />
              </button>
            ) : (
              <button
                onClick={() => mutation.mutate()}
                disabled={!canNext() || loading}
                className="btn btn-brand flex-1 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <> Submit application <FiArrowRight size={15} /> </>
                }
              </button>
            )}
          </div>

          <p className="text-center text-xs text-neutral-400 mt-4">
            Already a partner?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-neutral-700 font-medium hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProRegister
