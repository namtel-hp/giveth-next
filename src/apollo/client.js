import { ApolloClient, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import gql from 'graphql-tag'
import {
  getLocalStorageUserLabel,
  getLocalStorageTokenLabel
} from '../services/auth'
import { createUploadLink } from 'apollo-upload-client'

let apolloClient

function createApolloClient() {
  // Declare variable to store authToken
  let token

  const appUser = getLocalStorageUserLabel()

  const httpLink = createUploadLink({
    uri: process.env.NEXT_PUBLIC_APOLLO_SERVER
  })

  const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    if (typeof window !== 'undefined') {
      token = localStorage.getItem(getLocalStorageTokenLabel())
    }

    // return the headers to the context so httpLink can read them
    const mutation = {
      Authorization: token ? `Bearer ${token}` : ''
    }
    if (typeof window !== 'undefined') {
      if (localStorage.getItem(appUser)) {
        const user = JSON.parse(localStorage.getItem(appUser))
        const userAddress = user?.addresses && user.addresses[0]

        if (userAddress) mutation['wallet-address'] = userAddress
      }
    }

    return {
      headers: {
        ...headers,
        ...mutation
      }
    }
  })

  const client = new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network'
      },
      query: {
        fetchPolicy: 'network-only',
        nextFetchPolicy: 'network-only'
      }
    },
    typeDefs: gql`
      enum OrderField {
        CreationDate
        Balance
      }

      enum OrderDirection {
        ASC
        DESC
      }

      type OrderBy {
        field: OrderField!
        direction: OrderDirection!
      }
    `,
    fetch
  })

  return client
}

export const client = createApolloClient()
