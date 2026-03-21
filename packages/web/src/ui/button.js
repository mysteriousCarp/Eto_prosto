export function createButton(callback) {
    const button = document.createElement('button');

    Object.assign(button.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: '1000',
        width: '60px',
        height: '60px',
        backgroundColor: '#333',
        border: 'none',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: '0'
    });

    const triangle = document.createElement('div');

    Object.assign(triangle.style, {
        width: '0',
        height: '0',
        borderTop: '15px solid transparent',
        borderBottom: '15px solid transparent',
        borderLeft: '22px solid white',
        transform: 'rotate(0deg)',
        display: 'block'
    });
    button.appendChild(triangle);
    button.onclick = callback;

    document.body.appendChild(button);
}