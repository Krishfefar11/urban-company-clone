import { Link } from 'react-router-dom'
import { FiTwitter, FiFacebook, FiInstagram, FiLinkedin } from 'react-icons/fi'

const FOOTER_LINKS = [
  {
    title: 'Company',
    links: [
      { label: 'About us',            to: '#' },
      { label: 'Investor relations',  to: '#' },
      { label: 'Careers',             to: '#' },
      { label: 'Press',               to: '#' },
    ],
  },
  {
    title: 'Customers',
    links: [
      { label: 'How it works', to: '#' },
      { label: 'Reviews',      to: '#' },
      { label: 'Contact us',   to: '#' },
      { label: 'Help centre',  to: '#' },
    ],
  },
  {
    title: 'Professionals',
    links: [
      { label: 'Register as pro',   to: '/pro/register' },
      { label: 'Pro dashboard',     to: '/pro/dashboard'},
      { label: 'Earnings',          to: '/pro/earnings' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy',    to: '#' },
      { label: 'Terms of service',  to: '#' },
      { label: 'Cookie policy',     to: '#' },
    ],
  },
]

const SOCIAL = [
  { Icon: FiTwitter,   label: 'Twitter',   href: '#' },
  { Icon: FiFacebook,  label: 'Facebook',  href: '#' },
  { Icon: FiInstagram, label: 'Instagram', href: '#' },
  { Icon: FiLinkedin,  label: 'LinkedIn',  href: '#' },
]

const Footer = () => (
  <footer className="bg-neutral-50 border-t border-neutral-100 mt-auto" role="contentinfo">
    <div className="page-container py-12 md:py-16">

      {/* Top grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">

        {/* Brand column */}
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <Link to="/" className="inline-flex items-center gap-2 mb-4" aria-label="UrbanClone home">
            <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-[10px]">UC</span>
            </div>
            <div className="leading-none">
              <p className="text-xs font-bold text-neutral-900">Urban</p>
              <p className="text-xs font-bold text-neutral-900">Company</p>
            </div>
          </Link>
          <p className="text-sm text-neutral-500 leading-relaxed mb-5 max-w-xs">
            India's most trusted home services platform — verified professionals, guaranteed quality.
          </p>
          <div className="flex gap-2" aria-label="Social media links">
            {SOCIAL.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-800 hover:border-neutral-400 transition-colors duration-150"
              >
                <Icon size={13} />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {FOOTER_LINKS.map(col => (
          <div key={col.title}>
            <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">
              {col.title}
            </h3>
            <ul className="space-y-2.5">
              {col.links.map(link => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* App download */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 py-8 border-t border-b border-neutral-200 mb-8">
        <p className="text-sm font-medium text-neutral-700">Download the app</p>
        <div className="flex gap-3 flex-wrap">
          <a
            href="#"
            className="inline-flex items-center gap-2 bg-neutral-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors duration-150"
          >
            <span aria-hidden="true" className="text-base">🍎</span>
            <span>App Store</span>
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 bg-neutral-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors duration-150"
          >
            <span aria-hidden="true" className="text-base">▶</span>
            <span>Google Play</span>
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-neutral-400 order-2 sm:order-1">
          © 2026 UrbanClone Technologies Pvt. Ltd. All rights reserved.
        </p>
        <div className="flex gap-4 order-1 sm:order-2">
          {['Privacy', 'Terms', 'Cookies'].map(l => (
            <Link
              key={l}
              to="#"
              className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors duration-150"
            >
              {l}
            </Link>
          ))}
        </div>
      </div>
    </div>
  </footer>
)

export default Footer
