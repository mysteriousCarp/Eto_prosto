const alert = require('alert-node')
function test(config={text: 'hello would', count:14})
{
    for (let i = 0; i <= config.count; i++)
    {
        alert(config.text)
    }
    return {text: '213', result: 14 % 2}
}