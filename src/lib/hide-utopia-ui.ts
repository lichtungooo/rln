// utopia-ui rendert schwebende Widget-Cards, eine eigene Navbar, Sidebar
// und Leaflet-Controls, die wir im Real Life Network nicht zeigen möchten.
//
// Wir entfernen sie komplett aus dem DOM — ein MutationObserver erwischt
// auch spätere Re-Renders, und ein kurzer Interval-Wächter hilft gegen
// spät hinzukommende Elemente.

// Selektoren, bei denen wir das Element im Ganzen entfernen.
const REMOVE_SELECTORS = [
  // Leaflet-Controls, die wir durch eigene ersetzen
  '.leaflet-control-locate',
  '.leaflet-control-attribution',
  // utopia-ui NavBar und Sidebar, falls gerendert
  '[id="sidenav"]',
  '[id="my_modal_3"]',
  // utopia-ui SearchControl: Input mit tw:input-bordered
  'input.tw\\:input-bordered',
  'input[class*="tw:input-bordered"]',
]

// Selektoren, bei denen wir Elemente per className-Kombination erkennen.
// Diese Widgets sind schwebende daisyUI-Cards mit sehr spezifischer
// Klassen-Kombination, die utopia-ui für seine Steuerelemente nutzt.
const CLASS_COMBINATIONS = [
  // Quadratische floating-Widget-Cards: 12x12 und 10x10
  ['tw:card', 'tw:flex-none', 'tw:h-12', 'tw:w-12'],
  ['tw:card', 'tw:flex-none', 'tw:h-10', 'tw:w-10'],
  // utopia-ui SearchControl-Container (100vw-2rem breit, max 22rem)
  ['tw:w-[calc(100vw-2rem)]'],
  ['tw:max-w-[22rem]'],
  // Antons eigene Navbar-Container
  ['tw:navbar'],
  ['tw:drawer'],
  ['tw:sidebar'],
]

function elementMatchesAnyCombination(el: HTMLElement): boolean {
  const className =
    typeof el.className === 'string'
      ? el.className
      : (el.className as unknown as { baseVal?: string })?.baseVal ?? ''
  const classes = className.split(/\s+/)
  return CLASS_COMBINATIONS.some((combination) =>
    combination.every((cls) => classes.includes(cls)),
  )
}

function hideOnce() {
  // Variante 1: feste Selektoren
  for (const selector of REMOVE_SELECTORS) {
    document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
      el.remove()
    })
  }

  // Variante 2: Klassen-Kombinationen
  document.querySelectorAll<HTMLElement>('div, aside, nav').forEach((el) => {
    if (elementMatchesAnyCombination(el)) {
      el.remove()
    }
  })
}

let observer: MutationObserver | null = null
let intervalId: number | null = null

export function startHidingUtopiaUi() {
  hideOnce()

  if (!observer) {
    observer = new MutationObserver(() => hideOnce())
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    })
  }

  if (intervalId === null) {
    intervalId = window.setInterval(hideOnce, 300)
    window.setTimeout(() => {
      if (intervalId !== null) {
        window.clearInterval(intervalId)
        intervalId = null
      }
    }, 15000)
  }
}
