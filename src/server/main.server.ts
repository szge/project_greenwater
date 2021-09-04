import { Players } from "@rbxts/services";
import { makeHello } from "shared/module";
import { TycoonHandler } from "./tycoonHandler";

TycoonHandler.InitTycoon();

Players.PlayerAdded.Connect((player: Player) => {
    // setup leaderboard
    const leaderboard_stats = new Instance("Folder");
    leaderboard_stats.Name = "leaderstats";
    const money = new Instance("IntValue");
    money.Name = "Money";
    // TODO: fetch money from previous tycoon save state
    money.Value = 100;
    money.Parent = leaderboard_stats;
    leaderboard_stats.Parent = player;
});

print(makeHello("main.server.ts"));
