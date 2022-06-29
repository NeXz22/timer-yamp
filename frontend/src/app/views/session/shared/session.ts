export interface Session {
    sessionId: string;
    participants: string[];
    goals: string[];
    useNavigator: boolean;
    useGoals: boolean;
    watching: number;
}
