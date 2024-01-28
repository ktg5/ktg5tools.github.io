// Default config
var def_config = {
    channels: [],
    THISISYOURTWITCHACCOUNTINFORMATION_DONTSHARETHIS: {},
}

var storageKey = 'multittv-settings';
var userConfig = JSON.parse(localStorage.getItem(storageKey));
console.log(`user config:`, userConfig);

// Check if Local Storage is accessable
if (typeof(Storage) !== "undefined") {
    if (!localStorage.getItem(storageKey)) {
        // Stringify the config cuz that's how it is.
        localStorage.setItem(storageKey, JSON.stringify(def_config));
    }
} else {
    alert('Local Storage is not support or disabled -- settings will not work!')
}

// Streams
var streams = [];

// Functions
// Apply config settings
function applyConfig() {
    localStorage.setItem(storageKey, JSON.stringify(userConfig));
}

// Add stream
function addStream(name) {
    // Make iframe
    var stream = new Twitch.Player("stream-insert", {
        channel: `${name}`
    });
    // Add to channel list
    document.querySelector('.menu-title').insertAdjacentHTML('afterend', 
    `
    <button class="menu-button channel ${name}">
        <img src="https://wapi.wizebot.tv/api/avatars/${name}/sized/300x300" class="icon">
        <div class="channel-details">

            <div class="top">
                <div class="name">${name}</div>
            </div>
            <div class="bottom">
                <div class="viewers">0</div> <div class="spliter"> | </div> <div class="time">00:00:00</div>
            </div>
            <div class="remove"><i class="fa-solid fa-square-xmark"></i></div>

        </div>
    </button>
    `
    )
    // Add event listerner for focusing
    document.querySelector(`.menu-button.channel.${name}`).addEventListener('click', async () => {
        console.log(`focus ${name}`);
    });
    // finish
    document.querySelector('channels').childNodes.forEach(element => {
        if (name == element.src.split('?channel=')[1].split('&')[0]) {
            streams[streams.length] = {stream: stream, element: element, menubutton: document.querySelector(`.menu-button.channel.${name}`)};
        }
    });
    return console.log(`multittv: added stream`, stream);
}
// Get stream
function getStream(name) {
    var result;
    streams.forEach(stream => {
        if (name == stream.stream.getChannel()) {
            result = stream;
        }
    })
    return result;
}
// Remove stream
function removeStream(name) {
    // Get stream
    var stream = getStream(name);
    if (!stream) {
        console.error('NO STREAM FOUND!!!!!!!')
    } else {
        // Remove all elements
        stream.element.remove();
        stream.menubutton.remove();
        // Remove from streams list
        streams.splice(stream, 1)
        // finish
        return console.log(`multittv: removed stream`, stream);
    }
}
// Remove all streams
function removeAllStreams() {
    document.querySelectorAll('#stream-insert iframe').forEach(element => {
        var name = element.src.split('?channel=')[1].split('&')[0];
        element.remove();
        document.querySelector(`.menu-button.channel.${name}`).remove();
    });
}

// ON LOAD
window.onload = () => {
    // ######### User config #########
    // If welcome message hasn't been skipped
    if (!userConfig || !userConfig.THISISYOURTWITCHACCOUNTINFORMATION_DONTSHARETHIS.accessToken) {
        makeWindow(
            `Welcome to ktg5's MultiTTV`, 
            `Thanks for stopping by and using MultiTTV!
            <br>
            MultiTTV requires you to login using your Twitch account for the best experince.
            <br>
            Other elements on MultiTTV may ask you to login again, like chat or trying to follow a streamer, but those are not linked with MultiTTV.
            <br>
            We do not track you or save any bit of information about you when you visit MultiTTV.
            <br>
            If you have any issues, <a href="https://github.com/ktg5/multittv/issues" target="_blank">report them here!</a>`,
            'tolink',
            AuthLink
        );
    }

    // If config hasn't been made
    if (!userConfig) {
        window.location.reload();
    }

    // Check if menu was collapsed
    if (userConfig.collapsedMenu == true) {
        document.querySelector('menu.left').setAttribute('case', 'closed');
    } else {
        document.querySelector('menu.left').setAttribute('case', 'full');
    }

    // Check if got Twitch API information
    if (window.location.hash !== '') {
        if (window.location.hash.includes('access_token') && window.location.hash.includes('state')) {
            userConfig.THISISYOURTWITCHACCOUNTINFORMATION_DONTSHARETHIS.accessToken = window.location.hash.split('access_token=')[1].split('&')[0];
            userConfig.THISISYOURTWITCHACCOUNTINFORMATION_DONTSHARETHIS.accessState = window.location.hash.split('state=')[1].split('&')[0];
            applyConfig();

            window.location.hash = '';
            window.location.reload();
        }
    }



    
    // ######### Buttons & Menus #########
    document.querySelector('menu.left .menu-close').addEventListener('click', async () => {
        if (document.querySelector('menu.left').getAttribute('case') == 'full') {
            document.querySelector('menu.left').setAttribute('case', 'closed');
            userConfig.collapsedMenu = true;
            applyConfig();
        } else {
            document.querySelector('menu.left').setAttribute('case', 'full');
            userConfig.collapsedMenu = false;
            applyConfig();
        }
    });

    document.querySelector('menu.left .menu-button.add').addEventListener('click', async () => {
        makeWindow('Add a Channel', 'Use the input box below to add a channel to watch, then click the button below that.', 'input', 'addStream($THISINPUT)');
    });
    



    // ######### Ready #########
    document.querySelector('.loading-thingy').style.opacity = 0;
    setTimeout(() => {
        document.querySelector('.loading-thingy').style.display = "none";
    }, 500);




    // Checkers
    setInterval(() => {
        streams.forEach(stream => {
            // This is why we need user auth
            var channelName = stream.stream.getChannel();
            const endpoint = `https://api.twitch.tv/helix/streams?user_login=${channelName}`
            let authorization = `Bearer ${userConfig.THISISYOURTWITCHACCOUNTINFORMATION_DONTSHARETHIS.accessToken}`;
            let headers = {
                authorization,
                "Client-Id": 'jhcpxyjok7sx7d8ue6feytqh0m5ind',
            };
            fetch(endpoint, {
                headers,
            })
            .then((res) => res.json())
            // When we got the data
            .then((data) => {
                var streamData = data.data[0];

                // If this iframe is live
                if (streamData && streamData.type == 'live') {
                    // Vars
                    var viewerCount = streamData.viewer_count;
                    var startTime = streamData.started_at;

                    // Make sure opacity is not set
                    stream.menubutton.querySelector('.bottom').style.opacity = '';
                    // Get viewer count
                    stream.menubutton.querySelector('.viewers').innerHTML = viewerCount;
                    // Get time
                    stream.menubutton.querySelector('.time').innerHTML = `(time)`;
                } else {
                    stream.menubutton.querySelector('.bottom').style.opacity = '0';
                }
            });
        });
    }, 5000);
}