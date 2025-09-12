
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';


export default function ExerciseListItem({ item }) {
  return (
    <Link href={`/${item.name}`} asChild>
    <Pressable style={styles.exerciseContainer}>
      <Text style={styles.exerciseName}>{item.name}</Text>
      <Text style={styles.exerciseSubtitle}>
        <Text style={styles.exerciseSubtitle}>{item.muscle} </Text>| Equipment: <Text style={styles.exerciseSubtitle}>{item.equipment}</Text>
      </Text>
    </Pressable>
    </Link>
  )
}

const styles = StyleSheet.create({
  exerciseContainer: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 6,
    gap: 4,
    marginHorizontal: 5,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,

    elevation: 2,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  exerciseSubtitle: {
    color: 'gray',
  },
  exerciseSubtitle: {
    textTransform: 'capitalize'
  }
});
