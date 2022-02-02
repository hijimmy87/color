$('#timeout').ready(function() {
    let timeout = 5,
        elem = $('#timeout'),
        countdown = () => {
            timeout--;
            if (timeout == 0) {
                $('#desc').text('正在傳送...');
                location.href = '/';
            }
            else {
                elem.text(timeout);
                setTimeout(countdown, 1000);
            }
        }
    setTimeout(countdown, 1000);
})