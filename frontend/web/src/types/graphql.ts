// ===============================================
// Query / Mutation Response and Variables Types
// ===============================================

export type User = {
  id: string;
  name: string;
};

export type Recipe = {
  id: string;
  title: string;
  status: boolean;
  category: {
    name: string;
    icon: string;
  }
};


// ---------- Queries ----------
export type RecipesQueryData = {
  recipes: Recipe[];
};

// ---------- Mutations ----------
export type CreateRecipeMutationResponse = {
  createRecipe: {
    id: string;
    title: string;
    status: boolean;
    user: {
      id: string;
      name: string;
    }
  }
};

export type CreateRecipeVariables = {
  input: {
    url: string;
  }
};
