import axios from 'axios';

// List of regions with both code and full name
// this binding zones are avalible freely from the API, other were 
// for privete or internal use only so they are not included here
const REGIONS = [
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DE-LU', name: 'Germany, Luxembourg' },
  // { code: 'DE-AT-LU', name: 'Germany, Austria, Luxembourg' }, // this region causes an error in the API
  { code: 'DK1', name: 'Denmark 1' },
  { code: 'DK2', name: 'Denmark 2' },
  { code: 'FR', name: 'France' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IT-North', name: 'Italy North' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NO2', name: 'Norway 2' },
  { code: 'PL', name: 'Poland' },
  { code: 'SE4', name: 'Sweden 4' },
  { code: 'SI', name: 'Slovenia' },
];


// Fetch current prices for each region through the proxy
export const fetchRegionsPrices = async () => {
  const requests = REGIONS.map((region) =>
    axios.get(`/api/proxy-price`, { params: { bzn: region.code } })
      .then(response => {
        const currentHour = new Date().getHours(); // Get the current hour
        const fallbackIndex = 12; // 12:00 as fallback if current hour is not available
        const latestPrice = response.data.price[currentHour] ?? response.data.price[fallbackIndex];
        return {
          code: region.code,
          name: region.name,
          price: latestPrice, // Use current hour price or fallback to midday price
          unit: response.data.unit,
        };
      })
  );
  return Promise.all(requests);
};

// Fetch detailed prices for a specific region
export const fetchRegionDetails = async (regionCode: string, startDate: string, endDate: string) => {
  try {
    const response = await axios.get(`/api/proxy-price`, {
      params: {
        bzn: regionCode,
        start: startDate,
        end: endDate,
      },
    });

    return {
      regionName: regionCode,
      unixSeconds: response.data.unix_seconds,
      price: response.data.price,
      unit: response.data.unit,
      licenseInfo: response.data.license_info,
      deprecated: response.data.deprecated,
    };
  } catch (error) {
    console.error("Error fetching region details:", error);
    throw new Error("Failed to fetch region details.");
  }
};


