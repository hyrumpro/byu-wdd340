document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(event) {
        let isValid = true;
        this.querySelectorAll('input[required]').forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });

        if (!isValid) {
            event.preventDefault();
            alert('Please fill in all required fields.');
        }
    });
});