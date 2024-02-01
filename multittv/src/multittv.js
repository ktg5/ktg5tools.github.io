// Default config
var def_config = {
    pastStreams: [],
    THISISYOURTWITCHACCOUNTINFORMATION_DONTSHARETHIS: {},
    welcomeMessage: false,
    muteOnAdd: true,
    pauseOnFocus: true,
    openPastStreams: false
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
async function addStream(name) {
    // Make sure channel isn't already added
    if (getStream(name)) {
        return alert('You already have this channel added IDIOT!!!');
    }
    // Also make sure stream amount is not above 9
    if (streams.length == 9) {
        return alert('You can only have a maximum of 9 streams!');
    }
    // Make iframe & apply settings
    var isMuted = false;
    if (userConfig.muteOnAdd !== false) {
        isMuted = true;
    }
    var stream = new Twitch.Player("stream-insert", {
        channel: `${name}`,
        muted: isMuted
    });
    // Add to channel list
    document.querySelector('.menu-channels').insertAdjacentHTML('beforeend', 
    `
    <button class="menu-button channel ${name.replace(/\d+/g, '')}">
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

    // Add event listener for closing the button
    document.querySelector(`.menu-button.channel.${name.replace(/\d+/g, '')} .remove`).addEventListener('click', async () => {
        removeStream(name);
    });
    // Add event listener for focusing
    document.querySelector(`.menu-button.channel.${name.replace(/\d+/g, '')}`).addEventListener('click', async () => {
        if (getStream(name)) {
            if (document.querySelector(`#channel-focus iframe.${name.replace(/\d+/g, '')}`)) {
                removeFocused();
            } else {
                let iframe = getStream(name).element;
                let focusElmnt = document.querySelector('#channel-focus')
                let channelContainer = document.querySelector('.channels-container');
                // If there's a current focused stream
                if (focusElmnt.querySelector('iframe')) {
                    focusElmnt.querySelector('iframe').remove();
                }
                // Check if menu button has "focus" class name, & remove
                if (document.querySelector('.menu-button.focus')) {
                    document.querySelector('.menu-button.focus').classList.remove('focus');
                }
                // Pause other streams if config is set
                if (userConfig.pauseOnFocus !== false) {
                    streams.forEach(stream => {
                        stream.stream.pause();
                    });
                }
                // Make Twitch embed
                new Twitch.Player("channel-focus", {
                    channel: `${name}`,
                    muted: false
                });
                focusElmnt.querySelector('iframe').classList.add(name.replace(/\d+/g, ''))
                // Add focus to menu button
                getStream(name).menubutton.classList.add('focus');
                // Add to focus div
                if (!channelContainer.classList.contains('focus')) {
                    channelContainer.classList.add('focus');
                }
            }
        }
    });

    // Add to chats list
    document.querySelector('.channel-selector').insertAdjacentHTML('beforeend', `<button class="${name}">${name}</button>`);
    document.querySelector(`.channel-selector button.${name}`).addEventListener('click', async () => {
        changeChatFrame(name);
    });
    changeChatFrame(name);

    // Add to channels list
    document.querySelector('channels').childNodes.forEach(element => {
        if (name == element.src.split('?channel=')[1].split('&')[0]) {
            streams[streams.length] = {name: name, stream: stream, element: element, menubutton: document.querySelector(`.menu-button.channel.${name.replace(/\d+/g, '')}`)};
            // Add to past streams
            userConfig.pastStreams = [];
            for (let i = 0; i < streams.length; i++) {
                const element = streams[i];
                userConfig.pastStreams[i] = element.name;
            }
            applyConfig();
        }
    });

    // Finish
    return console.log(`multittv: added stream`, stream);
}
// Add streamS
function addStreams(streamList) {
    if (Array.isArray(streamList)) {
        var loopCount = 0;
        var addLoop = setInterval(() => {
            if (streamList.length == loopCount) {
                clearInterval(addLoop);
            } else {
                addStream(streamList[loopCount]);
                loopCount++;
            }
        }, 100);
    } else {
        console.error('THE LIST MUST BE A ARRAY DICK HEAD!!!!!!')
    }
}
// Get stream
function getStream(name) {  
    var index = streams.findIndex((elmnt) => elmnt.name === name);
    return streams[index];
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
        // Remove from focus too
        if (document.querySelector(`#channel-focus iframe.${name.replace(/\d+/g, '')}`)) {
            removeFocused();
        }
        // Remove from streams list
        var index = streams.findIndex((elmnt) => elmnt.name === name);
        streams.splice(index, 1);
        // Remove from chat list
        document.querySelector(`.channel-selector button.${name}`).remove();
        // And remove chat frame if it matches with name
        removeChatFrame(name);
        // Remove from past streams list
        var nameIndex = userConfig.pastStreams.findIndex((elmnt) => elmnt === name);
        userConfig.pastStreams.splice(nameIndex, 1);
        applyConfig();
        // finish
        return console.log(`multittv: removed stream`, stream);
    }
}
// Remove all streams
function removeAllStreams() {
    // Remove streams
    document.querySelectorAll('#stream-insert iframe').forEach(element => {
        var name = element.src.split('?channel=')[1].split('&')[0];
        element.remove();
        document.querySelector(`.menu-button.channel.${name.replace(/\d+/g, '')}`).remove();
    });
    // Clear things
    streams = [];
    userConfig.pastStreams = [];
    applyConfig();
    // Remove chats
    document.querySelectorAll(`.channel-selector button`).forEach(span => {
        span.remove();
    });
    removeChatFrame();
    // Finish
    console.log('multittv: removed all streams', streams);
}
// Remove focused stream
function removeFocused() {
    let focusElmnt = document.querySelector('#channel-focus');
    let channelContainer = document.querySelector('.channels-container');

    if (channelContainer.classList.contains('focus')) {
        if (focusElmnt.querySelector('iframe')) {
            if (document.querySelector('.menu-button.focus')) {
                document.querySelector('.menu-button.focus').classList.remove('focus');
            }
            if (focusElmnt && focusElmnt.querySelector('iframe')) {
                focusElmnt.querySelector('iframe').remove();
            }
            if (channelContainer) {
                channelContainer.classList.remove('focus');
            }
            // Play other streams if config is set
            if (userConfig.pauseOnFocus !== false) {
                streams.forEach(stream => {
                    stream.stream.play();
                });
            }
        }
    }
}
// Add sample streams
function sampleStreams() {
    let streams = [
        'ktg5_',
        '1stpara',
        'bobross',
        'kaicenat',
        'eslcs',
        'shobuh',
        'leekbeats',
        'flexingseal',
        'adultswimclassic',
    ];
    addStreams(streams);
}

