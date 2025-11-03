import { Stack } from "expo-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const client = new QueryClient()

export default function Layout() {
    return (
        <QueryClientProvider client={client}>
            <Stack>
                <Stack.Screen 
                    name="index" 
                    options={{ title: 'Mis Rutinas' }} 
                />
                <Stack.Screen 
                    name="[name]" 
                    options={{ 
                        title: 'Exercise Details',
                        headerBackTitle: 'Back'
                    }} 
                />
                <Stack.Screen 
                    name="routines/[id]" 
                    options={{ 
                        title: 'Rutina',
                        headerBackTitle: 'Rutinas'
                    }} 
                />
                <Stack.Screen 
                    name="workout/index"   
                    options={{ 
                        title: 'Workout',
                        headerBackTitle: 'Rutina'
                    }} 
                />
            </Stack>
        </QueryClientProvider>
    )
}