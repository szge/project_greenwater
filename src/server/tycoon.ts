import { Unlockable } from "./unlockable"
import { Workspace, ServerStorage, Debris } from "@rbxts/services"
import { t } from "@rbxts/t";
import { Utils } from "./utils";
import { PlayerInfos } from "./playerInfo";

export class Tycoon {
    owner: Player | undefined;
    unlockables: Map<string, Unlockable>;
    tycoonModel: typeof ServerStorage.Tycoon;

    constructor(position: Vector3) {
        this.owner = undefined;
        this.unlockables = new Map<string, Unlockable>();
        this.tycoonModel = ServerStorage.Tycoon.Clone();
        this.tycoonModel.PivotTo(new CFrame(position));
        this.tycoonModel.Parent = Workspace;

        this.SetupTycoonUnlocks();

        // create the claim button
        const claimButton = this.tycoonModel.FindFirstChild("ClaimButton");
        assert(claimButton?.IsA("Part"));
        const promptText = claimButton.GetAttribute("PromptText");
        assert(t.string(promptText), "oop not string");
        Utils.CreateButton(claimButton, "Free", promptText,
            (player: Player) => {
                if (PlayerInfos.GetPlayerInfo(player) === undefined) {
                    Utils.SetObjectEnabled(claimButton, false);
                    PlayerInfos.AssignTycoon(player, this);
                }
            }
        );
    }

    Claim(owner: Player): void {
        this.owner = owner;
        // TODO: get tycoon state from server
        // if the player has an existing game state stored in server
        
        // if the player is creating their first tycoon
        // setup initial buttons
        const conveyorButton = ServerStorage.Unlockable.FindFirstChild("ConveyorUnlockButton");
        this.CreateUnlockGroupObjects(conveyorButton);

        const dropperButton = ServerStorage.Unlockable.FindFirstChild("DropperUnlockButton");
        this.CreateUnlockGroupObjects(dropperButton);
    }

    SetupTycoonUnlocks(): void {
        // disable everything until claimed
        this.SetupTycoonUnlocksRecursive(this.tycoonModel.TycoonUnlockables);
    }

    // go through all the children of a folder
    // if the child is a folder then recurse
    // if the child is a basepart then do stuff and return
    SetupTycoonUnlocksRecursive(object: Instance | undefined) {
        if (object === undefined) {
            return;
        } else if (object.IsA("Folder")) {
            // if the child is a folder then recurse
            for (const child of object.GetChildren()) {
                this.SetupTycoonUnlocksRecursive(child);
            }
        } else if (object.IsA("BasePart")) {
            // if the child is a basepart then do stuff and return
            // define button behaviours
            if (object.Name.find("Button") !== undefined) {
                const unlockGroup = object.GetAttribute("UnlockGroup");
                assert(t.string(unlockGroup));
                const promptText = object.GetAttribute("PromptText");
                assert(t.string(promptText));
                const cost = object.GetAttribute("Cost");
                assert(t.number(cost));
                Utils.CreateButton(object, "$" + cost, promptText,
                    (player: Player) => {
                        if (this.owner === player) {
                            this.UnlockGroup(unlockGroup);
                            object.Destroy();
                        }
                    }
                );
            }
            Utils.SetObjectEnabled(object, false);
        } else if (object.IsA("Model")) {
            Utils.SetObjectEnabled(object, false);
        } else {
            error("Unknown object of type " + type(object) + " in Unlockables");
        }
    }

    // basically like SetupTycoonUnlocksRecursive except clones the unlock group from ServerStorage.Unlockable
    CreateUnlockGroupObjects(object: Instance | undefined) {
        if (object === undefined) {
            return;
        } else if (object.IsA("Folder")) {
            // if the child is a folder then recurse
            for (const child of object.GetChildren()) {
                this.CreateUnlockGroupObjects(child);
            }
        } else if (object.IsA("BasePart")) {
            // if the child is a basepart then do stuff and return
            // define button behaviours
            const clone = object.Clone();
            if (clone.Name.find("Button") !== undefined) {
                const unlockGroup = clone.GetAttribute("UnlockGroup");
                assert(t.string(unlockGroup));
                const promptText = clone.GetAttribute("PromptText");
                assert(t.string(promptText));
                const cost = clone.GetAttribute("Cost");
                assert(t.number(cost));
                Utils.CreateButton(clone, "$" + cost, promptText,
                    (player: Player) => {
                        if (this.owner === player) {
                            this.UnlockGroup(unlockGroup);
                            clone.Destroy();
                        }
                    }
                );
            }
            clone.Parent = this.tycoonModel.TycoonUnlockables;
            clone.PivotTo(this.tycoonModel.GetPivot().mul(clone.GetPivot()));
        } else if (object.IsA("Model")) {
            const clone = object.Clone();
            clone.Parent = this.tycoonModel.TycoonUnlockables;
            clone.PivotTo(this.tycoonModel.GetPivot().mul(clone.GetPivot()));
        } else {
            error("Unknown object of type " + type(object) + " in Unlockables");
        }
    }

    UnlockGroup(unlockID: string) {
        const groupFolder = ServerStorage.Unlockable.FindFirstChild(unlockID);
        assert(groupFolder?.IsA("Folder"));
        this.CreateUnlockGroupObjects(groupFolder);
        // for special behaviours applied to objects.
        switch(unlockID) {
            case "ConveyorGroup": {
                // for the conveyor, apply a movement vector
                const belt = this.tycoonModel.TycoonUnlockables.FindFirstChild("Conveyor")?.FindFirstChild("Belt");
                assert(belt?.IsA("BasePart"));
                const attStart = belt?.FindFirstChild("AttStart");
                assert(attStart?.IsA("Attachment"));
                const attEnd = belt?.FindFirstChild("AttEnd");
                assert(attEnd?.IsA("Attachment"));
                // I fricking hate rbxtsc V3 math
                const direction = attEnd.WorldPosition.sub(attStart.WorldPosition);
                const conveyorSpeed = belt?.GetAttribute("ConveyorSpeed");
                assert(t.number(conveyorSpeed));
                const conveyorVelocity = direction.Unit.mul(conveyorSpeed);
                belt.AssemblyLinearVelocity = conveyorVelocity;
                break;
            }
            case "DropperGroup": {
                const dropper = this.tycoonModel.TycoonUnlockables.FindFirstChild("Dropper");
                const spawnpoint = dropper?.FindFirstChild("DropSpawnpoint", true);
                assert(spawnpoint?.IsA("Attachment"));
                const mineralMaterial = ServerStorage.Material.FindFirstChild("MineralMaterial");
                assert(mineralMaterial?.IsA("BasePart"));
                const spawnrate = dropper?.GetAttribute("Rate");
                assert(t.number(spawnrate));
                task.spawn(() => {
                    while (true) {
                        const drop = mineralMaterial.Clone();
                        drop.Parent = this.tycoonModel;
                        print(spawnpoint.Position);
                        drop.Position = spawnpoint.WorldPosition;
                        Debris.AddItem(drop, 10);
                        task.wait(1 / spawnrate);
                    }
                });
                break;
            }
        }
    }
}