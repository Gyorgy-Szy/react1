import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getAvailableLanguages } from '../i18n-backend'
import LoadingSpinner from './LoadingSpinner'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from './theme-provider'
import { Home, Settings, Sun, Moon, Monitor } from 'lucide-react'

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  const [availableLanguages, setAvailableLanguages] = useState<Array<{code: string, name: string}>>([])
  const [isChangingLanguage, setIsChangingLanguage] = useState(false)

  useEffect(() => {
    const loadLanguages = async () => {
      const languages = await getAvailableLanguages()
      setAvailableLanguages(languages)
    }
    loadLanguages()
  }, [])

  const changeLanguage = async (lng: string) => {
    if (lng === i18n.language) return
    
    setIsChangingLanguage(true)
    try {
      await i18n.changeLanguage(lng)
    } finally {
      setIsChangingLanguage(false)
    }
  }

  const isHomePage = location.pathname === '/'

  if (isChangingLanguage) {
    return <LoadingSpinner message="Changing language..." />
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />
      case 'dark':
        return <Moon className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'system'] as const
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {!isHomePage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              title="Home"
            >
              <Home className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('language')}:</span>
            <Select value={i18n.language} onValueChange={changeLanguage}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={cycleTheme}
            title={`Current theme: ${theme}`}
          >
            {getThemeIcon()}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/config')}
            title={t('configuration')}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header