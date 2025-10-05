// BatchTypes.ts
export type PlanetCharacteristics = {
  water: boolean;
  oxygen: boolean;
  rocks: boolean;
  forest: boolean;
  hydrogen: boolean;
  radiation: boolean;
  atmosphere: boolean;
  magnetic_field: boolean;
};

export type PlanetData = {
  orbital_period: number;
  equilibrium_temp: number;
  stellar_temp: number;
  dec: number;
  planet_radius: number;
  koi_model_snr: number;
  stellar_radius: number;
  transit_duration: number;
  insolation_flux: number;
  ra: number;
  transit_depth: number;
  planet_radius_missing: boolean;
  stellarType: string;
  multiplePlanets: boolean;
  energyBudget: number;
};

export interface Planet {
  name: string;
  probability: number;
  characteristics: PlanetCharacteristics;
  data: PlanetData;
  habitabilityScore: number;
}

export interface CategoryCard {
  name: string;
  description: string;
  count: number;
  icon: string;
  color: string;
  planets: Planet[];
}