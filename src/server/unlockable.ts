export class Unlockable {
    object: BasePart;
    children: Array<Unlockable>;
    unlockStage: number;

    constructor(object: BasePart, unlockStage = 0) {
        this.object = object;
        this.children = new Array<Unlockable>();
        this.unlockStage = unlockStage;
    }

    public HasChildren() {
        return this.children.size() > 0;
    }

    public AddChild(child: Unlockable) {
        this.children.push(child);
    }

    public GetChildren(): Array<Unlockable> {
        return this.children;
    }

    public UpgradeStage() {
        this.unlockStage++;
    }

    public SetUnlockStage(stage: number) {
        this.unlockStage = stage;
    }
}

export class UnlockableButton extends Unlockable {
    
}