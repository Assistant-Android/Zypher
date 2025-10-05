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
  transit_duration: number;
  planet_radius: number;
  stellar_mass: number;
  temperature: number;
  distance: number;
};

export interface Planet {
  name: string;
  probability: number;
  characteristics: PlanetCharacteristics;
  data: PlanetData;
}

export interface CategoryCard {
  name: string;
  count: number;
  icon: string;
  color: string;
  planets: Planet[];
}