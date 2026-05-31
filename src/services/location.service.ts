import CustomError from '../utility/customError.utility';
import Messages from '../language/en/message.language';

interface LocationIqAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state_district?: string;
  suburb?: string;
  neighbourhood?: string;
  locality?: string;
  hamlet?: string;
  quarter?: string;
  city_district?: string;
  residential?: string;
  road?: string;
  postcode?: string;
}

interface LocationIqResult {
  lat?: string;
  lon?: string;
  address?: LocationIqAddress;
}

export interface NormalizedLocation {
  city: string | null;
  area: string | null;
  pincode: string | null;
  latitude: number;
  longitude: number;
}

class LocationService {
  private readonly baseUrl = 'https://us1.locationiq.com/v1';

  private getApiKey() {
    const apiKey = process.env.LOCATIONIQ_API_KEY;

    if (!apiKey) {
      throw new CustomError(500, Messages.LOCATIONIQ_API_KEY_MISSING);
    }

    return apiKey;
  }

  private isValidCoordinate(latitude: number, longitude: number) {
    return (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }

  private normalizeAddress(
    address: LocationIqAddress | undefined,
    fallback: Partial<Pick<NormalizedLocation, 'city' | 'area' | 'pincode'>> = {}
  ) {
    const city = address?.city || address?.town || address?.village || address?.municipality || address?.county || fallback.city || null;
    const area = address?.suburb || address?.neighbourhood || address?.locality || address?.hamlet || address?.quarter || address?.city_district || address?.residential || address?.road || address?.village || fallback.area || city;

    return {
      city,
      area,
      pincode: address?.postcode || fallback.pincode || null,
    };
  }

  private async fetchLocationIq<T>(path: string, params: Record<string, string>) {
    const url = new URL(`${this.baseUrl}/${path}`);
    url.searchParams.set('key', this.getApiKey());
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    let response: Response;

    try {
      response = await fetch(url);
    } catch {
      throw new CustomError(502, Messages.LOCATION_LOOKUP_FAILED);
    }

    if (!response.ok) {
      throw new CustomError(502, Messages.LOCATION_LOOKUP_FAILED);
    }

    return response.json() as Promise<T>;
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<NormalizedLocation> {
    if (!this.isValidCoordinate(latitude, longitude)) {
      throw new CustomError(400, Messages.INVALID_COORDINATES);
    }

    const result = await this.fetchLocationIq<LocationIqResult>('reverse', {
      lat: String(latitude),
      lon: String(longitude),
    });
    const address = this.normalizeAddress(result.address);

    return {
      ...address,
      latitude,
      longitude,
    };
  }

  async geocode(city: string, area: string, pincode: string): Promise<NormalizedLocation> {
    const normalizedCity = city.trim();
    const normalizedArea = area.trim();
    const normalizedPincode = pincode.trim();

    if (!normalizedCity || !normalizedArea || !normalizedPincode) {
      throw new CustomError(400, Messages.LOCATION_FIELDS_REQUIRED);
    }

    const results = await this.fetchLocationIq<LocationIqResult[]>('search', {
      q: [normalizedArea, normalizedCity, normalizedPincode].join(', '),
      limit: '1',
    });
    const result = results[0];
    const latitude = Number(result?.lat);
    const longitude = Number(result?.lon);

    if (!result || !this.isValidCoordinate(latitude, longitude)) {
      throw new CustomError(404, Messages.LOCATION_NOT_FOUND);
    }

    return {
      city: normalizedCity,
      area: normalizedArea,
      pincode: normalizedPincode,
      latitude,
      longitude,
    };
  }
}

export default new LocationService();
