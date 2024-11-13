const fs = require('fs');
var items_secret_key = "PBG892FXX982ABC*"

function read_buffer_number(buffer, pos, len) {
    let value = 0;
    for (let a = 0; a < len; a++) value += buffer[pos + a] << (a * 8);
    return value;
}

function read_buffer_string(buffer, pos, len, using_key, item_id) {
    let result = '';
    for (let a = 0; a < len; a++) {
        result += String.fromCharCode(
            using_key
                ? buffer[a + pos] ^
                items_secret_key.charCodeAt(
                    (item_id + a) % items_secret_key.length,
                )
                : buffer[a + pos],
        );
    }
    return result;
}

// function item_decoder(filePath) {
//     let mem_pos = 6;
//     let data_json = {};

//     fs.readFile(filePath, (err, data) => {
//         if (err) {
//             console.error('Error reading file:', err);
//             return;
//         }

//         let arrayBuffer = new Uint8Array(data);
//         let version = read_buffer_number(arrayBuffer, 0, 2);
//         let item_count = read_buffer_number(arrayBuffer, 2, 4);
//         data_json.version = version;
//         data_json.item_count = item_count;
//         data_json.items = [];

//         // if (version > 18) {
//         //     console.error("Your items.dat version is " + version + ", and this decoder doesn't support that version!");
//         //     return;
//         // }

//         let itemsText = '';

//         // for (let a = 0; a < item_count; a++) {
//         //     let item_id = read_buffer_number(arrayBuffer, mem_pos, 4);
//         //     mem_pos += 4;

//         //     let editable_type = arrayBuffer[mem_pos++];
//         //     let item_category = arrayBuffer[mem_pos++];
//         //     let action_type = arrayBuffer[mem_pos++];
//         //     let hit_sound_type = arrayBuffer[mem_pos++];

//         //     let len = read_buffer_number(arrayBuffer, mem_pos, 2);
//         //     mem_pos += 2;
//         //     let name = read_buffer_string(arrayBuffer, mem_pos, len, true, Number(item_id));
//         //     mem_pos += len;

//         //     itemsText += `${item_id}|${name}\n`;
//         // }

//         // fs.writeFile('items.txt', itemsText, (err) => {
//         //     if (err) {
//         //         console.error('Error writing to items.txt:', err);
//         //     } else {
//         //         console.log('items.txt has been saved.');
//         //     }
//         // });

//         for (let a = 0; a < item_count; a++) {
//             let item_id = read_buffer_number(arrayBuffer, mem_pos, 4);
//             mem_pos += 4;

//             let editable_type = arrayBuffer[mem_pos++];
//             let item_category = arrayBuffer[mem_pos++];
//             let action_type = arrayBuffer[mem_pos++];
//             let hit_sound_type = arrayBuffer[mem_pos++];

//             let len = read_buffer_number(arrayBuffer, mem_pos, 2);
//             mem_pos += 2;
//             let name = read_buffer_string(arrayBuffer, mem_pos, len);
//             mem_pos += len;

//             if (version >= 17) {
//                 var int_version_17 = read_buffer_number(arrayBuffer, mem_pos, 4);
//                 mem_pos += 4;
//             }

//             if (version >= 18) {
//                 var int_version_18 = read_buffer_number(arrayBuffer, mem_pos, 4);
//                 mem_pos += 4;
//             }

//             if (item_id != a) console.log(`Unordered Items at ${a}`);

//             data_json.items[a] = {};
//             data_json.items[a].item_id = item_id;
//             data_json.items[a].name = name;

//             console.log(`Item ID: ${item_id} - Name:`);
//             itemsText += `${item_id}|${name}\n`;
//         }
//     });
// }

