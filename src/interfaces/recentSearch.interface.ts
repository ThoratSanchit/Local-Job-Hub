export interface IRecentSearch {
  id: string;
  user_id: string;
  search_data: object;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateRecentSearchData {
  user_id: string;
  search_data: object;
}
