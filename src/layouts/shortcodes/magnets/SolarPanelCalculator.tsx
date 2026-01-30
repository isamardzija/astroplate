import React, { useState } from "react";

interface FormData {
  squareFootage: string;
  solarValue: string;
  email: string;
}

interface ValidationErrors {
  squareFootage?: string;
  solarValue?: string;
  email?: string;
}

export default function SolarInsuranceLeadForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<FormData>({
    squareFootage: "",
    solarValue: "",
    email: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [estimate, setEstimate] = useState<{
    low: number;
    high: number;
  } | null>(null);
  const [showEstimate, setShowEstimate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateSquareFootage = (value: string): string | undefined => {
    const num = parseFloat(value);
    if (!value) return "Obavezno polje";
    if (isNaN(num) || num <= 0) return "Mora biti pozitivan broj";
    return undefined;
  };

  const validateSolarValue = (value: string): string | undefined => {
    const num = parseFloat(value);
    if (!value) return "Obavezno polje";
    if (isNaN(num)) return "Mora biti broj";
    if (num < 3000) return "Minimalna vrijednost je €3,000";
    if (num > 100000) return "Maksimalna vrijednost je €100,000";
    return undefined;
  };

  const validateEmail = (value: string): string | undefined => {
    if (!value) return "Obavezno polje";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Unesite valjanu email adresu";
    return undefined;
  };

  // Handle input changes without real-time validation
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate estimate
  const calculateEstimate = () => {
    const footage = parseFloat(formData.squareFootage);
    const solar = parseFloat(formData.solarValue);

    const houseValue = footage * 1000;
    const low = houseValue * 0.0004 + solar * 0.0015;
    const high = houseValue * 0.001 + solar * 0.0015;

    return { low, high };
  };

  // Handle step 1 submission
  const handleShowEstimate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const footageError = validateSquareFootage(formData.squareFootage);
    const solarError = validateSolarValue(formData.solarValue);

    if (footageError || solarError) {
      setErrors({
        squareFootage: footageError,
        solarValue: solarError,
      });
      return;
    }

    const calculated = calculateEstimate();
    setEstimate(calculated);

    // First move to step 2, then show estimate after a brief delay
    setStep(2);
    setTimeout(() => {
      setShowEstimate(true);
    }, 100);
  };

  // Handle final form submission
  const handleFinalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailError = validateEmail(formData.email);

    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }));
      return;
    }

    // Show loading state
    setIsSubmitting(true);

    // Submit the form to Netlify
    const form = e.currentTarget;
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(form) as any).toString(),
    })
      .then(() => {
        // Show success step
        setIsSubmitting(false);
        setStep(3);
      })
      .catch((error) => {
        setIsSubmitting(false);
        alert("Došlo je do greške. Molimo pokušajte ponovno.");
        console.error(error);
      });
  };

  // Reset form to start over
  const handleRestart = () => {
    setStep(1);
    setFormData({
      squareFootage: "",
      solarValue: "",
      email: "",
    });
    setErrors({});
    setEstimate(null);
    setShowEstimate(false);
    setIsSubmitting(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("hr-HR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-12 p-8 bg-white rounded-2xl shadow-xl">
      {/* Progress Indicator */}
      <div className="mb-6 flex items-center justify-center gap-2 text-sm text-gray-600">
        <span className={step === 1 ? "font-semibold text-blue-600" : ""}>
          Korak 1 od 2
        </span>
        <span className="text-gray-400">→</span>
        <span className={step === 2 ? "font-semibold text-blue-600" : ""}>
          Korak 2 od 2
        </span>
      </div>

      {/* Heading - Only on Step 1 */}
      {step === 1 && (
        <>
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Izračunajte procjenu osiguranja za vašu nekretninu sa solarnim
            panelima
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Unesite osnovne podatke i odmah saznajte okvirnu cijenu
          </p>

          {/* Separator */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm text-gray-500">
                Podaci o nekretnini
              </span>
            </div>
          </div>
        </>
      )}

      {/* Step 1: Property Details */}
      {step === 1 && (
        <form onSubmit={handleShowEstimate} className="space-y-6">
          <div>
            <label
              htmlFor="squareFootage"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Kvadratura nekretnine (m²)
            </label>
            <input
              type="number"
              id="squareFootage"
              name="squareFootage"
              value={formData.squareFootage}
              onChange={(e) =>
                handleInputChange("squareFootage", e.target.value)
              }
              placeholder="npr. 120"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.squareFootage ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.squareFootage && (
              <p className="mt-1 text-sm text-red-600">
                {errors.squareFootage}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="solarValue"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Vrijednost solarne instalacije (€)
            </label>
            <input
              type="number"
              id="solarValue"
              name="solarValue"
              value={formData.solarValue}
              onChange={(e) => handleInputChange("solarValue", e.target.value)}
              placeholder="npr. 15000"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.solarValue ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.solarValue && (
              <p className="mt-1 text-sm text-red-600">{errors.solarValue}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Prikaži procjenu
          </button>
        </form>
      )}

      {/* Estimate Display with Animation */}
      {showEstimate && estimate && step === 2 && (
        <div className="mb-8 animate-fadeIn">
          {/* Success Checkmark */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-scaleIn">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Vaša procjena osiguranja
            </h3>

            {/* Monthly Price - Main Focus */}
            <p className="text-3xl font-bold text-blue-600 mb-1">
              {formatCurrency(estimate.low / 12)} -{" "}
              {formatCurrency(estimate.high / 12)}
            </p>
            <p className="text-sm text-gray-600 mb-3">mjesečno</p>

            {/* Yearly Price - Secondary */}
            <p className="text-base text-gray-500">
              ({formatCurrency(estimate.low)} - {formatCurrency(estimate.high)}{" "}
              godišnje)
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Email Collection */}
      {step === 2 && (
        <div className="animate-fadeIn">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
              Želite detaljnu kalkulaciju police?
            </h3>

            {/* Benefits List */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-2">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm text-gray-700">
                  Personalizirana pokrivenost
                </span>
              </div>
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm text-gray-700">Dodatni popusti</span>
              </div>
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm text-gray-700">
                  Besplatna konzultacija
                </span>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleFinalSubmit}
            data-netlify="true"
            name="solar-insurance-leads"
            method="POST"
          >
            {/* Hidden fields for Netlify */}
            <input
              type="hidden"
              name="form-name"
              value="solar-insurance-leads"
            />
            <input
              type="hidden"
              name="solar-squareFootage"
              value={formData.squareFootage}
            />
            <input
              type="hidden"
              name="solar-solarValue"
              value={formData.solarValue}
            />
            <input
              type="hidden"
              name="solar-estimateLow"
              value={estimate?.low}
            />
            <input
              type="hidden"
              name="solar-estimateHigh"
              value={estimate?.high}
            />

            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Vaša email adresa
              </label>
              <input
                type="email"
                id="email"
                name="solar-email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="ime@primjer.hr"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                autoFocus
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
              <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Vaši podaci su sigurni
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Šaljem...
                </>
              ) : (
                "Pošalji mi detaljnu ponudu"
              )}
            </button>

            <p className="mt-3 text-center text-sm text-gray-600">
              Besplatno, bez obveze
            </p>
          </form>
        </div>
      )}

      {/* Step 3: Success Message */}
      {step === 3 && (
        <div className="animate-fadeIn text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-scaleIn">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Hvala na upitu!
          </h3>

          <p className="text-gray-700 mb-2">
            Primili smo vaš zahtjev i javit ćemo vam se uskoro na email adresu:
          </p>

          <p className="text-blue-600 font-medium mb-6">{formData.email}</p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              Naš tim će vam pripremiti detaljnu kalkulaciju police i
              kontaktirati vas u roku od 24 sata.
            </p>
          </div>

          <button
            onClick={handleRestart}
            className="w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            Izračunaj procjenu za drugu nekretninu
          </button>
        </div>
      )}

      {/* Inline CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out forwards;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
