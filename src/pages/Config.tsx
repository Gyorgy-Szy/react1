import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getAvailableLanguages } from '../i18n-backend'
import Header from '../components/Header'
import TranslationInput from '../components/TranslationInput'
import LoadingSpinner from '../components/LoadingSpinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Languages } from 'lucide-react'

interface Translation {
  key: string
  value: string
}

function Config() {
  const { t } = useTranslation()
  const [availableLanguages, setAvailableLanguages] = useState<Array<{code: string, name: string}>>([])
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [translations, setTranslations] = useState<Translation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveType, setSaveType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    const loadLanguages = async () => {
      const languages = await getAvailableLanguages()
      setAvailableLanguages(languages)
      if (languages.length > 0) {
        setSelectedLanguage(languages[0].code)
      }
    }
    loadLanguages()
  }, [])

  useEffect(() => {
    if (selectedLanguage) {
      loadTranslations(selectedLanguage)
    }
  }, [selectedLanguage])

  const loadTranslations = async (language: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/translations/${language}`)
      if (response.ok) {
        const data = await response.json()
        const translationArray = Object.entries(data.translations).map(([key, value]) => ({
          key,
          value: value as string
        }))
        setTranslations(translationArray)
        setSaveMessage('')
      }
    } catch (error) {
      console.error('Error loading translations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveTranslation = async (key: string, value: string) => {
    try {
      const response = await fetch(`/api/translations/${selectedLanguage}/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value })
      })

      if (response.ok) {
        setTranslations(prev => 
          prev.map(t => t.key === key ? { ...t, value } : t)
        )
        setSaveMessage(`Translation "${key}" saved successfully!`)
        setSaveType('success')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage(`Error saving translation "${key}"`)
        setSaveType('error')
      }
    } catch (error) {
      console.error('Error saving translation:', error)
      setSaveMessage(`Error saving translation "${key}"`)
      setSaveType('error')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-6 px-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('configuration')}</h1>
            <p className="text-muted-foreground">
              Manage your application settings and translations
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Translation Editor
              </CardTitle>
              <CardDescription>
                Edit translations for different languages. Changes are saved automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Select Language:</span>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Choose language" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLanguages.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {saveMessage && (
                <Alert className={saveType === 'error' ? 'border-destructive' : 'border-green-200'}>
                  {saveType === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                  <AlertDescription className={saveType === 'error' ? 'text-destructive' : 'text-green-700'}>
                    {saveMessage}
                  </AlertDescription>
                </Alert>
              )}

              {isLoading ? (
                <LoadingSpinner message="Loading translations..." />
              ) : (
                <div className="space-y-4">
                  {translations.map(translation => (
                    <TranslationInput
                      key={translation.key}
                      translationKey={translation.key}
                      value={translation.value}
                      onSave={saveTranslation}
                    />
                  ))}
                  {translations.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No translations found for this language.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Config