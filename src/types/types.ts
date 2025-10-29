export type SetMetadata = {
  bandName: string;
  bandSetDateTime: Date;
  stageLocation: string;
  tixCount: number;
};

export type BaybeatsStage =
  | "Annexe"
  | "Powerhouse"
  | "Outdoor"
  | "LiveWire"
  | "Concourse"
  | "Unknown";

export type BaybeatsDay = "day_1" | "day_2" | "day_3" | "day_4";

export type BaybeatsFestivalData = Record<BaybeatsDay, FestivalDay>;

export type BaybeatsSet = {
  time: string;
  artist: string;
  note?: string;
};

export type FestivalDay = {
  date: string;
  stages: Partial<Record<BaybeatsStage, BaybeatsSet[]>>;
};
