import { t } from "@rbxts/t";
import { Workspace, ServerStorage } from "@rbxts/services"

export namespace Utils {
    export function SetObjectEnabled(thing: Model | BasePart, enabled: boolean) {
        if (thing.IsA("Model")) {
            SetModelEnabled(thing, enabled);
        } else if (thing.IsA("BasePart")) {
            SetBasePartEnabled(thing, enabled);
        }
    }

    export function SetModelEnabled(model: Model, enabled: boolean) {
        for (const part of model.GetDescendants()) {
            if (part.IsA("BasePart")) {
                SetBasePartEnabled(part, enabled);
            }
        }
    }

    export function SetBasePartEnabled(part: BasePart, enabled: boolean, transparency = 0) {
        part.Transparency = (enabled) ? transparency : 1;
        part.CanCollide = enabled;

        // special case: part is a button
        const prompt = part.FindFirstChild("ProximityPrompt");
        if (prompt?.IsA("ProximityPrompt")) {
            prompt.Enabled = enabled;
        }
    }

    export function CreateButton(button: BasePart, objectText: string, actionText: string, onTriggered: (player: Player) => void, holdDuration = 0.5) {
        const prompt = new Instance("ProximityPrompt");
        prompt.HoldDuration = holdDuration;
        prompt.ActionText = actionText;
        prompt.ObjectText = objectText;
        prompt.Parent = button;
        prompt.Triggered.Connect(onTriggered);
    }

    export function IsButton(part: BasePart) {
        return (part.FindFirstChild("ProximityPrompt") !== undefined);
    }
}