export default function Documentation() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex justify-center px-4 pt-10">
      <div className="w-full max-w-3xl rounded-3xl p-6 bg-gray-800/60 backdrop-blur-xl shadow-2xl border border-gray-700/30 space-y-6">
        {/* Title */}
        <header>
          <p className="text-xs font-medium tracking-wide text-amber-300/80 uppercase mb-1">
            CC Package Export
          </p>
          <h1 className="text-2xl font-semibold text-gray-50">
            What this tool does
          </h1>
          <p className="mt-2 text-sm text-gray-300">
            One place to build all country-specific lists for Coke SMS, from Excel workbooks to ready-to-use
            files for <span className="font-semibold">iField</span> and{" "}
            <span className="font-semibold">Dimensions</span>.
          </p>
        </header>

        {/* Quick summary */}
        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-700/60 bg-gray-900/40 p-3">
            <h2 className="text-xs font-semibold text-gray-200 mb-1">In short</h2>
            <p className="text-xs text-gray-300">
              Take 2 Excel files (+ optional MDD) and output all CC brand / imagery / diary category lists for
              a single market.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-700/60 bg-gray-900/40 p-3">
            <h2 className="text-xs font-semibold text-gray-200 mb-1">Platforms</h2>
            <ul className="text-xs text-gray-300 space-y-0.5 list-disc list-inside">
              <li><span className="font-semibold">iField</span> – one multi-sheet <code>.xlsx</code></li>
              <li><span className="font-semibold">Dimensions</span> – <code>.txt</code> lists + updated <code>.mdd</code> (optional)</li>
            </ul>
          </div>
        </section>

        {/* Inputs */}
        <section>
          <h2 className="text-sm font-semibold text-gray-100 mb-2">1. Required inputs</h2>
          <div className="space-y-2 text-sm text-gray-300">
            <div>
              <p className="font-semibold text-gray-200">Country questions workbook</p>
              <p className="text-xs text-gray-400">
                File: <span className="italic">"Coke SMS - Country specific questions_Linked with Q&apos;re"</span>.
                Sheets needed: <code>qCountry</code>, <code>Family Brands</code>,{" "}
                <code>Education</code>, <code>S6 INCOME</code>.
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-200">Package (wave) workbook</p>
              <p className="text-xs text-gray-400">
                INDEX, MAIN BRAND LIST, DIARY BRAND LIST, IMAGERY, EQUITY LIST,
                SUB CATEGORY LIST, CONTAINERS. This is where the brand lists and diary categories come from.
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-200">Optional MDD (Dimensions only)</p>
              <p className="text-xs text-gray-400">
                IBM MR / Dimensions <code>.mdd</code> / <code>.xml</code>. Used to update{" "}
                <code>FAMILY_BRANDS</code>, the education variable (e.g. <code>edu_FIN</code>) and{" "}
                <code>INCOME_LIST</code> for the chosen market.
              </p>
            </div>
          </div>
        </section>

        {/* How to run it */}
        <section>
          <h2 className="text-sm font-semibold text-gray-100 mb-2">2. How to run the export</h2>
          <ol className="text-xs text-gray-300 space-y-1.5 list-decimal list-inside">
            <li>
              <span className="font-semibold">Upload country questions workbook</span> (Export step 1).
              The app validates required sheets and shows row counts.
            </li>
            <li>
              <span className="font-semibold">Choose country</span> (Export step 2). This filters Family Brands,
              Education and S6 INCOME to that market.
            </li>
            <li>
              <span className="font-semibold">Upload the package workbook</span> (Export step 3). This provides
              MAIN / DIARY / EQUITY brand lists, IMAGERY and DIARY_CATEGORIES.
            </li>
            <li>
              <span className="font-semibold">Select platform</span> (Export step 4):{" "}
              iField or Dimensions.
            </li>
            <li>
              <span className="font-semibold">Optional – upload MDD</span> (Export step 5, only relevant for
              Dimensions). If provided, the tool updates FAMILY_BRANDS, Education and INCOME_LIST in the MDD.
            </li>
            <li>
              Click <span className="font-semibold">Export all lists</span>. The app builds all lists and
              downloads the final file(s) for that market.
            </li>
          </ol>
        </section>

        {/* Outputs */}
        <section>
          <h2 className="text-sm font-semibold text-gray-100 mb-2">3. What you get</h2>
          <div className="space-y-3 text-xs text-gray-300">
            <div className="rounded-2xl border border-gray-700/60 bg-gray-900/40 p-3">
              <p className="font-semibold text-gray-200 mb-1">iField export</p>
              <p>
                One Excel file:{" "}
                <code className="px-1 py-0.5 rounded bg-gray-900/60 border border-gray-700/70">
                  CC_LISTS_EXPORT_&lt;COUNTRY&gt;_IFIELD.xlsx
                </code>
              </p>
              <ul className="mt-1 list-disc list-inside space-y-0.5">
                <li>Brand lists: <code>MAIN_BRANDLIST_&lt;ISO&gt;</code>, <code>DIARY_BRANDLIST_&lt;ISO&gt;</code>, <code>EQUITY_BRANDLIST_&lt;ISO&gt;</code></li>
                <li>Imagery + diary categories: <code>IMAGERY_LIST_&lt;ISO&gt;</code>, <code>DIARY_CATEGORIES_&lt;ISO&gt;</code></li>
                <li>CC_PACKAGE sheets: <code>FAMILY_BRANDS_LIST</code>, <code>EDUCATION_LIST</code>, <code>INCOME_LIST</code></li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-700/60 bg-gray-900/40 p-3">
              <p className="font-semibold text-gray-200 mb-1">Dimensions export</p>
              <p>
                One zip file:{" "}
                <code className="px-1 py-0.5 rounded bg-gray-900/60 border border-gray-700/70">
                  CC_LISTS_EXPORT_&lt;COUNTRY&gt;_DIMENSIONS.zip
                </code>
              </p>
              <ul className="mt-1 list-disc list-inside space-y-0.5">
                <li><code>MAIN_BRANDLIST_&lt;ISO&gt;.txt</code>, <code>DIARY_BRANDLIST_&lt;ISO&gt;.txt</code>, <code>EQUITY_BRANDLIST_&lt;ISO&gt;.txt</code></li>
                <li><code>IMAGERY_LIST_&lt;ISO&gt;.txt</code>, <code>DIARY_CATEGORIES_&lt;ISO&gt;.txt</code>, <code>ALL_LISTS_&lt;ISO&gt;.txt</code></li>
                <li>Updated <code>.mdd</code> (if you uploaded one and the update succeeded)</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

