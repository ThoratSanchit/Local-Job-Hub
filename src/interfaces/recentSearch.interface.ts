export interface IRecentSearch {
  id: string;
  user_id: string;
  search_key: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateRecentSearchData {
  user_id: string;
  search_key: string;
}
