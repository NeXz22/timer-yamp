export interface Notification {
    id: number;
    text: string;
    life: number;
    severity: string;
    started?: number;
}
