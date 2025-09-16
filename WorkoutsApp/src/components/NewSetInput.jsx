import { View, Text, StyleSheet, TextInput, Button } from "react-native"
import { useState } from "react"

const NewSetInput = () => {
    const [reps, setReps] = useState('')
    const [weight, setWeight] = useState('')



    const addSet = () => {
        console.warn("Add set: ", reps, weight)

        setReps('')
        setWeight('')
    }


    return (
        <View style={styles.continuer}>
            <TextInput
                value={reps}
                onChangeText={setReps}
                placeholder="Reps"
                style={styles.input}
                keyboardType="numeric"
            />
            <TextInput
                value={weight}
                onChangeText={setWeight}
                placeholder="Weight"
                style={styles.input}
                keyboardType="numeric"
            />
            <Button title="Add" onPress={addSet} />
        </View>
    )
}

const styles = StyleSheet.create({
    continuer: {
        backgroundColor: '#FFF',
        padding: 10,
        borderRadius: 6,
        flexDirection: 'row',
        gap: 10,
    },
    input: {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'gainsboro',
        padding: 10,
        flex: 1,
        borderRadius: 5,
    }
})

export default NewSetInput