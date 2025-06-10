import { useTranslation } from 'react-i18next'
import Header from '../../components/Header'

function Testbay() {
  const { t } = useTranslation(['testbay', 'general'])

  return (
    <div className="page">
      <Header />
      <div className="page-content">
        <div className="page-header">
          <h1 className="text-large">{t('testbay:title')}</h1>
          <p className="text-muted">
            {t('testbay:subtitle')}
          </p>
        </div>

        <div className="card">
          <div className="mb-3">
            <h2 className="text-medium flex items-center gap-small">
              🧪 {t('testbay:differentCases')}
            </h2>
          </div>
          
          <div className="mb-2">
            <div className="test-case mb-2">
              <div className="test-case-label">{t('testbay:exampleTextLabel')} (testbay:exampleTextLabel):</div>
              <div className="test-case-content">{t('testbay:exampleText')}</div>
            </div>
            
            <div className="test-case mb-2">
              <div className="test-case-label">{t('testbay:missingTranslationLabel')} (testbay:missingTranslation, not the "testbay:missingTranslationLabel"):</div>
              <div className="test-case-content">{t('testbay:missingTranslation')}</div>
            </div>
            
            <div className="test-case mb-2">
              <div className="test-case-label">{t('testbay:ltrOnlyLabel')}:</div>
              <div className="test-case-content" dir="ltr">One sentence in LTR</div>
            </div>
            
            <div className="test-case mb-2">
              <div className="test-case-label">{t('testbay:rtlOnlyLabel')}:</div>
              <div className="test-case-content" dir="rtl">جملة واحدة باللغة العربية</div>
            </div>
              
            <div className="test-case mb-2">
              <div className="test-case-label">Missing value</div>
              <div className="test-case-content">{t('general:neverfindme')}</div>
            </div>

            <div className="test-case mb-2">
              <div className="test-case-label">{t('testbay:htmlContentLabel')}:</div>
              <div className="test-case-content" dangerouslySetInnerHTML={{ __html: t('testbay:htmlContent') }} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="mb-3">
            <h2 className="text-medium flex items-center gap-small">
              📊 {t('testbay:debugInfo')}
            </h2>
            <p className="text-muted text-small">
              {t('testbay:debugInfoDesc')}
            </p>
          </div>
          
          <div className="debug-info">
            <div className="debug-item">
              <span className="debug-label">{t('testbay:currentLanguage')}:</span>
              <span className="debug-value">{t('testbay:languageValue')}</span>
            </div>
            <div className="debug-item">
              <span className="debug-label">{t('testbay:loadedNamespaces')}:</span>
              <span className="debug-value">testbay, general</span>
            </div>
            <div className="debug-item">
              <span className="debug-label">{t('testbay:browserDirection')}:</span>
              <span className="debug-value">{document.dir || 'ltr'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Testbay