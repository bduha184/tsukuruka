"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CREATE_RECIPE } from "@/lib/graphql/mutations";
import {
  CreateRecipeMutationResponse,
  CreateRecipeVariables,
} from "@/types/graphql";

export function CreateRecipeForm() {
  const [text, setText] = useState("");

  const [createRecipe, { loading, error }] = useMutation<
    CreateRecipeMutationResponse,
    CreateRecipeVariables
  >(CREATE_RECIPE, {
    update(cache, { data }) {
      const newRecipe = data?.createRecipe;
      if (!newRecipe) return;

      cache.modify({
        fields: {
          recipes(existingTodos = [], { toReference }) {
            const newRef = toReference(newRecipe);
            return [...existingTodos, newRef];
          },
        },
      });
    },
  });

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!text.trim()) return;

    await createRecipe({
      variables: {
        input: {
          url: text,
        },
      },
    });

    setText("");
  };

  return (
    <form onSubmit={onSubmit}>
      <div style={styles.emptyUrlInput}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          style={styles.urlInput}
        />
        <button
          style={{ ...styles.urlSubmitBtn, opacity: url.length < 10 ? 0.5 : 1 }}
          onClick={handleUrlSubmit}
          disabled={url.length < 10 || isLoading}
        >
          {isLoading ? '...' : '登録'}
        </button>
      </div>
    </form>
  );
}
