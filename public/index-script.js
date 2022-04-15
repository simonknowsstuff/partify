let socket = io();
let current_listeners = [];
let list_container = document.getElementById('list-container');

function remove_user_entry(user) {
    if (user) {
        let user_entry = document.getElementById(user.user_id);
        if (user_entry) {
            user_entry.remove();
            return;
        }
    }
    return Error("Entry not found!");
}

function create_user_entry(user) {
    if (user) {
        remove_user_entry(user);
        let list_elem = document.createElement('div');
        list_elem.setAttribute("class", "list_element");
        list_elem.setAttribute("id", user.user_id);

        let pfp_elem = document.createElement('img');
        pfp_elem.setAttribute("src", user.avatar_url);
        pfp_elem.setAttribute("alt", user.username + "\'s profile picture");
        list_elem.appendChild(pfp_elem);

        let name_elem = document.createElement('h3');
        name_elem.innerHTML = user.username + "#" + user.discriminator;
        list_elem.appendChild(name_elem);
        let song_elem = document.createElement('h5');
        song_elem.innerHTML = user.song_name + " by " + user.song_artist;
        list_elem.appendChild(song_elem);
        
        list_container.appendChild(list_elem);
        return;
    }
    return Error("Undefined user!");
}

socket.on("listeners_data_emit", (data) => {
    let active_listeners = data;
    console.log(active_listeners);
    // Remove current listeners
    for (let listener in current_listeners) {
        remove_user_entry(current_listeners[listener]);
    }
    // Loop through active listeners
    for (let listener in active_listeners) {
        create_user_entry(active_listeners[listener]);
        active_listeners.push(active_listeners[listener]);
    }
    // Update current listeners!
    current_listeners = active_listeners;
});