// Add chat iframe
function changeChatFrame(name) {
    // Remove past chat frame
    if (document.querySelector(`.channel-selector button.selected`)) {
        document.querySelector(`.channel-selector button.selected`).classList.remove('selected');
        document.querySelector('.chat-insert iframe').remove();
    }

    // Change selected chat opinion on right menu
    var chatOpinion = document.querySelector(`.channel-selector button.${name}`);
    if (chatOpinion) {
        chatOpinion.classList.add('selected');

        // Get parent url
        var parentURL = window.location.origin.split('//')[1];
        if (window.location.port !== '') {
            parentURL = parentURL.split(`:${window.location.port}`)[0];
        }

        // Add chat iframe
        document.querySelector('.chat-insert').innerHTML = `
        <iframe src="https://www.twitch.tv/embed/${name}/chat?parent=${parentURL}" frameborder="0"></iframe>
        `;
    }
}
// Remove chat iframe
function removeChatFrame(name) {
    if (name) {
        if (document.querySelector(`.chat-insert iframe`).src.split(name)[1]) {
            document.querySelector('.chat-insert iframe').remove();
            if (streams.length >= 1) {
                changeChatFrame(streams[streams.length - 1].name);
            }
        }
    } else {
        document.querySelector('.chat-insert iframe').remove();
    }
}

// Show welcome message
var helpTxt = `
<li>To add a stream, use the "Add a Channel" button at the bottom left.</li>
<li>To remove a stream, click on the "X" in a box button on the right of a channel in the left menu.</li>
<li>To focus a stream, click on the stream on the left menu.</li>
<li>To unfocus a stream, click on the black banner on the top of the focused stream or click on the channel highlighted in red in the channel menu.</li>
<li>You can also remove all the streams using the "Remove all Channels" button.</li>
<li>You can mess with the [work in progress] settings using the button at the bottom left.</li>
<br>
Remember, if you have any issues, <a href="${config.issuesPage}" target="_blank">report them here!</a>
`;
function showInfoMessage() {
    makeWindow(
        `<i class="fa-solid fa-circle-info"></i> Info Message.`, 
        helpTxt
    );
}

// Reset config
function resetConfig() {
    var accState = userConfig.THISISYOURTWITCHACCOUNTINFORMATION_DONTSHARETHIS.accessState;
    var accToken = userConfig.THISISYOURTWITCHACCOUNTINFORMATION_DONTSHARETHIS.accessToken;
    var welMessage = userConfig.welcomeMessage;

    userConfig = def_config;
    userConfig.THISISYOURTWITCHACCOUNTINFORMATION_DONTSHARETHIS.accessState = accState;
    userConfig.THISISYOURTWITCHACCOUNTINFORMATION_DONTSHARETHIS.accessToken = accToken;
    userConfig.welcomeMessage = welMessage;
    applyConfig();
}


