import { useEffect, useState } from "react";
import { TermsOfService } from "../types";

export default function useCGU() {
  const [loading, setLoading] = useState(false);
  const [cgu, setCgu] = useState<TermsOfService | undefined>(undefined);

  const fetchCgu = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cgu`);
      if (!response.ok) {
        return;
      }
      setCgu((await response.json()) as unknown as TermsOfService);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCgu().then(console.log).catch(console.error);
  }, []);

  return { cgu, loading };
}
