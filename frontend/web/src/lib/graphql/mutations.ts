import { gql } from '@apollo/client';

// ========== Mutations ==========

export const CREATE_RECIPE_MUTATION = gql`
  mutation CreateRecipe($input: CreateRecipeInput!) {
    createRecipe(input: $input) {
      id
      url
      title
      thumbnailUrl
      platform
      category {
        id
        name
        icon
        eatingOutCost
      }
      estimatedCost
      eatingOutCost
      status
      createdAt
    }
  }
`;

export const UPDATE_RECIPE_STATUS_MUTATION = gql`
  mutation UpdateRecipeStatus($id: ID!, $status: RecipeStatus!) {
    updateRecipeStatus(id: $id, status: $status) {
      id
      status
      updatedAt
    }
  }
`;

export const DELETE_RECIPE_MUTATION = gql`
  mutation DeleteRecipe($id: ID!) {
    deleteRecipe(id: $id)
  }
`;
