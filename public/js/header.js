let tzOffset = new Date().getTimezoneOffset(),
    tzInput = document.getElementById('tzOffset');
tzInput.value = tzOffset*(-1)/60;
