import { Card, CardContent, CardHeader, CardTitle } from '@real-life-stack/toolkit'
import { Calendar as CalendarIcon, MapPin } from 'lucide-react'
import { demoVeranstaltungen } from '@/data/demo'

export function CalendarView() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarIcon className="h-5 w-5" />
            Nächste Veranstaltungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {demoVeranstaltungen.map((event) => {
            const start = event.start ? new Date(event.start) : null
            return (
              <div
                key={event.id}
                className="flex items-start gap-3 rounded-lg bg-muted/40 p-4 transition-colors hover:bg-muted"
              >
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <span className="text-[10px] font-medium uppercase">
                    {start?.toLocaleDateString('de-DE', { month: 'short' })}
                  </span>
                  <span className="text-lg font-semibold leading-none">
                    {start?.getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-medium text-foreground">{event.name}</p>
                  <p className="text-sm text-muted-foreground">{event.text}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {start?.toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      Uhr
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
