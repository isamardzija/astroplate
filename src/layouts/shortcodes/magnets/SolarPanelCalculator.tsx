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
  const [step, setStep] = useState<1 | 2>(1);
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

  // Validation functions
  const validateSquareFootage = (value: string): string | undefined => {
    const num = parseFloat(value);
    if (!value) return "Obavezno polje";
    if (isNaN(num) || num <= 0) return "Mora biti pozitivan broj";
    if (num < 40) return "Minimalna vrijednost je 40";
    if (num > 500) return "Maksimalna vrijednost je 500";
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

  // Handle input changes with real-time validation
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Real-time validation
    let error: string | undefined;
    if (field === "squareFootage") error = validateSquareFootage(value);
    if (field === "solarValue") error = validateSolarValue(value);
    if (field === "email") error = validateEmail(value);

    setErrors((prev) => ({ ...prev, [field]: error }));
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
  const handleShowEstimate = (e: React.FormEvent) => {
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
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(formData.email);

    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }));
      return;
    }

    // Form will be submitted by Netlify
    // Data is already in the form fields
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

      {/* Heading */}
      {step == 1 && (
        <>
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Izračunajte cijenu osiguranja
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Unesite osnovne podatke o kući i solarnoj elektrani
          </p>
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
              autoFocus
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
      {showEstimate && estimate && (
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
              Okvirna godišnja cijena
            </h3>
            <p className="text-3xl font-bold text-blue-600 mb-2">
              {formatCurrency(estimate.low)} - {formatCurrency(estimate.high)}
            </p>
            <p className="text-sm text-gray-600">Ovisno o odabranim rizicima</p>
          </div>
        </div>
      )}

      {/* Step 2: Email Collection */}
      {step === 2 && (
        <div className="animate-fadeIn">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
              Želite točan izračun?
            </h3>
            <p className="text-center">
              Unesite Vašu e-mail adresu kako biste dobili besplatnu ponudu.
            </p>

            {/* Benefits List */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-2 flex flex-col items-center">
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
                  Zaštita od realnih rizika
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
              name="squareFootage"
              value={formData.squareFootage}
            />
            <input
              type="hidden"
              name="solarValue"
              value={formData.solarValue}
            />
            <input type="hidden" name="estimateLow" value={estimate?.low} />
            <input type="hidden" name="estimateHigh" value={estimate?.high} />

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
                name="email"
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
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Pošalji mi detaljnu ponudu
            </button>

            <p className="mt-3 text-center text-sm text-gray-600">
              Besplatno, bez obveze
            </p>
          </form>
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

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
