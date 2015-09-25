export default function (el, onchange) {
    var text = el.querySelector('.wm-madlib__input__text');
    var btn = el.querySelector('.wm-madlib__input__btn');

    function submit() {
        onchange(text.value);
        text.blur();
        btn.removeAttribute('data-focus');
    }

    text.addEventListener('focus', () => { btn.setAttribute('data-focus', ''); });
    text.addEventListener('blur', evt => {
        // Wait for new activeElement
        setTimeout(() => {
            if (document.activeElement !== btn) {
                text.value = '';
                btn.removeAttribute('data-focus');
            }
        }, 0);
    });

    el.addEventListener('submit', evt => {
        evt.preventDefault();
        submit();
    });

    btn.addEventListener('click', evt => {
        evt.preventDefault();
        if (btn.hasAttribute('data-focus')) {
            submit();
        } else {
            text.value = '';
            text.focus();
        }
    });
}