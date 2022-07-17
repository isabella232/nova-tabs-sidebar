
var treeView = null;


exports.activate = function() {
    // Do work when the extension is activated

    // Create the TreeView
    treeView = new TreeView("tabs-sidebar", {
        dataProvider: new TabDataProvider()
    });

    treeView.onDidChangeSelection((selection) => {
        // console.log("New selection: " + selection.map((e) => e.name));
    });

    treeView.onDidExpandElement((element) => {
        // console.log("Expanded: " + element.name);
    });

    treeView.onDidCollapseElement((element) => {
        // console.log("Collapsed: " + element.name);
    });

    treeView.onDidChangeVisibility(() => {
        // console.log("Visibility Changed");
    });

    // TreeView implements the Disposable interface
    nova.subscriptions.add(treeView);
}

exports.deactivate = function() {
    // Clean up state before the extension is deactivated
}


nova.commands.register("tabs-sidebar.add", () => {
    // Invoked when the "add" header button is clicked
    console.log("Add");
});

nova.commands.register("tabs-sidebar.remove", () => {
    // Invoked when the "remove" header button is clicked
    let selection = treeView.selection;
    console.log("Remove: " + selection.map((e) => e.name));
});

nova.commands.register("tabs-sidebar.doubleClick", () => {
    // Invoked when an item is double-clicked
    let selection = treeView.selection;
    console.log("DoubleClick: " + selection.map((e) => e.name));
});


class TabItem {
    constructor(name, path = '', description = '') {
        this.name = name;
        this.path = path;
        this.descriptiveText = description;
        this.children = [];
        this.parent = null;
        this.collapsibleState = TreeItemCollapsibleState.None;
    }

    addChild(element) {
        element.parent = this;
        this.children.push(element);
    }
}


class TabDataProvider {
    constructor() {
        let rootItems = [];
        let tabs = nova.workspace.textDocuments;

        tabs.forEach((tab) => {
            const tabName = nova.path.basename(tab.path);
            const tabDir = nova.path.split(nova.path.dirname(tab.path));
            const tabDescription = tabDir[tabDir.length - 1];
            let element = new TabItem(tabName, tab.path, tabDescription);
            rootItems.push(element);
        });

        this.rootItems = rootItems;
    }

    getChildren(element) {
        // Requests the children of an element
        if (!element) {
            return this.rootItems;
        }
        else {
            return element.children;
        }
    }

    getParent(element) {
        // Requests the parent of an element, for use with the reveal() method
        return element.parent;
    }

    getTreeItem(element) {
        // Converts an element into its display (TreeItem) representation
        let item = new TreeItem(element.name);
        if (element.children.length > 0) {
            item.descriptiveText = element.descriptiveText;
            item.collapsibleState = TreeItemCollapsibleState.Collapsed;
            item.path = element.path;
            item.contextValue = "tab";
            item.identifier = element.path;
        }
        else {
            item.descriptiveText = element.descriptiveText;
            item.path = element.path;
            item.command = "tabs-sidebar.doubleClick";
            item.contextValue = "info";
            item.identifier = element.path;
        }
        return item;
    }
}

