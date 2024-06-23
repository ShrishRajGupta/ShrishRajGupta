const setDarkMode = () => {
    $('#css-mode').attr('class', 'fas fa-cloud-moon btn btn-info')
    $('link#styles').attr('href', './css/style-gruvbox.css')
    $('#mode-text').text('-- Dark')
}

const setLightMode = () => {
    $('#css-mode').attr('class', 'fas fa-sun btn btn-info')
    $('link#styles').attr('href', './css/style-light.css')
    $('#mode-text').text('-- Light')
}

const setAutoThemeMode = () => {
    $('#css-mode').attr('class', 'fas fa-laptop btn btn-info')

    const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (isSystemDark) {
        $('link#styles').attr('href', './css/style-gruvbox.css')
    } else {
        $('link#styles').attr('href', './css/style-light.css')
    }

    $('#mode-text').text('-- System')
}

// auto -> dark -> light -> auto
const toggleTheme = () => {
    let mode = $('#mode-text').text()

    if (mode == "-- System") { // Auto mode is on
        setDarkMode();
        localStorage.setItem('dark', 'on');
    } else if(mode == "-- Dark") {  // Dark mode is on
        setLightMode();
        localStorage.setItem('dark', 'off');
    } else {    // Light mode is on
        setAutoThemeMode();
        localStorage.setItem('dark', 'auto');
    }
}

jQuery(function () {
    $('#css-mode').on('click', toggleTheme);

    let getDarkMode = localStorage.getItem('dark');
    // Check dark mode is on or off on page reload
    if (getDarkMode === 'off') {
        setLightMode();
    } else if (getDarkMode === "on") {
        setDarkMode();
    } else {
        setAutoThemeMode();
    }
});
