document.addEventListener('DOMContentLoaded', function() {
    const button = document.createElement('button');
    button.innerHTML = '📺';
    button.style = {
        ...button.style,
        position: 'fixed',
        bottom: '0',
        left: '0',
        fontSize: '24px',
        padding: '10px',
        borderRadius: '50%',
        border: 'none',
        backgroundColor: '#f8f8f8',
        cursor: 'pointer',
    };
    document.body.appendChild(button);
    button.addEventListener('click', function() {
        browser.webfuseSession.startScreensharing();
    });
});
