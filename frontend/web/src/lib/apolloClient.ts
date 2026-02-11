"use client";

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const PATH_API_QUERY = "/api/graphql";

export const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: PATH_API_QUERY,
  }),
  cache: new InMemoryCache(),
});
