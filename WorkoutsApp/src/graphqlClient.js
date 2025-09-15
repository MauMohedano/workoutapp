import { GraphQLClient, gql } from "graphql-request";

const url = "https://buding.us-east-a.ibm.stepzen.net/api/hasty-liger/graphql"
const apiKey = process.env.EXPO_PUBLIC_GRAPHQL_API_KEY



const client = new GraphQLClient(url, {
    headers: {
        Authorization: `Bearer ${apiKey}`
        
    }
})

export default client