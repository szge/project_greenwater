import { Workspace } from "@rbxts/services";
import { Tycoon } from "./tycoon";

export class PlayerInfo {
    tycoon: Tycoon | undefined;
    money: IntValue;

    constructor(tycoon: Tycoon) {
        this.tycoon = tycoon;
        const leaderstats = tycoon.owner?.FindFirstChild("leaderstats");
        assert(leaderstats !== undefined, "leaderstats is undefined???!");
        const money = leaderstats.FindFirstChild("Money");
        assert(money?.IsA("IntValue") , "leaderstats/money is undefined???!");
        this.money = money;
    }

    GetMoney(): number {
        return this.money.Value;
    }

    SetMoney(money: number): void {
        this.money.Value = money;
    }

    CanPurchase(cost: number): boolean {
        return this.money.Value >= cost;
    }

    UpdateMoneyDelta(delta: number) {
        if (this.CanPurchase(-delta)) this.money.Value += delta;
    }
}

export namespace PlayerInfos {
    const playerInfos: Map<Player, PlayerInfo> = new Map<Player, PlayerInfo>();
    
    export function AssignTycoon(player: Player, tycoon: Tycoon): void {
        assert(playerInfos.get(player) === undefined, "player already owns plot bad");
        tycoon.Claim(player);
        const playerInfo = new PlayerInfo(tycoon);
        playerInfos.set(player, playerInfo);
    }

    export function GetPlayerInfo(player: Player) : PlayerInfo | undefined {
        return playerInfos.get(player);
    }
}