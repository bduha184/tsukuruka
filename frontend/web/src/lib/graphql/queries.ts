import { gql } from '@apollo/client';

// ========== Queries ==========

export const HEALTH_QUERY = gql`
  query Health {
    health {
      status
      database
      timestamp
    }
  }
`;

export const CATEGORIES_QUERY = gql`
  query Categories {
    categories {
      id
      name
      icon
      eatingOutCost
    }
  }
`;

export const RECIPES_QUERY = gql`
  query Recipes($status: RecipeStatus) {
    recipes(status: $status) {
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
      updatedAt
    }
  }
`;

export const RECIPE_QUERY = gql`
  query Recipe($id: ID!) {
    recipe(id: $id) {
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
      updatedAt
    }
  }
`;

export const TODAY_RECIPE_QUERY = gql`
  query TodayRecipe {
    todayRecipe {
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
      suggestedAt
  }
`;
