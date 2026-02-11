import { gql } from "@apollo/client";

export const CREATE_RECIPE = gql`
  mutation CreateRecipe($input: NewRecipe!) {
    createRecipe(input: $input) {
      id
      title
      status
      user {
        id
        name
      }
    }
  }
`;
