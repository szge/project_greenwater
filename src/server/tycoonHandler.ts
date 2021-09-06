import { Workspace } from "@rbxts/services";
import { Tycoon } from "./tycoon";
const MAX_PLAYERS = 4;

export namespace TycoonHandler {
    const tycoons: Tycoon[] = [];

    export function InitTycoon(): void {
        // only for testing: disable later
        const testTycoon = Workspace.FindFirstChild("Tycoon");
        testTycoon?.Destroy();

        // create MAX_PLAYERS tycoons
        for (let i = 0; i < MAX_PLAYERS; i++) {
            tycoons[i] = new Tycoon(new Vector3(100 * i, 0.5, 50));
        }
    }
}