// ON LOAD
window.onload = () => {
    // ######### User config #########
    // If config hasn't been made
    if (!userConfig) {
        window.location.reload();
    }

    // If welcome message hasn't been skipped
    if (userConfig) {
        if (!userConfig.THISISYOURTWITCHACCOUNTINFORMATION_DONTSHARETHIS.accessToken) {
            makeWindow(
                `<i class="fa-solid fa-circle-info"></i> Before using MultiTTV...`, 
                `Thanks for stopping by and using MultiTTV!
                <br>
                MultiTTV requires you to login using your Twitch account for the best experince.
                <br>
                Other elements on MultiTTV may ask you to login again, like chat or trying to follow a streamer, but those are not linked with MultiTTV.
                <br>
                We do not track you or save any bit of information about you when you visit MultiTTV.
                <br>
                If you are going to use chat within MultiTTV, make sure to allow cross-site cookies so that Twitch doesn't freak the hell out.
                <br>
                If you have any issues, <a href="${config.issuesPage}" target="_blank">report them here!</a>`,
                'tolink',
                AuthLink
            );
        } else if (!userConfig.welcomeMessage || userConfig.welcomeMessage !== true) {
            makeWindow(
                `<i class="fa-solid fa-circle-info"></i> Welcome to ktg5's MultiTTV!`, 
                `
                Here's the basics you'll need to know:
                <br>
                ${helpTxt}
                `,
                'accept',
                ['welcomeMessage', true]
            );
        }
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

            window.location.href = window.location.href.split('#')[0];
        }
    }

    // Check if there were channels added in last session
    if (userConfig.openPastStreams == true && userConfig.pastStreams) {
        addStreams(userConfig.pastStreams);
    }



    
    // ######### Buttons & Menus #########
    // Left
    // Close
    document.querySelector('menu.left .menu-close').addEventListener('click', async () => {
        if (document.querySelector('menu.left').getAttribute('case') == 'full') {
            document.querySelector('menu.left').setAttribute('case', 'closed');
            userConfig.collapsedMenu = true;
            applyConfig();
        } else {
            document.querySelector('menu.right').setAttribute('case', 'closed');
            document.querySelector('menu.left').setAttribute('case', 'full');
            userConfig.collapsedMenu = false;
            applyConfig();
        }
    });
    // Settings button
    document.querySelector('menu.left .menu-button.settings').addEventListener('click', async () => {
        toggleSettings();
    });

    // Right
    // Close
    document.querySelector('menu.right .menu-close').addEventListener('click', async () => {
        if (document.querySelector('menu.right').getAttribute('case') == 'full') {
            document.querySelector('menu.right').setAttribute('case', 'closed');
        } else {
            document.querySelector('menu.left').setAttribute('case', 'closed');
            document.querySelector('menu.right').setAttribute('case', 'full');
            userConfig.collapsedMenu = true;
            applyConfig();
        }
    });

    // Add event listener for adding channels
    document.querySelector('menu.left .menu-button.add').addEventListener('click', async () => {
        makeWindow('<i class="fa-solid fa-square-plus" aria-hidden="true"></i> Add a Channel', 'Use the input box below to add a channel to watch, then click the button below that.', 'input', 'addStream($THISINPUT)');
    });

    // Add event listener for closing all channels
    document.querySelector('.menu-button.removeall').addEventListener('click', async () => {
        removeAllStreams();
    });
    



    // ######### Ready #########
    document.querySelector('.loading-thingy').style.opacity = 0;
    setTimeout(() => {
        document.querySelector('.loading-thingy').style.display = "none";
    }, 500);




    // Checkers
    // Get amount of streams
    setInterval(() => {
        document.querySelector('#stream-insert').setAttribute('amount', document.querySelector('#stream-insert').childElementCount);
    });
    // Get stream info
    setInterval(() => {
        streams.forEach(stream => {
            // This is why we need user auth
            var channelName = stream.name;
            if (channelName) {
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
                        var startTime = new Date(streamData.started_at);
                        var currentTime = new Date()
                        var diffTime = new Date(currentTime - startTime);
                        var diffHrs = Math.floor((diffTime % 86400000) / 3600000);
    
                        // Make sure opacity is not set
                        stream.menubutton.querySelector('.bottom').style.opacity = '';
                        // Get viewer count
                        stream.menubutton.querySelector('.viewers').innerHTML = viewerCount;
                        // Get time
                        stream.menubutton.querySelector('.time').innerHTML = `${diffHrs}:${('0' + diffTime.getMinutes()).slice(-2)}:${('0' + diffTime.getSeconds()).slice(-2)}`;
                    } else {
                        stream.menubutton.querySelector('.bottom').style.opacity = '0';
                    }
                });    
            }
        });
    }, 5000);
}