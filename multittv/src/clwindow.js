console.log('clwindow loaded')

function makeWindow(title, content, type, params) {
    var windowContainer = document.querySelector('.clwindow-container');
    if (!windowContainer) alert('Where the fuck is the ".clwindow-container" element??')
    if (windowContainer.classList.contains('inactive')) windowContainer.classList.remove('inactive');

    windowContainer.innerHTML = `
    <div class='clwindow'>
        <div class="window-tip" style="animation: moveBackground 5s linear infinite;">
            <text>${title}</text>
        </div>

        <div class="window-content">
        ${content}
        </div>
    </div>
    `
    var clwindow = document.getElementsByClassName('clwindow')[0];
    clwindow.innerHTML += `
    <style>
    @keyframes moveBackground {
        0% {background-position: 0;}
        100% {background-position: ${clwindow.clientWidth}px;}
    }
    </style>
    `
    
    switch (type) {
        case "accept":
            if (!params) alert('The "accept" clwindow type can\'t be used without a storage table, aka [(key), (value)]');
            clwindow.innerHTML += `
            <div class='window-buttons'>
                <button onclick="var config = JSON.parse(localStorage.getItem('${storageKey}'));config.${params[0]} = ${params[1]};localStorage.setItem('${storageKey}', JSON.stringify(config));closeWindow(this);">Accept & Close</button>
            </div>
            `
        break;

        case "input":
            if (!params) alert('The "input" clwindow type can\'t be used without a storage table, aka [(key), (value)]');
            console.log(params);
            if (params.includes('$THISINPUT')) {
                var params = params.replace('$THISINPUT', `document.querySelector('.window-raw-input').value`);
            }
            var exec = `if (document.querySelector('.window-raw-input').value !== '') { ${params};closeWindow(); } else { clShowWarning(); }`;

            clwindow.querySelector('.window-tip').insertAdjacentHTML('beforeend', 
            `
            <button onclick="closeWindow();">
                [X]
            </button>
            `
            )
            clwindow.querySelector('.window-content').insertAdjacentHTML('beforeend',
            `
            <div class='window-input'>
                <input type="text" placeholder="Enter channel name here" class='window-raw-input'></input>
            </div>
            `
            )
            clwindow.innerHTML += `
            <div class='window-buttons'>
                <button onclick="${exec}">Accept & Close</button>
            </div>
            `
            window.addEventListener('keydown', key => {
                if (key.key == 'Escape') {
                    closeWindow();
                }
            });
            clwindow.addEventListener('keydown', key => {
                if (key.key == 'Enter') {
                    eval(exec)
                }
            });
        break;

        case "tolink":
            if (!params && params.inclues('http')) alert('The "tolink" clwindow type can\'t be used without a link!');
            clwindow.innerHTML += `
            <div class='window-buttons'>
                <button onclick="window.location.href='${params}'">Go to Link</button>
            </div>
            `
        break;
    
        default:
            clwindow.innerHTML += `
            <div class='window-buttons'>
                <button onclick="closeWindow(this);">Close</button>
            </div>
            `
        break;
    }
};

function closeWindow(thisEle) {
    var windowContainer = document.querySelector('.clwindow-container');
    if (!windowContainer) alert('Where the fuck is the ".clwindow-container" element??')
    // Delete window
    var clwindow = document.getElementsByClassName('clwindow')[0];
    clwindow.remove();
    // Make window inactive
    windowContainer.classList.add('inactive');
}

function clShowWarning() {
    var clwindow = document.getElementsByClassName('clwindow')[0];
    let text = `
    <div class="window-warning">You must provide something in the input box above.</div>
    `
    if (clwindow.querySelector('.window-warning')) {
        closeWindow.querySelector('.window-warning').innerHTML = text;
    }
    clwindow.querySelector('.window-input').insertAdjacentHTML('beforeend', text)
}