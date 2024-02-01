/// Make options in menu
function makeMenuOption(type, option, desc, values, disableOpinions) {
    switch (type) {
        case 'selection':
            var disabledOutput = ``;
            if (disableOpinions) {
                disabledOutput = `aria-disabled='${disableOpinions}'`
            }
            return `
            <div class="menu-option">
                <div class="menu-name">${desc}</div>
                <select class="menu-select menu-action" name="${option}" ${disabledOutput}>
                    ${values}
                </select>
            </div>
            `
        case 'toggle':
            var disabledOutput = ``;
            if (disableOpinions) {
                disabledOutput = `aria-disabled='${disableOpinions}'`
            }
            return `
            <div class="menu-option">
                <div class="menu-name">${desc}</div>
                <button class="menu-toggle menu-action" name="${option}" ${disabledOutput}>
                    <div class="light ${userConfig[option]}"></div>
                </button>
            </div>
            `
        case 'input':
            var disabledOutput = ``;
            if (disableOpinions) {
                disabledOutput = `aria-disabled='${disableOpinions}'`
            }
            if (values == 'color') {
                return `
                <div class="menu-option">
                    <div class="menu-name">${desc}</div>
                    <div style="position: relative; left: 12px;">
                        <input type="text" data-coloris class="menu-color-picker menu-action" name="${option}" value="${userConfig[option] ?? '#ffffff'}" ${disabledOutput}>
                        <button class='menu-input-reset menu-action'>
                            <img src="https://raw.githubusercontent.com/ktg5/YT-HTML5-Player/main/img/reset.png" style="height: 1em;">
                        </button>
                    </div>
                </div>
                `
            } else if (values == 'text') {
                return `
                <div class="menu-option">
                    <div class="menu-name">${desc}</div>
                    <div>
                        <input type="text" class="menu-input menu-action" name="${option}" value="${userConfig[option] ??  ''}" ${disabledOutput}>
                        <button class='menu-input-reset menu-action' style="width: 2em;">
                            <img src="https://raw.githubusercontent.com/ktg5/YT-HTML5-Player/main/img/reset.png" style="height: 1em;">
                        </button>
                    </div>
                </div>
                `
            } else if (values == 'pxs') {
                return `
                <div class="menu-option">
                    <div class="menu-name" style="max-width: 12em;">${desc}</div>
                    <div style="position: relative; left: 12px;">
                        <input type="text" style="width: 4em;" class="menu-input menu-action" name="${option}" value="${userConfig[option] ??  ''}" ${disabledOutput}>px
                        <button class='menu-input-reset menu-action' style="width: 2em;">
                            <img src="https://raw.githubusercontent.com/ktg5/YT-HTML5-Player/main/img/reset.png" style="height: 1em;">
                        </button>
                    </div>
                </div>
                `
            } else if (values == 'url') {
                return `
                <div class="menu-option">
                    <div class="menu-name">${desc} (Must be an <kbd>https</kbd> link!)</div>
                    <div>
                        <input type="text" class="menu-input menu-action" name="${option}" value="${userConfig[option] ??  ''}" ${disabledOutput}>
                        <button class='menu-input-reset menu-action' style="width: 2em;">
                            <img src="https://raw.githubusercontent.com/ktg5/YT-HTML5-Player/main/img/reset.png" style="height: 1em;">
                        </button>
                    </div>
                </div>
                `
            }
    }
}

