import { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import Header from "./components/Header";

function App() {
  const [count, setCount] = useState(0);
  const { t } = useTranslation("general");

  return (
    <div className="page">
      <Header />
      <div className="page-content-large">
        <div className="flex flex-column items-center gap-large">
          <div className="text-center">
            <h1 className="text-large">Testing i18next translations</h1>
          </div>

          <div className="card">
            <div className="text-center mb-2">
              <h2 className="text-medium">Interactive Counter</h2>
              <p className="text-small text-muted">
                Click the button to increment the counter
              </p>
            </div>

            <div className="mb-2">
              <div className="flex justify-center">
                <button
                  onClick={() => setCount((count) => count + 1)}
                  className="btn-primary"
                >
                  {t("count", { count })}
                </button>
              </div>

              <div className="text-center text-small text-muted mt-2">
                <Trans i18nKey="editCode">
                  Edit <code>src/App.tsx</code> and save to test HMR
                </Trans>
              </div>
            </div>
          </div>

          <div
            className="text-left text-small"
            style={{ maxWidth: "800px", lineHeight: "1.6" }}
          >
            <h2 className="text-medium mb-2">
              Migrating from Localize to i18next: Key Considerations
            </h2>

            <h3 className="text-small mb-1">
              <strong>Database-Driven Translation Storage</strong>
            </h3>
            <p className="mb-2">
              Moving translations from Localize to database storage provides
              full control over translation data. This eliminates third-party
              dependencies and enables custom workflows. Consider implementing
              proper database indexing for language_code and namespace columns.
              If needed, we can use a more robust database structure, handling
              pluralization, fallback translations and namespace separations.
            </p>

            <h3 className="text-small mb-1">
              <strong>Vendor Self-Service Translation Portal</strong>
            </h3>
            <p className="mb-2">
              Creating a web interface for vendors to manage their translations
              requires user authentication, role-based access control, and
              translation conflict resolution. We can add tools like detect
              untranslated fields, if needed.
            </p>

            <h3 className="text-small mb-1">
              <strong>Legacy System Integration</strong>
            </h3>
            <p className="mb-2">
              Legacy parts of the application may use different translation
              formats or loading mechanisms. Plan for gradual migration with
              backward compatibility layers. Consider creating translation
              bridges that can serve both old and new systems during the
              transition period.
            </p>

            <h3 className="text-small mb-1">
              <strong>Import/Export and Validation</strong>
            </h3>
            <p className="mb-2">
              Implement robust JSON validation for uploaded translation files.
              Check for proper structure, required keys, interpolation syntax
              validation, and namespace consistency. Provide detailed error
              reporting and preview functionality before applying imports.
            </p>
            <p className="mb-2">
              We need more info on the format/workflow of the vendors' current
              translations. Need to find best practice to import their already
              available translations.
            </p>

            <h3 className="text-small mb-1">
              <strong>Lazy Loading and Performance</strong>
            </h3>
            <p className="mb-2">
              Implement namespace-based lazy loading to reduce initial bundle
              size. Load translations on-demand based on route changes or
              feature usage.
            </p>

            <h3 className="text-small mb-1">
              <strong>RTL Language Support</strong>
            </h3>
            <p className="mb-2">
              Supporting right-to-left languages requires careful CSS planning.
              Use logical properties (margin-inline-start instead of
              margin-left), implement proper text direction detection, and test
              layout extensively with RTL content. Consider using CSS-in-JS
              solutions for dynamic direction switching.
            </p>

            <h3 className="text-small mb-1">
              <strong>Translation Platform Options</strong>
            </h3>
            <div className="mb-2">
              <p>
                <strong>Build Custom Solution:</strong> Full control, integrated
                with existing systems, custom workflows, but requires
                significant development time.
              </p>
              <p>
                <strong>Open Source Alternatives:</strong> Weblate, Crowdin
                Community, Pontoon - good middle ground with customization
                options.
              </p>
              <p>
                <strong>Hosted Solutions:</strong> Phrase, Lokalise, Crowdin -
                faster setup but reintroduce third-party dependencies.
              </p>
            </div>

            <h2 className="text-medium mb-2 mt-3">Feasibility Report</h2>
            <div className="mb-2">
              <p>
                <strong>Technical Feasibility:</strong> High - i18next is mature
                and well-documented with extensive React integration.
              </p>
              <p>
                <strong>Timeline Estimate:</strong>
                There are still areas we need to plan (like database structure
                etc.) Also, counting the legacy state of some of the code, the
                migration can take at least 2 months on the development side,
                and need to count extra time for the export/import of the
                existing translations, the learning curve for the admins as
                well. That makes at least 4-5 months total.
              </p>
              <p>
                There is a learning curve for all participants we need to
                consider, and all code changes may introduce new elements. Need
                to introduce new workflow to ensure translation integrity. There
                is also possibility for new needs from vendors (pluralization,
                extra design for different languages etc.)
              </p>
              <p>
                <strong>Risk Assessment:</strong> Medium - main risks are data
                migration integrity and legacy system compatibility.
              </p>
            </div>

            <h2 className="text-medium mb-2">Notes</h2>
            <ul className="text-small" style={{ paddingLeft: "20px" }}>
              <li>Ltr-rtl may affect desing in unexcepted ways!</li>
              <li>Translation of texts from database</li>
              <li>Possiblilty for "case switch" messages</li>
              <li>
                If item is missing, and no fallback: item key will be displayed.
                Item keys can be full text as well
              </li>
              <li>
                Interval plurals (1-5: some, 6-10: a handful of, 10+: a lot
                of...)
              </li>
              <li>
                i18next can handle arrays (interpolation, join) objects (and
                plurals inside object etc.)
              </li>
              <li>.</li>
            </ul>

            <h2 className="text-medium mb-2">Migration Process</h2>
            <ol className="text-small" style={{ paddingLeft: "20px" }}>
              <li>
                Audit existing Localize implementation, export possibilities and
                translation keys.
              </li>
              <li>
                Design database schema for translations with namespaces,
                versioning, fallback handling etc.
              </li>
              <li>Set up i18next configuration with database backend</li>
              <li>
                Create translation data migration scripts from Localize export
              </li>
              <li>Implement custom i18next backend with custom checks</li>
              <li>
                Build vendor translation management interface (standalone or
                integrated in configuration tool?)
              </li>
              <li>
                Create translation import/export functionality with validation
              </li>
              <li>Set up lazy loading for namespaces and languages</li>
              <li>
                Implement dynamic language switching with proper fallbacks
              </li>
              <li>Add RTL language support and CSS logical properties</li>
              <li>Create translation caching and invalidation strategies</li>
              <li>Build translation conflict resolution workflows</li>
              <li>Implement translation history and version tracking</li>
              <li>Set up automated testing for translation completeness</li>
              <li>Create deployment pipelines for translation updates</li>
              <li>
                Migrate legacy components gradually with compatibility layers
              </li>
              <li>
                Perform comprehensive testing across all languages and features
              </li>
              <li>Train vendors on new translation management system</li>
              <li>Monitor performance and optimize based on usage patterns</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
