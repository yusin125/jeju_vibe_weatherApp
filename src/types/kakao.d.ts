export {};

declare global {
  interface Window {
    kakao: typeof kakao;
  }

  namespace kakao.maps {
    function load(callback: () => void): void;
  }

  namespace kakao.maps.services {
    enum Status {
      OK = 'OK',
      ZERO_RESULT = 'ZERO_RESULT',
      ERROR = 'ERROR',
    }

    interface Address {
      address_name: string;
      region_1depth_name: string;
      region_2depth_name: string;
      region_3depth_name: string;
    }

    interface RoadAddress {
      address_name: string;
    }

    interface Coord2AddressResult {
      address: Address | null;
      road_address: RoadAddress | null;
    }

    class Geocoder {
      coord2Address(
        lng: number,
        lat: number,
        callback: (result: Coord2AddressResult[], status: Status) => void,
      ): void;
    }
  }
}
