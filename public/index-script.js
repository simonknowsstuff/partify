let socket = io();
let current_listeners = [];
let list_container = document.getElementById('list-container');
let listening_to;

function check_none() {
    let awkward_message = document.getElementById('none_listeners');
    if (list_container.innerHTML.trim().length === 0) {
        awkward_message.style.visibility = "visible";
        return;
    }
    awkward_message.style.visibility = "collapse";
    return;
}

function remove_user_entry(user) {
    if (user) {
        let user_entry = document.getElementById(user.user_id);
        if (user_entry) {
            user_entry.remove();
            check_none();
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
        // The button: (Comments added to easily digest this wacky piece of code with terrible variable naming)
        // Image anchor (for links)
        let pfp_anchor = document.createElement('a');
        pfp_anchor.setAttribute("href", "#");
        pfp_anchor.setAttribute("onclick",  "playuser(\"" + user.user_id + "\");");
        // The actual avatar URL
        let play_button = document.createElement('img');
        play_button.setAttribute("src", user.avatar_url);
        play_button.setAttribute("alt", user.username + "\'s profile picture");
        pfp_anchor.appendChild(play_button);
        // The underlayer play button image
        let pfp_button = document.createElement('span');
        pfp_button.setAttribute("class", "list_overlay_image");
        let pfp_image = document.createElement('img');
        pfp_image.setAttribute("src", "/public/images/play.svg");
        pfp_image.setAttribute("alt", "Play Button");
        pfp_button.appendChild(pfp_image);
        // Include the button image overlay to the anchor
        pfp_anchor.appendChild(pfp_button);
        // Add it to the list element 
        list_elem.appendChild(pfp_anchor);

        let name_elem = document.createElement('h3');
        name_elem.innerHTML = user.username + "#" + user.discriminator;
        list_elem.appendChild(name_elem);
        let song_elem = document.createElement('h5');
        song_elem.innerHTML = user.song_name + " by " + user.song_artist;

        list_elem.appendChild(song_elem);

        list_container.appendChild(list_elem);
        check_none();
        return;
    }
    return Error("Undefined user!");
}

socket.on("listeners_data_emit", (data) => {
    let active_listeners = [...new Set(data)]; // Get unique values only
    // Remove current listeners
    for (let listener in current_listeners) {
        remove_user_entry(current_listeners[listener]);
    }
    // Loop through active listeners
    for (let listener in active_listeners) {
        let user = active_listeners[listener];
        create_user_entry(user);
        if (listening_to) {
            if (user.user_id === listening_to.user_id) {
                if (user.youtube_link != listening_to.youtube_link) {
                    listening_to = user;
                    update_youtube_iframe(user.youtube_link);
                }
            }
        }
    }
    // Update current listeners!
    current_listeners = active_listeners;

    
});

function youtube_parser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}

function create_youtube_iframe(url) {
    let youtube_container = document.getElementById('youtube-container');
    let new_player = document.createElement('iframe');
    new_player.setAttribute('src', 'https://youtube.com/embed/' + youtube_parser(url) + '?autoplay=1&showinfo=0&controls=1');
    new_player.setAttribute('width', '500px');
    new_player.setAttribute('height', '200');
    new_player.setAttribute('frameborder', '0');
    new_player.setAttribute('id', 'youtube-player');
    youtube_container.appendChild(new_player);
    return;
}

function update_youtube_iframe(url) {
    let youtube_player = document.getElementById('youtube-player');
    let youtube_container = document.getElementById('youtube-container');
    if (youtube_player) {
        youtube_container.removeChild(youtube_player);
    }
    create_youtube_iframe(url);
    return;
}

function playuser(user_id) {
    let user = current_listeners.find((listener) => listener.user_id === user_id);
    if (user) {
        listening_to = user;
        document.getElementById('listening_to').innerText = "Listening with " + user.username;
        update_youtube_iframe(user.youtube_link);
        return;
    }
    return Error('User not found!');
}
