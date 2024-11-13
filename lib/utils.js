const fs = require("fs");

function parseInventory(inventory) {
    let items = {};

    const itemsData = fs.readFileSync('lib/items.txt', 'utf8');
    const itemsArray = itemsData.split('\n');

    itemsArray.forEach(line => {
        const [id, name] = line.split('|');
        if (id && name) {
            items[id] = name.trim();
        }
    });

    let inventoryObject = [];

    inventory.forEach(item => {
        const [itemId, quantity] = item;
        const itemName = items[itemId];
        if (itemName) {
            inventoryObject.push([itemName, quantity]);
        }
    });

    return inventoryObject;
}

module.exports = {
    parseInventory
};