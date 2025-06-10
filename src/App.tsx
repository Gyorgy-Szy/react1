import { useState } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Header from './components/Header'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function App() {
  const [count, setCount] = useState(0)
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col items-center space-y-8">
          <div className="flex items-center space-x-8">
            <a
              href="https://vite.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-110"
            >
              <img src={viteLogo} className="h-24 w-24" alt="Vite logo" />
            </a>
            <a
              href="https://react.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-110"
            >
              <img
                src={reactLogo}
                className="h-24 w-24 animate-spin"
                alt="React logo"
                style={{ animationDuration: '20s' }}
              />
            </a>
          </div>

          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {t('title')}
            </h1>
            <Badge variant="secondary" className="text-sm">
              Vite + React + TypeScript + shadcn/ui
            </Badge>
          </div>

          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Interactive Counter</CardTitle>
              <CardDescription>
                Click the button to increment the counter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <Button
                  onClick={() => setCount((count) => count + 1)}
                  size="lg"
                  className="min-w-[200px]"
                >
                  {t('count', { count })}
                </Button>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                <Trans i18nKey="edit">
                  Edit <code className="bg-muted px-1 py-0.5 rounded text-xs">src/App.tsx</code> and save to test HMR
                </Trans>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-muted-foreground max-w-md">
            {t('clickLogos')}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
