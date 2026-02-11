import { gql } from "@apollo/client";

export const RECIPES_QUERY = gql`
  query {
    recipes {
      id
      title
      status
      category {
        name
        icon
      }
    }
  }
`;
