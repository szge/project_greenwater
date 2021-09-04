import { Tycoon } from "./tycoon";
const MAX_PLAYERS = 10;

export namespace TycoonHandler {
    const tycoons: Tycoon[] = [];

    export function InitTycoon(): void {
        // create MAX_PLAYERS tycoons
        for (let i = 0; i < MAX_PLAYERS; i++) {
            tycoons[i] = new Tycoon(new Vector3(50 * i, 0.5, 50));
        }
    }
}