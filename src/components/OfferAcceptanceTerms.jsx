// Shorter, offer-specific acceptance text shown alongside the generated
// offer letter, before the candidate can e-sign and download it.
export default function OfferAcceptanceTerms() {
  return (
    <div className="max-h-80 space-y-4 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
      <h3 className="text-base font-bold text-slate-900">Offer Acceptance Agreement</h3>

      <section>
        <h4 className="font-semibold text-slate-900">1. Offer Contingency</h4>
        <p className="mt-1">
          This offer is contingent upon the terms described in the attached offer letter, satisfactory
          background verification, and confirmation of your legal right to work.
        </p>
      </section>

      <section>
        <h4 className="font-semibold text-slate-900">2. At-Will Reaffirmation</h4>
        <p className="mt-1">
          Your employment, if you accept, will remain at-will as described in the terms and conditions you
          previously accepted.
        </p>
      </section>

      <section>
        <h4 className="font-semibold text-slate-900">3. Non-Disclosure of Offer Terms</h4>
        <p className="mt-1">
          You agree to keep the compensation and terms described in your offer letter confidential, except as
          required by law or to your immediate family or advisors.
        </p>
      </section>

      <section>
        <h4 className="font-semibold text-slate-900">4. Governing Law</h4>
        <p className="mt-1">
          This agreement is governed by the laws applicable in the jurisdiction where the position is based,
          without regard to conflict-of-law principles.
        </p>
      </section>

      <section>
        <h4 className="font-semibold text-slate-900">5. Electronic Signature</h4>
        <p className="mt-1">
          By typing your name below and clicking &quot;Accept &amp; Sign&quot;, you are electronically signing
          this agreement and accepting the attached offer letter in full.
        </p>
      </section>
    </div>
  )
}
