document.addEventListener('DOMContentLoaded', function () {

    // --- Eye toggle for password fields ---
    const toggleSpans = document.querySelectorAll('.toggle-password');

    toggleSpans.forEach(function(span) {
        span.addEventListener('click', function() {
            const input = document.querySelector(`#${this.dataset.target}`);
            const icon = this.querySelector('i');

            if (input.type === "password") {
                input.type = "text";
                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");
            } else {
                input.type = "password";
                icon.classList.remove("fa-eye-slash");
                icon.classList.add("fa-eye");
            }
        });
    });

    // --- Live password constraint checking ---
    const passwordInput = document.querySelector('.form-group .password-input input[name$="password1"]');
    const rules = {
        length: document.querySelector('#rule-length'),
        uppercase: document.querySelector('#rule-uppercase'),
        lowercase: document.querySelector('#rule-lowercase'),
        number: document.querySelector('#rule-number'),
        special: document.querySelector('#rule-special')
    };

    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            const val = passwordInput.value;

            rules.length.style.color = val.length >= 8 ? 'green' : 'red';
            rules.uppercase.style.color = /[A-Z]/.test(val) ? 'green' : 'red';
            rules.lowercase.style.color = /[a-z]/.test(val) ? 'green' : 'red';
            rules.number.style.color = /[0-9]/.test(val) ? 'green' : 'red';
            rules.special.style.color = /[!@#$%^&*(),.?":{}|<>]/.test(val) ? 'green' : 'red';
        });
    }

    // --- Confirm password matching ---
    const confirmInput = document.querySelector('.form-group .password-input input[name$="password2"]');
    const form = document.querySelector('form');

    let matchStatus = null;
    if (confirmInput) {
        matchStatus = document.createElement('div');
        matchStatus.setAttribute('aria-live', 'polite');
        matchStatus.style.fontSize = '0.9rem';
        matchStatus.style.marginTop = '0.35rem';
        matchStatus.style.display = 'none';
        confirmInput.closest('.form-group').appendChild(matchStatus);

        const updateMatchStatus = () => {
            const a = passwordInput ? passwordInput.value : '';
            const b = confirmInput.value;

            if (b.length === 0) {
                matchStatus.style.display = 'none';
                matchStatus.textContent = '';
                return;
            }

            if (a === b) {
                matchStatus.style.color = 'green';
                matchStatus.textContent = 'Passwords match.';
                matchStatus.style.display = 'block';
            } else {
                matchStatus.style.color = '#e53e3e';
                matchStatus.textContent = 'Passwords do not match.';
                matchStatus.style.display = 'block';
            }
        };

        confirmInput.addEventListener('input', updateMatchStatus);
        if (passwordInput) passwordInput.addEventListener('input', updateMatchStatus);
    }

    // Prevent form submission when passwords don't match
    if (form && confirmInput) {
        form.addEventListener('submit', (e) => {
            const a = passwordInput ? passwordInput.value : '';
            const b = confirmInput.value;
            if (a !== b) {
                e.preventDefault();
                if (matchStatus) {
                    matchStatus.style.color = '#e53e3e';
                    matchStatus.textContent = 'Passwords do not match.';
                    matchStatus.style.display = 'block';
                }
                confirmInput.focus();
            }
        });
    }

});
