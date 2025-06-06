import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './Config.css'

function Config() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const goBack = () => {
    navigate(-1)
  }

  return (
    <div className="config-page">
      <div className="config-header">
        <button className="back-button" onClick={goBack}>
          ←
        </button>
        <h1>{t('configuration')}</h1>
      </div>
      
      <div className="config-content">
        <div className="config-section">
          <h2>{t('general')}</h2>
          <div className="config-item">
            <label>{t('theme')}</label>
            <select>
              <option value="light">{t('light')}</option>
              <option value="dark">{t('dark')}</option>
            </select>
          </div>
        </div>
        
        <div className="config-section">
          <h2>{t('notifications')}</h2>
          <div className="config-item">
            <label>
              <input type="checkbox" />
              {t('enableNotifications')}
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Config