function toggleSettings() {
    if (document.querySelector('#settings-container').classList.contains('inactive')) {
        // Make active 
        document.querySelector('#settings-container').classList.remove('inactive')

        // Make settings
        var resetButtonHTML = `<i class="fa-solid fa-trash"></i> Restore defaults`;
        document.querySelector('#settings-popup #opinions').insertAdjacentHTML('beforeend',
        `
        ${makeMenuOption('toggle', 'muteOnAdd', 'Mute newly added streams.')}
        ${makeMenuOption('toggle', 'pauseOnFocus', 'Pause other streams when focusing a stream.')}
        ${makeMenuOption('toggle', 'openPastStreams', 'Open streams that were on last session.')}
        <br>
        <br>
        <button class="reset" onclick="">${resetButtonHTML}</button>
        `
        )

        // Event listener vars
        var resetCheck = 0;
        var resetButton = document.querySelector('#settings-popup #opinions .reset');
        var maxSeconds = 5;
        var seconds = maxSeconds;
        // Event listener for reset button
        resetButton.addEventListener('click', async () => {
            // If reset button hasn't been pressed
            if (resetCheck == 0) {
                resetCheck = 1;
                resetButton.classList.add('confirm');
                resetButton.innerHTML = `<i class="fa-solid fa-trash"></i> ARE YOU SURE??? (Click again within ${seconds} seconds)`;
                var checker = setInterval(() => {
                    if (seconds <= 1) {
                        // Clear & reset
                        resetButton.innerHTML = resetButtonHTML;
                        resetButton.classList.remove('confirm');
                        resetCheck = 0;
                        clearInterval(checker);
                        seconds = maxSeconds;
                    } else {
                        // Continue & count
                        seconds--;
                        resetButton.innerHTML = `<i class="fa-solid fa-trash"></i> ARE YOU SURE??? (Click again within ${seconds} seconds)`;
                    }
                }, 1000);
            } else if (resetCheck == 1) {
                // Stops internal
                seconds = 0;
                // Reset config
                resetConfig();
                makeWindow('Reset config', `Your config has been reset, refresh the page using the button below.<br>You should not need to re-authenticate your Twitch account, as that information was saved.`, 'tolink', window.location.href.split('#')[0])
            }
        });
        // Event listener to make the BUTTONS ACTUALLY WORK LIKE WHY
        var buttons = document.getElementsByClassName('menu-action');
        console.log(`buttons:`, buttons)
        for (let element of buttons) {
            // For disabling opinions that conflict with others
            function disableAria(element) {
                if (element.ariaDisabled !== null) {
                    var disableThese = element.ariaDisabled.split(',');
                    disableThese.forEach(target => {
                        var targetElement = document.getElementsByName(`${target}`)[0];
                        if (targetElement) {
                            if (element.childNodes[1].classList.contains('true')) {
                                targetElement.style.display = 'none';
                            } else if (element.childNodes[1].classList.contains('false')) {
                                targetElement.style.display = '';
                            }
                        }
                    });
                };
            }

            switch (element.classList[0]) {
                case 'menu-select':
                    element.addEventListener('click', async () => {
                        changeUserDB(element.name, element.value);
                        disableAria(element);
                    });
                break;

                case 'menu-toggle':
                    element.addEventListener('click', async () => {
                        var light = element.querySelector('.light')
                        if (userConfig[element.name] == true) {
                            userConfig[element.name] = false;
                            light.classList.remove('true');
                            light.classList.add('false');
                        } else {
                            userConfig[element.name] = true;
                            light.classList.remove('false');
                            light.classList.add('true');
                        }
                        applyConfig();
                        if (light.classList.contains("undefined")) element.childNodes[1].classList.remove('undefined')
                        disableAria(element);
                    });
                break;

                case 'menu-input':
                    element.addEventListener('change', async () => {
                        changeUserDB(element.name, element.value);
                        disableAria(element);
                    });
                break;

                case 'menu-color-picker':
                    element.addEventListener('change', async () => {
                        changeUserDB(element.name, element.value);
                        disableAria(element);
                    });
                break;

                case 'menu-input-reset':
                    element.addEventListener('click', async () => {
                        if (element.parentElement.children[0].classList.contains('clr-field')) {
                            var clr_field = element.parentElement.children[0];
                            changeUserDB(clr_field.children[1].name, null);
                            clr_field.children[1].value = '#ffffff';
                            clr_field.style.color = '#ffffff';
                            alert(`The "${clr_field.children[1].name}" setting has been reset.`);
                        } else {
                            changeUserDB(element.parentElement.children[0].name, null);
                            element.parentElement.children[0].value = '';
                            alert(`The "${element.parentElement.children[0].name}" setting has been reset.`);
                        }
                        disableAria(element);
                    });
                break;

                default:
                    alert(`One of the buttons for the settings can't find itself, please report this! "${element.classList}"`)
                break;
            }
        }
    } else {
        // Make ianctive
        document.querySelector('#settings-container').classList.add('inactive')
        // Remove opinions
        document.querySelector('#settings-popup #opinions').innerHTML = '';
    }
}