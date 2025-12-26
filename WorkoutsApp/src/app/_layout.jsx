import { Stack } from "expo-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WorkoutTimerProvider } from "../contexts/WorkoutTimerContext"
import { FloatingTimer } from "../components/FloatingTimer"

const client = new QueryClient()

export default function Layout() {
    return (
        <QueryClientProvider client={client}>
            <WorkoutTimerProvider>
                <Stack>
                    <Stack.Screen
                        name="index"
                        options={{ title: 'Mis Rutinas' }}
                    />
                    <Stack.Screen
                        name="routines/[id]/index"
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
                    <Stack.Screen
                        name="workout/summary"
                        options={{
                            title: 'Resumen',
                            headerShown: false  // Pantalla sin header
                        }}
                    />
                </Stack>

                {/* Timer flotante - visible en TODAS las pantallas */}
                <FloatingTimer />
            </WorkoutTimerProvider>
        </QueryClientProvider>
    )
}