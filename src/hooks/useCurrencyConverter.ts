import { useState, useEffect, useCallback } from "react";

// Currency codes by country
export const COUNTRY_CURRENCIES: Record<string, string> = {
  EC: "USD",
  COL: "COP",
  GT: "GTQ",
  RD: "DOP",
  CR: "CRC",
  MX: "MXN",
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  COP: "$",
  GTQ: "Q",
  DOP: "RD$",
  CRC: "₡",
  MXN: "$",
};

interface ExchangeRates {
  [key: string]: number;
}

interface UseCurrencyConverterReturn {
  rates: ExchangeRates;
  isLoading: boolean;
  lastUpdated: Date | null;
  convert: (amount: number, fromCurrency: string, toCurrency: string) => number;
  convertToCountry: (amount: number, fromCurrency: string, toCountryCode: string) => number;
  formatCurrency: (amount: number, currencyCode: string) => string;
  getCurrencyForCountry: (countryCode: string) => string;
  refetchRates: () => Promise<void>;
}

export function useCurrencyConverter(): UseCurrencyConverterReturn {
  const [rates, setRates] = useState<ExchangeRates>({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRates = useCallback(async () => {
    setIsLoading(true);
    try {
      // Using ExchangeRate-API (free tier - 1500 requests/month)
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch exchange rates");
      }
      
      const data = await response.json();
      setRates(data.rates);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      // Fallback rates (approximate)
      setRates({
        USD: 1,
        COP: 4150,
        GTQ: 7.85,
        DOP: 58.5,
        CRC: 515,
        MXN: 17.2,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
    // Refresh rates every hour
    const interval = setInterval(fetchRates, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchRates]);

  const convert = useCallback(
    (amount: number, fromCurrency: string, toCurrency: string): number => {
      if (fromCurrency === toCurrency) return amount;
      if (!rates[fromCurrency] || !rates[toCurrency]) return amount;

      // Convert to USD first, then to target currency
      const amountInUSD = amount / rates[fromCurrency];
      return amountInUSD * rates[toCurrency];
    },
    [rates]
  );

  const convertToCountry = useCallback(
    (amount: number, fromCurrency: string, toCountryCode: string): number => {
      const toCurrency = COUNTRY_CURRENCIES[toCountryCode] || "USD";
      return convert(amount, fromCurrency, toCurrency);
    },
    [convert]
  );

  const formatCurrency = useCallback(
    (amount: number, currencyCode: string): string => {
      const symbol = CURRENCY_SYMBOLS[currencyCode] || "$";
      
      // Format based on currency
      if (currencyCode === "COP" || currencyCode === "CRC") {
        // Large numbers, no decimals
        return `${symbol}${Math.round(amount).toLocaleString()}`;
      }
      
      // Standard format with 2 decimals
      return `${symbol}${amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
    []
  );

  const getCurrencyForCountry = useCallback((countryCode: string): string => {
    return COUNTRY_CURRENCIES[countryCode] || "USD";
  }, []);

  return {
    rates,
    isLoading,
    lastUpdated,
    convert,
    convertToCountry,
    formatCurrency,
    getCurrencyForCountry,
    refetchRates: fetchRates,
  };
}
