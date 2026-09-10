/* global siteConfig */

// Light / dark resolution for the Carbon Logica theme.
// Precedence: the top-bar toggle (this browser, localStorage) > the user's profile appearance
// (JWT `ap`, set in Profile > Appearance) > the site default (Administration > Theme).
// Saving the profile clears the browser override so the profile choice takes effect again.

const STORAGE_KEY = 'cl-appearance'

function readOverride () {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    return (v === 'light' || v === 'dark') ? v : ''
  } catch (err) {
    return ''
  }
}

export function resolveDarkMode (store) {
  const override = readOverride()
  if (override) { return override === 'dark' }
  const profile = store.get('user/appearance') || ''
  if (profile === 'light' || profile === 'dark') { return profile === 'dark' }
  return siteConfig.darkMode === true
}

export function setOverride (mode) {
  try {
    if (mode === 'light' || mode === 'dark') {
      window.localStorage.setItem(STORAGE_KEY, mode)
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  } catch (err) {
    // storage unavailable (private mode); the toggle still applies for this page load
  }
}

export function clearOverride () {
  setOverride('')
}

export function hasOverride () {
  return readOverride() !== ''
}
