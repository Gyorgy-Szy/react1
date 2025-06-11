import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import LoadingSpinner from '../../../components/LoadingSpinner'

interface DelaySetting {
  id: number
  endpoint_name: string
  delay_ms: number
  description: string
  updated_at: string
}

interface DelaySettingsProps {
  onSaveMessage: (message: string, type: 'success' | 'error') => void
}

function DelaySettings({ onSaveMessage }: DelaySettingsProps) {
  const { t } = useTranslation(['config', 'general'], { useSuspense: true })
  const [delaySettings, setDelaySettings] = useState<DelaySetting[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingValues, setEditingValues] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    loadDelaySettings()
  }, [])

  const loadDelaySettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/delay-settings')
      if (response.ok) {
        const data = await response.json()
        setDelaySettings(data.settings)
        
        // Initialize editing values
        const initialValues: { [key: string]: number } = {}
        data.settings.forEach((setting: DelaySetting) => {
          initialValues[setting.endpoint_name] = setting.delay_ms
        })
        setEditingValues(initialValues)
      } else {
        throw new Error('Failed to load delay settings')
      }
    } catch (error) {
      console.error('Error loading delay settings:', error)
      onSaveMessage(t('config:delaySettingsError'), 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelayChange = (endpointName: string, newDelay: number) => {
    setEditingValues(prev => ({
      ...prev,
      [endpointName]: newDelay
    }))
  }

  const saveDelaySetting = async (endpointName: string) => {
    const newDelay = editingValues[endpointName]
    
    if (newDelay < 0) {
      onSaveMessage('Delay must be >= 0', 'error')
      return
    }

    try {
      const response = await fetch(`/api/delay-settings/${endpointName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ delay_ms: newDelay })
      })

      if (response.ok) {
        // Update local state
        setDelaySettings(prev => 
          prev.map(setting => 
            setting.endpoint_name === endpointName 
              ? { ...setting, delay_ms: newDelay }
              : setting
          )
        )
        onSaveMessage(t('config:delaySettingsSaved'), 'success')
      } else {
        throw new Error('Failed to save delay setting')
      }
    } catch (error) {
      console.error('Error saving delay setting:', error)
      onSaveMessage(t('config:delaySettingsError'), 'error')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, endpointName: string) => {
    if (e.key === 'Enter') {
      saveDelaySetting(endpointName)
    }
  }

  const formatEndpointName = (endpointName: string) => {
    return endpointName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  if (isLoading) {
    return <LoadingSpinner message={t('config:loadingDelaySettings')} />
  }

  return (
    <div className="delay-settings">
      <div className="mb-2">
        <div className="delay-settings-table">
          <div className="delay-settings-header">
            <div className="delay-settings-col">{t('config:endpoint')}</div>
            <div className="delay-settings-col">{t('config:delayMs')}</div>
            <div className="delay-settings-col-wide">{t('config:description')}</div>
            <div className="delay-settings-col">Actions</div>
          </div>
          
          {delaySettings.map(setting => (
            <div key={setting.endpoint_name} className="delay-settings-row">
              <div className="delay-settings-col">
                <strong>{formatEndpointName(setting.endpoint_name)}</strong>
              </div>
              <div className="delay-settings-col">
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={editingValues[setting.endpoint_name] || 0}
                  onChange={(e) => handleDelayChange(setting.endpoint_name, parseInt(e.target.value) || 0)}
                  onKeyPress={(e) => handleKeyPress(e, setting.endpoint_name)}
                  className="delay-input"
                />
              </div>
              <div className="delay-settings-col-wide">
                <span className="text-small text-muted">{setting.description}</span>
              </div>
              <div className="delay-settings-col">
                <button
                  onClick={() => saveDelaySetting(setting.endpoint_name)}
                  disabled={editingValues[setting.endpoint_name] === setting.delay_ms}
                  className="btn-save-small"
                >
                  {t('general:save')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DelaySettings