function item_decoder(file) {
    const buffer = fs.readFileSync(file);
    const arrayBuffer = new Uint8Array(buffer);
    let mem_pos = 6;
    let itemsText = ''

    const version = read_buffer_number(arrayBuffer, 0, 2);
    const item_count = read_buffer_number(arrayBuffer, 2, 4);

    if (version > 19) {
        console.error(
            'Your items.dat version is ' +
            version +
            ', and This decoder doesnt support that version!',
        );
        return;
    }

    for (let a = 0; a < item_count; a++) {
        const item_id = read_buffer_number(arrayBuffer, mem_pos, 4);
        mem_pos += 4;

        const editable_type = arrayBuffer[mem_pos++];
        const item_category = arrayBuffer[mem_pos++];
        const action_type = arrayBuffer[mem_pos++];
        const hit_sound_type = arrayBuffer[mem_pos++];

        let len = read_buffer_number(arrayBuffer, mem_pos, 2);
        mem_pos += 2;
        let name = read_buffer_string(
            arrayBuffer,
            mem_pos,
            len,
            true,
            Number(item_id),
        );
        mem_pos += len;

        len = read_buffer_number(arrayBuffer, mem_pos, 2);
        mem_pos += 2;
        mem_pos += len;

        mem_pos += 4;

        const item_kind = arrayBuffer[mem_pos++];

        mem_pos += 4;

        const texture_x = arrayBuffer[mem_pos++];
        const texture_y = arrayBuffer[mem_pos++];
        const spread_type = arrayBuffer[mem_pos++];
        const is_stripey_wallpaper = arrayBuffer[mem_pos++];
        const collision_type = arrayBuffer[mem_pos++];
        let break_hits = arrayBuffer[mem_pos++];

        mem_pos += 4;

        const clothing_type = arrayBuffer[mem_pos++];

        mem_pos += 2;

        const max_amount = arrayBuffer[mem_pos++];

        len = read_buffer_number(arrayBuffer, mem_pos, 2);
        mem_pos += 2;
        mem_pos += len;

        mem_pos += 4;

        mem_pos += 4;

        len = read_buffer_number(arrayBuffer, mem_pos, 2);
        mem_pos += 2;
        mem_pos += len;

        len = read_buffer_number(arrayBuffer, mem_pos, 2);
        mem_pos += 2;
        mem_pos += len;

        len = read_buffer_number(arrayBuffer, mem_pos, 2);
        mem_pos += 2;
        mem_pos += len;

        len = read_buffer_number(arrayBuffer, mem_pos, 2);
        mem_pos += 2;
        mem_pos += len;

        const seed_base = arrayBuffer[mem_pos++];
        const seed_overlay = arrayBuffer[mem_pos++];
        const tree_base = arrayBuffer[mem_pos++];
        const tree_leaves = arrayBuffer[mem_pos++];

        const seed_color_a = arrayBuffer[mem_pos++];
        const seed_color_r = arrayBuffer[mem_pos++];
        const seed_color_g = arrayBuffer[mem_pos++];
        const seed_color_b = arrayBuffer[mem_pos++];
        const seed_overlay_color_a = arrayBuffer[mem_pos++];
        const seed_overlay_color_r = arrayBuffer[mem_pos++];
        const seed_overlay_color_g = arrayBuffer[mem_pos++];
        const seed_overlay_color_b = arrayBuffer[mem_pos++];

        mem_pos += 4; // skipping ingredients

        mem_pos += 4;

        mem_pos += 2;
        mem_pos += 2;

        len = read_buffer_number(arrayBuffer, mem_pos, 2);
        mem_pos += 2;
        mem_pos += len;

        len = read_buffer_number(arrayBuffer, mem_pos, 2);
        mem_pos += 2;
        mem_pos += len;

        len = read_buffer_number(arrayBuffer, mem_pos, 2);
        mem_pos += 2;
        mem_pos += len;

        mem_pos += 80;

        if (version >= 11) {
            len = read_buffer_number(arrayBuffer, mem_pos, 2);
            mem_pos += 2;
            mem_pos += len;
        }

        if (version >= 12) {
            mem_pos += 13;
        }

        if (version >= 13) {
            mem_pos += 4;
        }

        if (version >= 14) {
            mem_pos += 4;
        }

        if (version >= 15) {
            mem_pos += 25;
            len = read_buffer_number(arrayBuffer, mem_pos, 2);
            mem_pos += 2;
            mem_pos += len;
        }
        if (version >= 16) {
            len = read_buffer_number(arrayBuffer, mem_pos, 2);
            mem_pos += 2;
            mem_pos += len;
        }

        if (version >= 17) {
            mem_pos += 4;
        }

        if (version >= 18) {
            mem_pos += 4;
        }

        if (version >= 19) {
            mem_pos += 9;
        }

        if (item_id !== a) {
            console.log(`Unordered Items at ${a}`);
        }

        itemsText += `${item_id}|${name}\n`;
    }

    fs.writeFile('items.txt', itemsText, (err) => {
        if (err) {
            console.error('Error writing to items.txt:', err);
        } else {
            console.log('items.txt has been saved.');
        }
    });
}

item_decoder("lib/items.dat");