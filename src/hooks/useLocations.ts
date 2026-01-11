import { useEffect, useState } from "react";

export default function useLocations(address?: any) {
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [selectedWard, setSelectedWard] = useState<any>(null);

  const ensureProvincesLoaded = async () => {
    if (provinces.length > 0) return provinces;
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/p/`);
      if (!res.ok) throw new Error("Failed to fetch provinces");
      const data = await res.json();
      const list = data || [];
      setProvinces(list);
      return list;
    } catch (err) {
      console.warn("Failed to load provinces", err);
      return [];
    }
  };

  useEffect(() => {
    (async () => {
      if (!address) return;
      if ((address as any)?.province_code || address?.province) {
        try {
          const provList = await ensureProvincesLoaded();
          const prov = provList.find((p: any) => String(p.code) === String((address as any).province_code) || p.name === address?.province);
          if (prov) {
            setSelectedProvince(prov);
            try {
              const dRes = await fetch(`https://provinces.open-api.vn/api/p/${prov.code}?depth=2`);
              if (dRes.ok) {
                const provinceData = await dRes.json();
                const ds = provinceData.districts || [];
                setDistricts(ds);
                const dist = ds.find((d: any) => String(d.code) === String((address as any).district_code) || d.name === address?.district);
                if (dist) {
                  setSelectedDistrict(dist);
                  try {
                    const wRes = await fetch(`https://provinces.open-api.vn/api/d/${dist.code}?depth=2`);
                    if (wRes.ok) {
                      const districtData = await wRes.json();
                      const ws = districtData.wards || [];
                      setWards(ws);
                      const w = ws.find((x: any) => String(x.code) === String((address as any).ward_code) || x.name === address?.ward);
                      if (w) setSelectedWard(w);
                    }
                  } catch (e) {
                    // ignore
                  }
                }
              }
            } catch (e) {
              // ignore
            }
          }
        } catch (e) {
          // ignore
        }
      }
    })();
  }, [address]);

  const handleProvinceChange = async (prov: any) => {
    setSelectedProvince(prov);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    setWards([]);
    if (!prov) return;
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/p/${prov.code}?depth=2`);
      if (!res.ok) throw new Error("Failed to fetch districts");
      const provinceData = await res.json();
      const ds = provinceData.districts || [];
      setDistricts(ds);
    } catch (err) {
      console.warn("Failed to load districts for province", prov, err);
    }
  };

  const handleDistrictChange = async (dist: any) => {
    setSelectedDistrict(dist);
    setSelectedWard(null);
    setWards([]);
    if (!dist) return;
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/d/${dist.code}?depth=2`);
      if (!res.ok) throw new Error("Failed to fetch wards");
      const districtData = await res.json();
      const ws = districtData.wards || [];
      setWards(ws);
    } catch (err) {
      console.warn("Failed to load wards for district", dist, err);
    }
  };

  const handleWardChange = (w: any) => {
    setSelectedWard(w);
  };

  return {
    provinces,
    districts,
    wards,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    ensureProvincesLoaded,
    handleProvinceChange,
    handleDistrictChange,
    handleWardChange,
  };
}
