import { View, Text, ActivityIndicator, FlatList } from 'react-native';
import { gql } from 'graphql-request'
import { useQuery } from '@tanstack/react-query'
import client from "../graphqlClient";

const setsQuery = gql`
query exercises {
  sets {
    _id
    exercise
    reps
    weight
  }
}`

const SetsList = () => {
    const { data,  isLoading } = useQuery({
        queryKey: ['sets'],
        queryFn: () => client.request(setsQuery)
    })

    if (isLoading) { return <ActivityIndicator /> }
    console.log(data)
    return (
        <View>
            <FlatList data={data.sets}
            renderItem={({item}) => (
                <Text>{item.exercise} {item.reps} {item.weight}</Text>)}
            />
        </View>
    )
}

export default SetsList;