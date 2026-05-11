import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

/**
 * SelectionContext — Klick-Routing zwischen Widgets.
 *
 * Idee: Source-Widget (z.B. Quest-Liste) und Detail-Widget arbeiten ueber
 * einen gemeinsamen "Channel". Source registriert seine Items + selektiert
 * beim Klick. Detail liest das selektierte Item. Pfeile aussen blaettern
 * durch die Items des AKTIVEN Channels (= zuletzt geklicktes Source-Widget).
 *
 * Verwendung:
 *   - Container wrappt Inhalt mit `<SelectionProvider>`
 *   - Source-Widget: `const ch = useChannel("quest")`
 *     useEffect: `ch.setItems(quests)`
 *     onClick: `ch.select(quest.id)`
 *   - Detail-Widget: `const ch = useChannel("quest")`
 *     rendert `ch.items.find(i => i.id === ch.selectedId)`
 *   - Container: `const nav = useNavigation()` → an PageGrid `navApi` passen
 *
 * Channel-IDs sind String-Konventionen. Z.B. "quest", "skill", "event", "log".
 */

interface ChannelItem {
  id: string
}

interface ChannelState<T extends ChannelItem = ChannelItem> {
  items: T[]
  selectedId: string | null
}

interface SelectionContextValue {
  // Pro Channel-Id ein State
  channels: Record<string, ChannelState>
  activeChannelId: string | null
  // Source-Widget aktualisiert seine Items (nicht aktiv-setzend)
  setChannelItems: (channelId: string, items: ChannelItem[]) => void
  // Klick im Source-Widget: setzt selectedId + macht den Channel aktiv
  selectInChannel: (channelId: string, itemId: string | null) => void
  // Pfeile rotieren durch den aktiven Channel
  goPrev: () => void
  goNext: () => void
  // Aktiver Channel hat genug Items zum Rotieren?
  canNavigate: boolean
}

const SelectionContext = createContext<SelectionContextValue | null>(null)

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [channels, setChannels] = useState<Record<string, ChannelState>>({})
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null)

  const setChannelItems = useCallback((channelId: string, items: ChannelItem[]) => {
    setChannels((prev) => {
      const existing = prev[channelId]
      // Wenn Item-IDs identisch sind: gleiche Referenz behalten, damit Effects nicht feuern
      if (existing) {
        const sameLen = existing.items.length === items.length
        const sameIds = sameLen && existing.items.every((it, i) => it.id === items[i]?.id)
        if (sameIds) return prev
      }
      return {
        ...prev,
        [channelId]: {
          items,
          selectedId: existing?.selectedId ?? null,
        },
      }
    })
  }, [])

  const selectInChannel = useCallback(
    (channelId: string, itemId: string | null) => {
      setChannels((prev) => ({
        ...prev,
        [channelId]: {
          items: prev[channelId]?.items ?? [],
          selectedId: itemId,
        },
      }))
      // Auswahl macht den Channel aktiv (auch wenn itemId === null — Reset)
      setActiveChannelId(itemId === null ? null : channelId)
    },
    []
  )

  const rotate = useCallback((dir: 1 | -1) => {
    setChannels((prev) => {
      if (!activeChannelId) return prev
      const ch = prev[activeChannelId]
      if (!ch || ch.items.length === 0) return prev
      const idx = ch.items.findIndex((i) => i.id === ch.selectedId)
      const len = ch.items.length
      const newIdx = idx < 0 ? 0 : (idx + dir + len) % len
      return {
        ...prev,
        [activeChannelId]: { ...ch, selectedId: ch.items[newIdx].id },
      }
    })
  }, [activeChannelId])

  const goPrev = useCallback(() => rotate(-1), [rotate])
  const goNext = useCallback(() => rotate(1), [rotate])

  const canNavigate = useMemo(() => {
    if (!activeChannelId) return false
    const ch = channels[activeChannelId]
    return (ch?.items.length ?? 0) > 1
  }, [activeChannelId, channels])

  const value = useMemo(
    () => ({
      channels,
      activeChannelId,
      setChannelItems,
      selectInChannel,
      goPrev,
      goNext,
      canNavigate,
    }),
    [channels, activeChannelId, setChannelItems, selectInChannel, goPrev, goNext, canNavigate]
  )

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>
}

/**
 * useChannel — Zugang zu einem konkreten Channel.
 * Source nutzt setItems + select. Detail nutzt items + selectedId.
 */
export function useChannel<T extends ChannelItem = ChannelItem>(channelId: string) {
  const ctx = useContext(SelectionContext)
  if (!ctx) {
    throw new Error("useChannel must be used within <SelectionProvider>")
  }
  const { channels, setChannelItems, selectInChannel, activeChannelId } = ctx
  const channel = channels[channelId] as ChannelState<T> | undefined

  const setItems = useCallback(
    (items: T[]) => setChannelItems(channelId, items),
    [channelId, setChannelItems]
  )
  const select = useCallback(
    (itemId: string | null) => selectInChannel(channelId, itemId),
    [channelId, selectInChannel]
  )

  return {
    items: channel?.items ?? [],
    selectedId: channel?.selectedId ?? null,
    selected: channel?.items.find((i) => i.id === channel.selectedId) ?? null,
    setItems,
    select,
    isActive: activeChannelId === channelId,
  }
}

/**
 * useChannelSync — registriert Items in einem Channel und haelt sie aktuell.
 * Convenience-Hook fuer Source-Widgets die ihre Items aus einem Hook lesen.
 */
export function useChannelSync<T extends ChannelItem>(channelId: string, items: T[]) {
  const ctx = useContext(SelectionContext)
  if (!ctx) {
    throw new Error("useChannelSync must be used within <SelectionProvider>")
  }
  const { setChannelItems } = ctx
  const lastRef = useRef<T[] | null>(null)
  useEffect(() => {
    // Nur setzen wenn sich was geaendert hat (Identity oder Laenge oder IDs)
    if (lastRef.current === items) return
    lastRef.current = items
    setChannelItems(channelId, items)
  }, [channelId, items, setChannelItems])
}

/**
 * useNavigation — fuer Container die Pfeile rendern (z.B. PageGrid via navApi-Prop).
 */
export function useNavigation() {
  const ctx = useContext(SelectionContext)
  if (!ctx) {
    throw new Error("useNavigation must be used within <SelectionProvider>")
  }
  const { goPrev, goNext, canNavigate, activeChannelId } = ctx
  return {
    prev: goPrev,
    next: goNext,
    canPrev: canNavigate,
    canNext: canNavigate,
    activeChannelId,
  }
}
