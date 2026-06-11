import { useBookingStatus, STATUS_LABELS, STATUS_ORDER } from '../../hooks/useBookingStatus'
import { FiCheckCircle, FiCircle, FiWifi, FiWifiOff, FiLoader } from 'react-icons/fi'

const STEPS = [
  { key: 'pending',     label: 'Booking placed',       short: 'Placed'   },
  { key: 'confirmed',   label: 'Booking confirmed',    short: 'Confirmed'},
  { key: 'assigned',    label: 'Pro assigned',         short: 'Assigned' },
  { key: 'en_route',   label: 'Pro on the way',       short: 'En route' },
  { key: 'in_progress', label: 'Service in progress',  short: 'Active'   },
  { key: 'completed',  label: 'Completed',            short: 'Done'     },
]

const BookingTracker = ({ bookingId, initialStatus = 'pending' }) => {
  const { status, connected } = useBookingStatus(bookingId, initialStatus)

  const currentIndex = STEPS.findIndex(s => s.key === status)
  const info = STATUS_LABELS?.[status] || { label: status, bg: 'bg-neutral-100', color: 'text-neutral-600', dot: 'bg-neutral-400' }

  return (
    <div className="border border-neutral-100 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="font-bold text-neutral-900 text-sm">Live status</p>
          <p className="text-xs text-neutral-400 mt-0.5">Booking #{bookingId}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${info.bg} ${info.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${info.dot} ${status === 'in_progress' ? 'animate-pulse' : ''}`} />
            {info.label}
          </span>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${connected ? 'bg-brand-light' : 'bg-neutral-100'}`}
            title={connected ? 'Connected' : 'Reconnecting…'}>
            {connected
              ? <FiWifi    size={12} className="text-brand" />
              : <FiWifiOff size={12} className="text-neutral-400" />
            }
          </div>
        </div>
      </div>

      {/* Step timeline */}
      <div className="space-y-0">
        {STEPS.map((step, i) => {
          const done    = i < currentIndex
          const active  = i === currentIndex
          const pending = i > currentIndex
          return (
            <div key={step.key} className="flex gap-3">
              {/* Icon + line */}
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                  ${done   ? 'bg-brand'    : ''}
                  ${active ? 'bg-neutral-900 ring-4 ring-neutral-100' : ''}
                  ${pending? 'bg-neutral-100' : ''}`}>
                  {done    && <FiCheckCircle size={13} className="text-white" />}
                  {active  && (status === 'in_progress'
                    ? <FiLoader size={13} className="text-white animate-spin-slow" />
                    : <span className="w-2 h-2 rounded-full bg-white" />
                  )}
                  {pending && <span className="w-2 h-2 rounded-full bg-neutral-300" />}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-0.5 h-7 my-1 transition-colors ${done ? 'bg-brand' : 'bg-neutral-100'}`} />
                )}
              </div>

              {/* Label */}
              <div className="pb-1 pt-1 min-w-0">
                <p className={`text-sm leading-snug transition-colors
                  ${done    ? 'text-neutral-400 line-through' : ''}
                  ${active  ? 'font-bold text-neutral-900'   : ''}
                  ${pending ? 'text-neutral-300 font-medium'  : ''}`}>
                  {step.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BookingTracker
