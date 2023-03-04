export type MintGroupMetadata = {
  label: string;
  title?: string;
  description?: string;
};

export type MintGroupsMetadata = {
  title: string;
  description?: string;
  groups: MintGroupMetadata[];
};
