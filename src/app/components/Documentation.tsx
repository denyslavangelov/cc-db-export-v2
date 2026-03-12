export default function Documentation() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex justify-center px-4 pt-10">
      <div className="w-full max-w-3xl rounded-3xl p-6 bg-gray-800/60 backdrop-blur-xl shadow-2xl border border-gray-700/30">
        <h1 className="text-2xl font-semibold text-gray-100 mb-4">
          CC Package Export – Overview
        </h1>

        <section className="mb-4">
          <h2 className="text-sm font-semibold text-gray-200 mb-1">Purpose</h2>
          <p className="text-sm text-gray-300">
            Generate all country-specific CC lists for Coke SMS from two Excel sources, with optional
            Dimensions <code className="text-xs px-1 py-0.5 rounded bg-gray-900/60 border border-gray-700/70">.mdd</code> update.
            Supports two target platforms: <span className="font-semibold">iField</span> (multi-sheet Excel) and{" "}
            <span className="font-semibold">Dimensions</span> (text files + updated MDD).
          </p>
        </section>

        <section className="mb-4">
          <h2 className="text-sm font-semibold text-gray-200 mb-1">Inputs</h2>
          <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
            <li>
              <span className="font-semibold">Country questions workbook</span> –{" "}
              <span className="italic">"Coke SMS - Country specific questions_Linked with Q&apos;re"</span>{" "}
              (sheets: <code>qCountry</code>, <code>Family Brands</code>, <code>Education</code>,{" "}
              <code>S6 INCOME</code>).
            </li>
            <li>
              <span className="font-semibold">Package (wave) workbook</span> – INDEX, MAIN BRAND LIST, DIARY BRAND
              LIST, IMAGERY, EQUITY LIST, SUB CATEGORY LIST, CONTAINERS.
            </li>
            <li>
              <span className="font-semibold">Optional MDD</span> – IBM MR / Dimensions{" "}
              <code className="text-xs px-1 py-0.5 rounded bg-gray-900/60 border border-gray-700/70">.mdd</code> or{" "}
              <code className="text-xs px-1 py-0.5 rounded bg-gray-900/60 border border-gray-700/70">.xml</code> to
              update FAMILY_BRANDS, Education, and INCOME_LIST (Dimensions only).
            </li>
          </ul>
        </section>

        <section className="mb-4">
          <h2 className="text-sm font-semibold text-gray-200 mb-1">Workflow (tabs on Export screen)</h2>
          <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
            <li>
              Upload the <span className="font-semibold">country questions workbook</span> (Step&nbsp;1 in Export tab).
            </li>
            <li>
              <span className="font-semibold">Choose country</span> from <code>qCountry</code> (Step&nbsp;2) to filter
              Family Brands, Education and S6 INCOME.
            </li>
            <li>
              Upload the <span className="font-semibold">package (wave) workbook</span> (Step&nbsp;3).
            </li>
            <li>
              Select <span className="font-semibold">platform</span> (iField or Dimensions) (Step&nbsp;4).
            </li>
            <li>
              Optionally upload an <span className="font-semibold">MDD</span> file (for Dimensions MDD update) (Step&nbsp;5).
            </li>
            <li>
              Click <span className="font-semibold">“Export all lists”</span> to generate the files for the selected country.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-200 mb-1">Outputs</h2>
          <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
            <li>
              <span className="font-semibold">iField</span> – single{" "}
              <code className="text-xs px-1 py-0.5 rounded bg-gray-900/60 border border-gray-700/70">
                CC_LISTS_EXPORT_&lt;COUNTRY&gt;_IFIELD.xlsx
              </code>{" "}
              with brand lists, imagery list, diary categories, and FAMILY_BRANDS_LIST / EDUCATION_LIST /
              INCOME_LIST sheets.
            </li>
            <li>
              <span className="font-semibold">Dimensions</span> –{" "}
              <code className="text-xs px-1 py-0.5 rounded bg-gray-900/60 border border-gray-700/70">
                CC_LISTS_EXPORT_&lt;COUNTRY&gt;_DIMENSIONS.zip
              </code>{" "}
              containing .txt lists (MAIN_BRANDLIST, DIARY_BRANDLIST, EQUITY_BRANDLIST, IMAGERY_LIST,
              DIARY_CATEGORIES, ALL_LISTS) and, if provided and updated, an MDD copy.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

